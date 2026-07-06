import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addEmbedding,
  addPolicy,
  addState,
  addStorage,
  addSwarm,
  session,
  setConfig,
  Policy,
  State,
  Storage,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");

const raceHang = (promise, ms = 8000) =>
  Promise.race([promise, sleep(ms).then(() => HANG)]);

const addEcho = () =>
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

/**
 * queued() chains every call on the previous promise: when a queued dispatch
 * rejects, an already-queued concurrent dispatch used to reject with the SAME
 * foreign error WITHOUT ever running — a concurrent upsert was silently
 * dropped. The rejection must reach only the caller whose operation failed.
 */
test("Will run a queued upsert after a failing sibling upsert", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  addEmbedding({
    embeddingName: "fz1-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  // Only the FIRST indexing of item 1 fails: the failed upsert keeps the item
  // (fx4 contract) and take() lazily retries its embedding, so a permanent
  // failure would fail the search below for an unrelated reason.
  let firstIndexAttempt = true;
  addStorage({
    storageName: "fz1-storage",
    embedding: "fz1-embedding",
    createIndex: async (item) => {
      if (item.id === 1 && firstIndexAttempt) {
        firstIndexAttempt = false;
        await sleep(20);
        throw new Error("index-broken-for-item-1");
      }
      return item.text;
    },
  });
  const MOCK_COMPLETION = addEcho();
  const AGENT = addAgent({
    agentName: "fz1-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    storages: ["fz1-storage"],
  });
  const SWARM = addSwarm({
    swarmName: "fz1-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
  });

  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: AGENT, storageName: "fz1-storage" };

  // Both dispatched concurrently: the first rejects inside the queue while the
  // second is already queued behind it.
  const [first, second] = await raceHang(
    Promise.allSettled([
      Storage.upsert({ ...base, item: { id: 1, text: "broken" } }),
      Storage.upsert({ ...base, item: { id: 2, text: "healthy" } }),
    ])
  );
  const found = await raceHang(
    Storage.take({ ...base, search: "healthy", total: 5 })
  );
  await chatSession.dispose();

  const ok =
    first.status === "rejected" &&
    String(first.reason?.message).includes("index-broken-for-item-1") &&
    second.status === "fulfilled" &&
    Array.isArray(found) &&
    found.some((item) => item.id === 2);
  if (ok) {
    pass();
    return;
  }
  fail(
    `first=${first.status}:${String(first.reason?.message ?? "")} second=${
      second.status
    }:${String(second.reason?.message ?? "")} found=${JSON.stringify(found)}`
  );
});

/**
 * Same queue-poisoning hazard on ClientState.dispatch: a throwing user
 * dispatchFn used to reject a concurrently queued setState with the foreign
 * error and silently drop its write.
 */
test("Will apply a queued setState after a failing sibling setState", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  addState({
    stateName: "fz2-state",
    getDefaultState: () => ({ value: "initial" }),
  });
  const MOCK_COMPLETION = addEcho();
  const AGENT = addAgent({
    agentName: "fz2-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    states: ["fz2-state"],
  });
  const SWARM = addSwarm({
    swarmName: "fz2-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
  });

  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: AGENT, stateName: "fz2-state" };

  const [first, second] = await raceHang(
    Promise.allSettled([
      State.setState(async () => {
        await sleep(20);
        throw new Error("dispatch-fn-broken");
      }, base),
      State.setState(async () => ({ value: "applied" }), base),
    ])
  );
  const current = await raceHang(State.getState(base));
  await chatSession.dispose();

  const ok =
    first.status === "rejected" &&
    String(first.reason?.message).includes("dispatch-fn-broken") &&
    second.status === "fulfilled" &&
    current !== HANG &&
    current?.value === "applied";
  if (ok) {
    pass();
    return;
  }
  fail(
    `first=${first.status}:${String(first.reason?.message ?? "")} second=${
      second.status
    }:${String(second.reason?.message ?? "")} current=${JSON.stringify(current)}`
  );
});

/**
 * Same hazard on ClientPolicy._banQueue: a rejecting setBannedClients used to
 * reject the concurrently queued ban of ANOTHER client with the foreign error,
 * silently losing that ban.
 */
test("Will keep a queued ban after a failing sibling ban persistence", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_A = randomString();
  const CLIENT_B = randomString();

  let setCalls = 0;
  const TEST_POLICY = addPolicy({
    policyName: "fz3-policy",
    banMessage: "BLOCKED",
    persist: false,
    validateInput: async () => true,
    getBannedClients: async () => [],
    setBannedClients: async () => {
      setCalls += 1;
      await sleep(20);
      if (setCalls === 1) {
        throw new Error("ban-store-down");
      }
    },
  });
  const MOCK_COMPLETION = addEcho();
  const AGENT = addAgent({
    agentName: "fz3-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });
  const SWARM = addSwarm({
    swarmName: "fz3-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    policies: [TEST_POLICY],
  });

  const chatSession = session(CLIENT_A, SWARM);
  const chatSessionB = session(CLIENT_B, SWARM);
  const [first, second] = await raceHang(
    Promise.allSettled([
      Policy.banClient({
        clientId: CLIENT_A,
        policyName: TEST_POLICY,
        swarmName: SWARM,
      }),
      Policy.banClient({
        clientId: CLIENT_B,
        policyName: TEST_POLICY,
        swarmName: SWARM,
      }),
    ])
  );
  const bannedB = await raceHang(
    Policy.hasBan({
      clientId: CLIENT_B,
      policyName: TEST_POLICY,
      swarmName: SWARM,
    })
  );
  await chatSession.dispose();
  await chatSessionB.dispose();

  const ok =
    first.status === "rejected" &&
    String(first.reason?.message).includes("ban-store-down") &&
    second.status === "fulfilled" &&
    bannedB === true;
  if (ok) {
    pass();
    return;
  }
  fail(
    `first=${first.status}:${String(first.reason?.message ?? "")} second=${
      second.status
    }:${String(second.reason?.message ?? "")} bannedB=${String(bannedB)}`
  );
});

/**
 * ClientSession.execute fires agent.execute without await. ClientAgent guards
 * its own rejections, but ClientOperator did not: a throwing operator connector
 * raised an unhandled rejection (host crash) and left the completion hanging
 * until the operator timeout.
 */
test("Will survive a throwing operator connector without unhandled rejection", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_ENABLE_OPERATOR_TIMEOUT: true,
    CC_OPERATOR_SIGNAL_TIMEOUT: 500,
  });
  const CLIENT_ID = randomString();

  const unhandled = [];
  const onUnhandled = (error) => {
    unhandled.push(String(error?.message ?? error));
  };
  process.on("unhandledRejection", onUnhandled);

  const AGENT = addAgent({
    agentName: "fz4-agent",
    operator: true,
    connectOperator: () => () => {
      throw new Error("operator-connector-broken");
    },
  });
  const SWARM = addSwarm({
    swarmName: "fz4-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
  });

  const chatSession = session(CLIENT_ID, SWARM);
  // complete() rejects by contract: the connector error is surfaced through
  // errorSubject to the caller instead of crashing the host process.
  const result = await raceHang(
    chatSession.complete("hello").then(
      (value) => `resolved:${value}`,
      (error) => `rejected:${error.message}`
    ),
    4000
  );
  await sleep(100);
  await chatSession.dispose();
  process.off("unhandledRejection", onUnhandled);

  if (result === "rejected:operator-connector-broken" && unhandled.length === 0) {
    pass();
    return;
  }
  fail(
    `result=${String(result === HANG ? "HANG" : result)} unhandled=${JSON.stringify(
      unhandled
    )}`
  );
});
