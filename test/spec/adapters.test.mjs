import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  addState,
  addStorage,
  addEmbedding,
  session,
  commitToolOutput,
  commitAssistantMessageForce,
  executeForce,
  getAgentHistory,
  getPayload,
  getSessionContext,
  setConfig,
  State,
  Storage,
  Operator,
  OperatorInstance,
  PersistState,
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

test("Will answer through custom operator adapter with operator callbacks", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const events = [];

  Operator.useOperatorAdapter(
    class extends OperatorInstance {
      async recieveMessage(message) {
        await super.recieveMessage(message);
        setTimeout(() => this.answer(`ans:${message}`), 10);
      }
    }
  );
  Operator.useOperatorCallbacks({
    onInit: () => events.push("init"),
    onMessage: (message) => events.push(`message:${message}`),
    onAnswer: (answer) => events.push(`answer:${answer}`),
    onDispose: () => events.push("dispose"),
  });

  const TEST_AGENT = addAgent({
    agentName: "operator-agent",
    operator: true,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("q");
  await chatSession.dispose();
  await sleep(50);

  const ok =
    result === "ans:q" &&
    events.includes("init") &&
    events.includes("message:q") &&
    events.includes("answer:ans:q") &&
    events.includes("dispose");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} events=${JSON.stringify(events)}`);
});

test("Will persist state through a custom persistence adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const store = new Map();
  let writes = 0;

  PersistState.usePersistStateAdapter(
    class {
      constructor(entityName) {
        this.entityName = entityName;
      }
      async waitForInit() {}
      async hasValue(id) {
        return store.has(id);
      }
      async readValue(id) {
        return store.get(id);
      }
      async writeValue(id, value) {
        writes += 1;
        store.set(id, value);
      }
    }
  );

  addState({
    stateName: "test-state",
    persist: true,
    getDefaultState: () => ({ v: 0 }),
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
  await State.setState(() => ({ v: 7 }), context);
  const value = await State.getState(context);
  await chatSession.dispose();

  const stored = store.get(CLIENT_ID);
  if (value.v === 7 && writes >= 1 && stored?.state?.v === 7) {
    pass();
    return;
  }
  fail(`value=${JSON.stringify(value)} writes=${writes} stored=${JSON.stringify(stored)}`);
});

test("Will reuse cached search embeddings between storage takes", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const cache = new Map();
  const created = [];

  addEmbedding({
    embeddingName: "test-embedding",
    createEmbedding: async (text) => {
      created.push(text);
      return [text.length];
    },
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
    readEmbeddingCache: (embeddingName, hash) => cache.get(hash) ?? null,
    writeEmbeddingCache: (embeddings, embeddingName, hash) => {
      cache.set(hash, embeddings);
    },
  });

  addStorage({
    storageName: "test-storage",
    embedding: "test-embedding",
    createIndex: (item) => item.text,
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
  await Storage.take({ ...base, search: "zz", total: 5, score: 0.5 });
  await Storage.take({ ...base, search: "zz", total: 5, score: 0.5 });
  await chatSession.dispose();

  const searchCreations = created.filter((text) => text === "zz").length;
  if (searchCreations === 1) {
    pass();
    return;
  }
  fail(`created=${JSON.stringify(created)}`);
});

test("Will rate limit rapid session completions", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session.rate(CLIENT_ID, TEST_SWARM, { delay: 10_000 });
  const first = await chatSession.complete("one");
  const second = await chatSession.complete("two");
  await chatSession.dispose();

  if (first === "echo:one" && second === "") {
    pass();
    return;
  }
  fail(`first=${first} second=${JSON.stringify(second)}`);
});

test("Will create sequential numeric storage indexes", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  addEmbedding({
    embeddingName: "test-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });

  addStorage({
    storageName: "test-storage",
    embedding: "test-embedding",
    createIndex: (item) => item.text,
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
  const firstIndex = await Storage.createNumericIndex(base);
  await Storage.upsert({ ...base, item: { id: firstIndex, text: "aa" } });
  const secondIndex = await Storage.createNumericIndex(base);
  await chatSession.dispose();

  if (firstIndex === 1 && secondIndex === 2) {
    pass();
    return;
  }
  fail(`first=${firstIndex} second=${secondIndex}`);
});

test("Will expose payload and session context inside tool call", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let payloadSeen = null;
  let contextOk = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fn_context", arguments: {} } }],
        };
      }
      if (last.content === "finish") {
        return { agentName, content: "final", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const CONTEXT_TOOL = addTool({
    toolName: "tool-context",
    validate: () => true,
    type: "function",
    function: { name: "fn_context", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName, isLast }) => {
      payloadSeen = getPayload();
      const context = await getSessionContext();
      contextOk = context.clientId === clientId && !!context.executionContext;
      await commitToolOutput(toolId, "ctx-out", clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [CONTEXT_TOOL],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("start", { tag: "X" });
  await chatSession.dispose();

  if (result === "final" && payloadSeen?.tag === "X" && contextOk) {
    pass();
    return;
  }
  fail(`result=${result} payload=${JSON.stringify(payloadSeen)} contextOk=${contextOk}`);
});

test("Will return agent tailored history including prompt", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "sys-prompt",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await chatSession.complete("hello");
  const history = await getAgentHistory(CLIENT_ID, TEST_AGENT);
  await chatSession.dispose();

  const hasPrompt = history.some((m) => m.role === "system" && m.content === "sys-prompt");
  const hasUser = history.some((m) => m.role === "user" && m.content === "hello");
  const hasAssistant = history.some((m) => m.role === "assistant" && m.content === "echo:hello");

  if (hasPrompt && hasUser && hasAssistant) {
    pass();
    return;
  }
  fail(`history=${JSON.stringify(history.map((m) => [m.role, m.content]))}`);
});

test("Will include committed assistant message into the next completion context", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let factSeen = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      factSeen = messages.some((m) => m.role === "assistant" && m.content === "known-fact");
      const last = messages[messages.length - 1] ?? { content: "" };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await commitAssistantMessageForce("known-fact", CLIENT_ID);
  const result = await chatSession.complete("recall");
  await chatSession.dispose();

  if (result === "echo:recall" && factSeen) {
    pass();
    return;
  }
  fail(`result=${result} factSeen=${factSeen}`);
});
