import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addEmbedding,
  addState,
  addStorage,
  addSwarm,
  addTool,
  cancelOutput,
  commitToolOutput,
  runStatelessForce,
  session,
  setConfig,
  State,
  Storage,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (promise, ms = 8000) =>
  Promise.race([promise, sleep(ms).then(() => HANG)]);

test("Will not run the next tool after commitCancelOutput", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  let aCalled = false;
  let bCalled = false;
  let afterToolCalls = 0;

  addCompletion({
    completionName: "fx1-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "with-tools") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            { function: { name: "fx1_cancel", arguments: {} } },
            { function: { name: "fx1_next", arguments: {} } },
          ],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "fx1_cancel",
    validate: () => true,
    type: "function",
    function: { name: "fx1_cancel", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ clientId, agentName }) => {
      aCalled = true;
      await cancelOutput(clientId, agentName);
    },
  });
  addTool({
    toolName: "fx1_next",
    validate: () => true,
    type: "function",
    function: { name: "fx1_next", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      bCalled = true;
      await commitToolOutput(toolId, "should-not-happen", clientId, agentName);
    },
  });
  const AGENT = addAgent({
    agentName: "fx1-agent",
    completion: "fx1-completion",
    prompt: "",
    maxToolCalls: 5,
    tools: ["fx1_cancel", "fx1_next"],
    callbacks: {
      onAfterToolCalls: () => {
        afterToolCalls += 1;
      },
    },
  });
  const SWARM = addSwarm({ swarmName: "fx1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await raceHang(chatSession.complete("with-tools"));
  await sleep(300);
  await chatSession.dispose();

  const ok =
    result === "" && aCalled && !bCalled && afterToolCalls === 1;
  if (ok) {
    pass();
    return;
  }
  fail(
    `result=${String(result)} aCalled=${aCalled} bCalled=${bCalled} afterToolCalls=${afterToolCalls}`
  );
});

test("Will not hang the session when getCompletion throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  addCompletion({
    completionName: "fx2-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "boom") {
        throw new Error("completion-provider-down");
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "fx2-agent", completion: "fx2-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "fx2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  // The broken completion must settle the exchange (either a resque
  // placeholder or the surfaced error), never hang the waiter.
  const first = await raceHang(
    chatSession.complete("boom").catch((error) => `rejected:${error.message}`)
  );
  // The next exchange must go through untouched.
  const second = await raceHang(chatSession.complete("after"));
  await chatSession.dispose();

  const ok = first !== HANG && second === "echo:after";
  if (ok) {
    pass();
    return;
  }
  fail(`first=${String(first)} second=${String(second)}`);
});

test("Will recover a late tool error after an earlier failed validation", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  addCompletion({
    completionName: "fx3-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "bad") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fx3_invalid", arguments: {} } }],
        };
      }
      if (last.content === "late") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fx3_late", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "fx3_invalid",
    validate: () => false,
    type: "function",
    function: { name: "fx3_invalid", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {},
  });
  addTool({
    toolName: "fx3_late",
    validate: () => true,
    type: "function",
    function: { name: "fx3_late", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "late-out", clientId, agentName);
      // Let the tool status chain consume TOOL_COMMIT and finish before the
      // late error fires, so recovery depends on _activeToolChains only.
      await sleep(50);
      throw new Error("late-crash");
    },
  });
  const AGENT = addAgent({
    agentName: "fx3-agent",
    completion: "fx3-completion",
    prompt: "",
    tools: ["fx3_invalid", "fx3_late"],
  });
  const SWARM = addSwarm({ swarmName: "fx3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  // Phase 1: failed tool validation resurrects with a placeholder. A leaked
  // _activeToolChains counter here would break the late-error recovery below.
  const first = await raceHang(
    chatSession.complete("bad").catch((error) => `rejected:${error.message}`)
  );
  // Phase 2: the tool throws after commitToolOutput, when no chain is
  // consuming tool events anymore — recovery must emit an output.
  const second = await raceHang(
    chatSession.complete("late").catch((error) => `rejected:${error.message}`)
  );
  await sleep(200);
  await chatSession.dispose();

  const ok = first !== HANG && second !== HANG;
  if (ok) {
    pass();
    return;
  }
  fail(`first=${String(first)} second=${String(second)}`);
});

test("Will retry embeddings after a failed upsert instead of caching the rejection", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  let embeddingBroken = true;

  addCompletion({
    completionName: "fx4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addEmbedding({
    embeddingName: "fx4-embedding",
    createEmbedding: async (text) => {
      if (embeddingBroken) {
        throw new Error("embedding-provider-down");
      }
      return [text.length];
    },
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: "fx4-storage",
    embedding: "fx4-embedding",
    createIndex: (item) => item.text,
  });
  const AGENT = addAgent({
    agentName: "fx4-agent",
    completion: "fx4-completion",
    prompt: "",
    storages: ["fx4-storage"],
  });
  const SWARM = addSwarm({ swarmName: "fx4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);

  const upsertError = await Storage.upsert({
    clientId: CLIENT_ID,
    agentName: AGENT,
    storageName: "fx4-storage",
    item: { id: 1, text: "hello" },
  }).then(
    () => null,
    (error) => error
  );

  embeddingBroken = false;

  const found = await raceHang(
    Storage.take({
      search: "hello",
      total: 5,
      clientId: CLIENT_ID,
      agentName: AGENT,
      storageName: "fx4-storage",
    }).then(
      (items) => items,
      (error) => `rejected:${error.message}`
    )
  );
  await chatSession.dispose();

  const ok =
    upsertError !== null &&
    Array.isArray(found) &&
    found.length === 1 &&
    found[0].id === 1;
  if (ok) {
    pass();
    return;
  }
  fail(`upsertError=${String(upsertError)} found=${JSON.stringify(found)}`);
});

test("Will append the stateless run input as a user message", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  let lastSeen = null;

  addCompletion({
    completionName: "fx5-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      lastSeen = { role: last.role, content: last.content };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "fx5-agent", completion: "fx5-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "fx5-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await raceHang(runStatelessForce("ghost", CLIENT_ID));
  await chatSession.dispose();

  const ok =
    result === "echo:ghost" &&
    lastSeen !== null &&
    lastSeen.role === "user" &&
    lastSeen.content === "ghost";
  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} lastSeen=${JSON.stringify(lastSeen)}`);
});

test("Will survive a rejecting state persistence adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();

  addCompletion({
    completionName: "fx6-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addState({
    stateName: "fx6-state",
    getDefaultState: () => ({ value: "default" }),
    setState: async () => {
      throw new Error("persist-adapter-down");
    },
  });
  const AGENT = addAgent({
    agentName: "fx6-agent",
    completion: "fx6-completion",
    prompt: "",
    states: ["fx6-state"],
  });
  const SWARM = addSwarm({ swarmName: "fx6-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);

  const setResult = await raceHang(
    State.setState(() => ({ value: "updated" }), {
      clientId: CLIENT_ID,
      agentName: AGENT,
      stateName: "fx6-state",
    }).then(
      () => "settled",
      (error) => `rejected:${error.message}`
    )
  );
  const current = await raceHang(
    State.getState({
      clientId: CLIENT_ID,
      agentName: AGENT,
      stateName: "fx6-state",
    })
  );
  await chatSession.dispose();

  const ok =
    setResult !== HANG &&
    current !== HANG &&
    current !== null &&
    current.value === "updated";
  if (ok) {
    pass();
    return;
  }
  fail(`setResult=${String(setResult)} current=${JSON.stringify(current)}`);
});
