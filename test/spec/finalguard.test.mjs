import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addEmbedding,
  addMCP,
  addState,
  addStorage,
  addSwarm,
  makeAutoDispose,
  session,
  setConfig,
  Chat,
  State,
  Storage,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (p, ms = 8000) => Promise.race([p, sleep(ms).then(() => HANG)]);

const trackUnhandled = () => {
  const unhandled = [];
  process.on("unhandledRejection", (reason) => {
    unhandled.push(String(reason?.message ?? reason));
  });
  return unhandled;
};

const addEcho = (name) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will reject without hang when MCP listTools throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const MOCK_COMPLETION = addEcho("mock-completion");
  const TEST_MCP = addMCP({
    mcpName: "test-mcp",
    listTools: async () => {
      throw new Error("listTools exploded");
    },
    callTool: async () => {},
  });
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "", mcp: [TEST_MCP] });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const chatSession = session(randomString(), TEST_SWARM);
  let out;
  try {
    out = await raceHang(chatSession.complete("hi"));
  } catch (error) {
    out = `THREW:${error.message}`;
  }
  await raceHang(chatSession.dispose());
  await sleep(100);

  if (String(out).startsWith("THREW:listTools exploded") && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will keep storage queue alive after throwing createIndex", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addEcho("mock-completion");
  addEmbedding({
    embeddingName: "test-embedding",
    createEmbedding: async (t) => [t.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  let boom = true;
  addStorage({
    storageName: "test-storage",
    embedding: "test-embedding",
    createIndex: (i) => {
      if (boom) throw new Error("createIndex exploded");
      return i.text;
    },
  });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    storages: ["test-storage"],
  });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const base = { clientId: CLIENT_ID, agentName: TEST_AGENT, storageName: "test-storage" };
  let first = "";
  try {
    await raceHang(Storage.upsert({ ...base, item: { id: 1, text: "x" } }));
  } catch (error) {
    first = error.message;
  }
  boom = false;
  const second = await raceHang(Storage.upsert({ ...base, item: { id: 2, text: "y" } }));
  const items = await raceHang(Storage.list(base));
  await chatSession.dispose();
  await sleep(100);

  const ok =
    first.includes("createIndex exploded") &&
    second !== HANG &&
    items !== HANG &&
    items.some((i) => i.id === 2) &&
    unhandled.length === 0;
  if (ok) {
    pass();
    return;
  }
  fail(`first=${first} items=${JSON.stringify(items)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will keep state queue alive after throwing dispatch", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addEcho("mock-completion");
  addState({ stateName: "test-state", getDefaultState: () => ({ v: 0 }) });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    states: ["test-state"],
  });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const context = { clientId: CLIENT_ID, agentName: TEST_AGENT, stateName: "test-state" };
  let first = "";
  try {
    await raceHang(
      State.setState(() => {
        throw new Error("dispatch exploded");
      }, context)
    );
  } catch (error) {
    first = error.message;
  }
  const second = await raceHang(State.setState(() => ({ v: 7 }), context));
  const got = await raceHang(State.getState(context));
  await chatSession.dispose();
  await sleep(100);

  const ok =
    first.includes("dispatch exploded") &&
    second !== HANG &&
    got !== HANG &&
    got.v === 7 &&
    unhandled.length === 0;
  if (ok) {
    pass();
    return;
  }
  fail(`first=${first} got=${JSON.stringify(got)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will deliver rejection from throwing calculateSimilarity in take", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addEcho("mock-completion");
  addEmbedding({
    embeddingName: "test-embedding",
    createEmbedding: async (t) => [t.length],
    calculateSimilarity: async () => {
      throw new Error("similarity exploded");
    },
  });
  addStorage({ storageName: "test-storage", embedding: "test-embedding", createIndex: (i) => i.text });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    storages: ["test-storage"],
  });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const base = { clientId: CLIENT_ID, agentName: TEST_AGENT, storageName: "test-storage" };
  await Storage.upsert({ ...base, item: { id: 1, text: "aa" } });
  let takeError = "";
  try {
    await raceHang(Storage.take({ ...base, search: "aa", total: 5, score: 0.1 }));
  } catch (error) {
    takeError = error.message;
  }
  await chatSession.dispose();
  await sleep(100);

  if (takeError.includes("similarity exploded") && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`takeError=${takeError} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will survive throwing onDestroy in makeAutoDispose timer", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const MOCK_COMPLETION = addEcho("mock-completion");
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const CLIENT_ID = randomString();
  session(CLIENT_ID, TEST_SWARM);
  const { tick } = makeAutoDispose(CLIENT_ID, TEST_SWARM, {
    timeoutSeconds: 1,
    onDestroy: () => {
      throw new Error("onDestroy exploded");
    },
  });
  tick();
  await sleep(2_500);

  if (unhandled.length === 0) {
    pass();
    return;
  }
  fail(`unhandled=${JSON.stringify(unhandled)}`);
});

test("Will survive throwing chat onDispose in cleanup interval", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_CHAT_INACTIVITY_CHECK: 100,
    CC_CHAT_INACTIVITY_TIMEOUT: 300,
  });
  const unhandled = trackUnhandled();

  Chat.useChatCallbacks({
    onDispose: () => {
      throw new Error("chat onDispose exploded");
    },
  });

  const MOCK_COMPLETION = addEcho("mock-completion");
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const CLIENT_ID = randomString();
  await Chat.beginChat(CLIENT_ID, TEST_SWARM);
  const answer = await Chat.sendMessage(CLIENT_ID, "ping", TEST_SWARM);
  await sleep(1_000);

  if (answer === "echo:ping" && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`answer=${String(answer)} unhandled=${JSON.stringify(unhandled)}`);
});
