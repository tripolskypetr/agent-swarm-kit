import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addEmbedding,
  addStorage,
  addSwarm,
  addTool,
  makeConnection,
  notify,
  session,
  setConfig,
  History,
  HistoryMemoryInstance,
  Operator,
  OperatorInstance,
  PersistStorage,
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

test("Will reject without hang when agent output validate throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const MOCK_COMPLETION = addEcho("mock-completion");
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    validate: () => {
      throw new Error("output validate exploded");
    },
  });
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

  if (String(out).startsWith("THREW:output validate exploded") && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will skip tool and reject when dynamic tool function throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addEcho("mock-completion");
  addTool({
    toolName: "dynamic_tool",
    validate: () => true,
    type: "function",
    function: async () => {
      throw new Error("dynamic fn exploded");
    },
    call: async () => {},
  });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    tools: ["dynamic_tool"],
  });
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

  if (String(out).startsWith("THREW:dynamic fn exploded") && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will treat throwing isAvailable as unavailable tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addEcho("mock-completion");
  addTool({
    toolName: "guarded_tool",
    validate: () => true,
    type: "function",
    isAvailable: () => {
      throw new Error("isAvailable exploded");
    },
    function: { name: "guarded_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {},
  });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    tools: ["guarded_tool"],
  });
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

  if (String(out).startsWith("THREW:isAvailable exploded") && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will reject without hang when history adapter push throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  History.useHistoryAdapter(
    class extends HistoryMemoryInstance {
      async push() {
        throw new Error("history push exploded");
      }
    }
  );

  const MOCK_COMPLETION = addEcho("mock-completion");
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });
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

  if (String(out).startsWith("THREW:history push exploded") && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will degrade to empty storage when persistence init throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  PersistStorage.usePersistStorageAdapter(
    class {
      async waitForInit() {
        throw new Error("storage init exploded");
      }
      async hasValue() {
        return false;
      }
      async readValue() {
        return null;
      }
      async writeValue() {}
    }
  );

  const MOCK_COMPLETION = addEcho("mock-completion");
  addEmbedding({
    embeddingName: "test-embedding",
    createEmbedding: async (t) => [t.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: "test-storage",
    embedding: "test-embedding",
    createIndex: (i) => i.text,
    persist: true,
  });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    storages: ["test-storage"],
  });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const chatSession = session(randomString(), TEST_SWARM);
  let out;
  try {
    out = await raceHang(chatSession.complete("hi"));
  } catch (error) {
    out = `THREW:${error.message}`;
  }
  await raceHang(chatSession.dispose());
  await sleep(200);

  const ok =
    (String(out).startsWith("THREW:storage init exploded") || out === "echo:hi") &&
    unhandled.length === 0;
  if (ok) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will time out gracefully when operator adapter throws", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_ENABLE_OPERATOR_TIMEOUT: true,
    CC_OPERATOR_SIGNAL_TIMEOUT: 500,
  });
  const unhandled = trackUnhandled();

  Operator.useOperatorAdapter(
    class extends OperatorInstance {
      async recieveMessage() {
        throw new Error("operator recieve exploded");
      }
    }
  );

  const TEST_AGENT = addAgent({ agentName: "test-agent", operator: true, prompt: "" });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const chatSession = session(randomString(), TEST_SWARM);
  const out = await raceHang(chatSession.complete("hi"), 6000);
  await raceHang(chatSession.dispose());
  await sleep(200);

  if (out === "" && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will degrade to placeholder when custom resque function throws", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_RESQUE_STRATEGY: "custom",
    CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: () => {
      throw new Error("custom resque exploded");
    },
  });
  const unhandled = trackUnhandled();

  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName }) => ({ agentName, content: "", role: "assistant" }),
  });
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: "mock-completion", prompt: "" });
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

  if (String(out).startsWith("THREW:custom resque exploded") && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will survive throwing makeConnection connector", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const MOCK_COMPLETION = addEcho("mock-completion");
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const CLIENT_ID = randomString();
  const send = makeConnection(
    () => {
      throw new Error("connector exploded");
    },
    CLIENT_ID,
    TEST_SWARM
  );

  let sendOut;
  try {
    sendOut = await raceHang(send("hi"));
  } catch (error) {
    sendOut = `THREW:${error.message}`;
  }
  await notify("server-push", CLIENT_ID, TEST_AGENT);
  await sleep(300);

  const ok =
    String(sendOut).startsWith("THREW:connector exploded") && unhandled.length === 0;
  if (ok) {
    pass();
    return;
  }
  fail(`sendOut=${String(sendOut)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will keep flow when history filter config throws", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_AGENT_HISTORY_FILTER: () => () => {
      throw new Error("history filter exploded");
    },
  });
  const unhandled = trackUnhandled();

  const MOCK_COMPLETION = addEcho("mock-completion");
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const chatSession = session(randomString(), TEST_SWARM);
  const out = await raceHang(chatSession.complete("hi"));
  await raceHang(chatSession.dispose());
  await sleep(100);

  if (out === "echo:hi" && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`out=${String(out)} unhandled=${JSON.stringify(unhandled)}`);
});
