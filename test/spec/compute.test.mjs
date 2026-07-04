import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addState,
  addStorage,
  addEmbedding,
  addCompute,
  session,
  setConfig,
  State,
  SharedState,
  Storage,
  SharedStorage,
  Compute,
  SharedCompute,
  Schema,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const addEcho = () =>
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will cache compute data and recalculate on bound state change", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let computeCalls = 0;

  addState({
    stateName: "test-state",
    getDefaultState: () => ({ counter: 0 }),
  });

  addCompute({
    computeName: "test-compute",
    dependsOn: ["test-state"],
    getComputeData: async () => {
      computeCalls += 1;
      return { calls: computeCalls };
    },
    middlewares: [async (data) => ({ ...data, mw: true })],
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    states: ["test-state"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const first = await Compute.getComputeData(CLIENT_ID, "test-compute");
  const second = await Compute.getComputeData(CLIENT_ID, "test-compute");
  const cachedOk = first.calls === 1 && second.calls === 1 && second.mw === true;

  await State.setState(() => ({ counter: 1 }), {
    clientId: CLIENT_ID,
    agentName: TEST_AGENT,
    stateName: "test-state",
  });
  await sleep(50);
  const third = await Compute.getComputeData(CLIENT_ID, "test-compute");
  await chatSession.dispose();

  if (cachedOk && third.calls === 2) {
    pass();
    return;
  }
  fail(`first=${JSON.stringify(first)} second=${JSON.stringify(second)} third=${JSON.stringify(third)}`);
});

test("Will force compute refetch via Compute.update", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let computeCalls = 0;

  addCompute({
    computeName: "test-compute",
    getComputeData: async () => {
      computeCalls += 1;
      return { calls: computeCalls };
    },
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const first = await Compute.getComputeData(CLIENT_ID, "test-compute");
  await Compute.update(CLIENT_ID, "test-compute");
  const second = await Compute.getComputeData(CLIENT_ID, "test-compute");
  await chatSession.dispose();

  if (first.calls === 1 && second.calls === 2) {
    pass();
    return;
  }
  fail(`first=${JSON.stringify(first)} second=${JSON.stringify(second)}`);
});

test("Will serve shared compute without dependsOn", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  let computeCalls = 0;

  addCompute({
    computeName: "test-compute",
    shared: true,
    getComputeData: async () => {
      computeCalls += 1;
      return { shared: true, calls: computeCalls };
    },
  });

  const data = await SharedCompute.getComputeData("test-compute");

  if (data.shared === true && data.calls === 1) {
    pass();
    return;
  }
  fail(`data=${JSON.stringify(data)}`);
});

test("Will set, read and clear shared state", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addState({
    stateName: "test-state",
    shared: true,
    getDefaultState: () => ({ total: 0 }),
  });

  await SharedState.setState(async (prev) => ({ total: prev.total + 5 }), "test-state");
  const value = await SharedState.getState("test-state");
  const cleared = await SharedState.clearState("test-state");

  if (value.total === 5 && cleared.total === 0) {
    pass();
    return;
  }
  fail(`value=${JSON.stringify(value)} cleared=${JSON.stringify(cleared)}`);
});

test("Will apply state middlewares and reset via clearState", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  addState({
    stateName: "test-state",
    getDefaultState: () => ({ v: 0 }),
    middlewares: [async (state) => ({ ...state, mw: true })],
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    states: ["test-state"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const context = { clientId: CLIENT_ID, agentName: TEST_AGENT, stateName: "test-state" };
  await State.setState(() => ({ v: 1 }), context);
  const afterSet = await State.getState(context);
  const afterClear = await State.clearState(context);
  await chatSession.dispose();

  if (afterSet.v === 1 && afterSet.mw === true && afterClear.v === 0 && !afterClear.mw) {
    pass();
    return;
  }
  fail(`afterSet=${JSON.stringify(afterSet)} afterClear=${JSON.stringify(afterClear)}`);
});

test("Will search storage by similarity and fire storage callbacks", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const updates = [];

  addEmbedding({
    embeddingName: "test-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });

  addStorage({
    storageName: "test-storage",
    embedding: "test-embedding",
    createIndex: (item) => item.text,
    callbacks: {
      onUpdate: (items) => updates.push(items.length),
    },
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    storages: ["test-storage"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const base = { clientId: CLIENT_ID, agentName: TEST_AGENT, storageName: "test-storage" };
  await Storage.upsert({ ...base, item: { id: 1, text: "aa" } });
  await Storage.upsert({ ...base, item: { id: 2, text: "bb" } });
  await Storage.upsert({ ...base, item: { id: 3, text: "ccc" } });
  const found = await Storage.take({ ...base, search: "dd", total: 5, score: 0.5 });
  const filtered = await Storage.list({ ...base, filter: (item) => item.text === "ccc" });
  await chatSession.dispose();

  const foundIds = found.map((item) => item.id).sort().join(",");
  const ok =
    foundIds === "1,2" &&
    filtered.length === 1 &&
    filtered[0].id === 3 &&
    updates.join(",") === "1,2,3";

  if (ok) {
    pass();
    return;
  }
  fail(`foundIds=${foundIds} filtered=${JSON.stringify(filtered)} updates=${updates}`);
});

test("Will share storage items between contexts", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addEmbedding({
    embeddingName: "test-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });

  addStorage({
    storageName: "test-storage",
    shared: true,
    embedding: "test-embedding",
    createIndex: (item) => item.text,
  });

  await SharedStorage.upsert({ id: 1, text: "shared-item" }, "test-storage");
  const listed = await SharedStorage.list("test-storage");
  const got = await SharedStorage.get(1, "test-storage");

  if (listed.length === 1 && got?.text === "shared-item") {
    pass();
    return;
  }
  fail(`listed=${JSON.stringify(listed)} got=${JSON.stringify(got)}`);
});

test("Will serialize objects without undefined separators and keep session memory", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false, CC_PERSIST_MEMORY_STORAGE: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const serialized = Schema.serialize({ user_name: "John", details: { age_value: "33" } });
  await Schema.writeSessionMemory(CLIENT_ID, { topic: "billing" });
  const memory = await Schema.readSessionMemory(CLIENT_ID);
  await chatSession.dispose();

  const ok =
    serialized.includes("User name: John") &&
    serialized.includes("Age value: 33") &&
    !serialized.includes("undefined") &&
    memory.topic === "billing";

  if (ok) {
    pass();
    return;
  }
  fail(`serialized=${JSON.stringify(serialized)} memory=${JSON.stringify(memory)}`);
});
