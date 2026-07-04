import { test } from "worker-testbed";

import {
  addAgent,
  addAdvisor,
  addCompletion,
  addCompute,
  addEmbedding,
  addMCP,
  addOutline,
  addPipeline,
  addPolicy,
  addState,
  addStorage,
  addSwarm,
  addTool,
  ask,
  changeToAgent,
  commitToolOutput,
  executeForce,
  json,
  session,
  setConfig,
  startPipeline,
  overrideAdvisor,
  overrideAgent,
  overrideCompletion,
  overrideCompute,
  overrideEmbedding,
  overrideMCP,
  overrideOutline,
  overridePipeline,
  overridePolicy,
  overrideState,
  overrideStorage,
  overrideSwarm,
  overrideTool,
  Compute,
  State,
  Storage,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const hasV2NoV1 = (events, ...v2markers) =>
  v2markers.every((m) => events.includes(m)) &&
  events.every((e) => !e.startsWith("v1:"));

const addEcho = (name) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will fire redeclared agent callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s1-completion");
  const AGENT = addAgent({
    agentName: "s1-agent",
    completion: COMPLETION,
    prompt: "",
    callbacks: {
      onInit: () => events.push("v1:init"),
      onExecute: () => events.push("v1:execute"),
      onOutput: () => events.push("v1:output"),
      onDispose: () => events.push("v1:dispose"),
    },
  });
  const SWARM = addSwarm({ swarmName: "s1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideAgent({
    agentName: AGENT,
    callbacks: {
      onInit: () => events.push("v2:init"),
      onExecute: () => events.push("v2:execute"),
      onOutput: (clientId, agentName, output) => events.push(`v2:output:${output}`),
      onDispose: () => events.push("v2:dispose"),
    },
  });

  const chatSession = session(randomString(), SWARM);
  await chatSession.complete("hi");
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:init", "v2:execute", "v2:output:echo:hi", "v2:dispose");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared swarm callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s2-completion");
  const A = addAgent({ agentName: "s2-a", completion: COMPLETION, prompt: "" });
  const B = addAgent({ agentName: "s2-b", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "s2-swarm",
    agentList: [A, B],
    defaultAgent: A,
    callbacks: {
      onInit: () => events.push("v1:init"),
      onExecute: () => events.push("v1:execute"),
      onAgentChanged: () => events.push("v1:agentChanged"),
      onDispose: () => events.push("v1:dispose"),
    },
  });

  await overrideSwarm({
    swarmName: SWARM,
    callbacks: {
      onInit: () => events.push("v2:init"),
      onExecute: () => events.push("v2:execute"),
      onAgentChanged: (clientId, agentName) => events.push(`v2:agentChanged:${agentName}`),
      onDispose: () => events.push("v2:dispose"),
    },
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  await chatSession.complete("hi");
  await changeToAgent(B, CLIENT_ID);
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:init", "v2:execute", `v2:agentChanged:${B}`, "v2:dispose");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared completion callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addCompletion({
    completionName: "s3-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
    callbacks: {
      onComplete: () => events.push("v1:complete"),
    },
  });
  const AGENT = addAgent({ agentName: "s3-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "s3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideCompletion({
    completionName: COMPLETION,
    callbacks: {
      onComplete: (args, output) => events.push(`v2:complete:${output.content}`),
    },
  });

  const chatSession = session(randomString(), SWARM);
  await chatSession.complete("hi");
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:complete:echo:hi");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared tool callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  addCompletion({
    completionName: "s4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "s4_tool", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const TOOL = addTool({
    toolName: "s4_tool",
    validate: () => true,
    type: "function",
    function: { name: "s4_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "done", clientId, agentName);
      await executeForce("finish", clientId);
    },
    callbacks: {
      onValidate: () => events.push("v1:validate"),
      onBeforeCall: () => events.push("v1:before"),
      onAfterCall: () => events.push("v1:after"),
    },
  });
  const AGENT = addAgent({ agentName: "s4-agent", completion: "s4-completion", prompt: "", tools: [TOOL] });
  const SWARM = addSwarm({ swarmName: "s4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideTool({
    toolName: TOOL,
    callbacks: {
      onValidate: () => events.push("v2:validate"),
      onBeforeCall: () => events.push("v2:before"),
      onAfterCall: () => events.push("v2:after"),
    },
  });

  const chatSession = session(randomString(), SWARM);
  const result = await chatSession.complete("start");
  await sleep(50);
  await chatSession.dispose();

  const ok =
    result === "echo:finish" && hasV2NoV1(events, "v2:validate", "v2:before", "v2:after");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} events=${JSON.stringify(events)}`);
});

test("Will fire redeclared policy callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s5-completion");
  const POLICY = addPolicy({
    policyName: "s5-policy",
    persist: false,
    banMessage: "BLOCKED",
    validateInput: async (incoming) => incoming !== "bad",
    callbacks: {
      onInit: () => events.push("v1:init"),
      onValidateInput: () => events.push("v1:validateInput"),
    },
  });
  const AGENT = addAgent({ agentName: "s5-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "s5-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    policies: [POLICY],
  });

  await overridePolicy({
    policyName: POLICY,
    callbacks: {
      onInit: () => events.push("v2:init"),
      onValidateInput: (incoming) => events.push(`v2:validateInput:${incoming}`),
    },
  });

  const chatSession = session(randomString(), SWARM);
  await chatSession.complete("hi");
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:init", "v2:validateInput:hi");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared state callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s6-completion");
  addState({
    stateName: "s6-state",
    getDefaultState: () => ({ v: 0 }),
    callbacks: {
      onInit: () => events.push("v1:init"),
      onLoad: () => events.push("v1:load"),
      onRead: () => events.push("v1:read"),
      onWrite: () => events.push("v1:write"),
      onDispose: () => events.push("v1:dispose"),
    },
  });
  const AGENT = addAgent({
    agentName: "s6-agent",
    completion: COMPLETION,
    prompt: "",
    states: ["s6-state"],
  });
  const SWARM = addSwarm({ swarmName: "s6-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideState({
    stateName: "s6-state",
    callbacks: {
      onInit: () => events.push("v2:init"),
      onLoad: () => events.push("v2:load"),
      onRead: () => events.push("v2:read"),
      onWrite: (state) => events.push(`v2:write:${state.v}`),
      onDispose: () => events.push("v2:dispose"),
    },
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const context = { clientId: CLIENT_ID, agentName: AGENT, stateName: "s6-state" };
  await State.setState(() => ({ v: 5 }), context);
  await State.getState(context);
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:init", "v2:load", "v2:read", "v2:write:5");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared storage callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s7-completion");
  addEmbedding({
    embeddingName: "s7-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: "s7-storage",
    embedding: "s7-embedding",
    createIndex: (item) => item.text,
    callbacks: {
      onInit: () => events.push("v1:init"),
      onUpdate: () => events.push("v1:update"),
      onSearch: () => events.push("v1:search"),
      onDispose: () => events.push("v1:dispose"),
    },
  });
  const AGENT = addAgent({
    agentName: "s7-agent",
    completion: COMPLETION,
    prompt: "",
    storages: ["s7-storage"],
  });
  const SWARM = addSwarm({ swarmName: "s7-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideStorage({
    storageName: "s7-storage",
    callbacks: {
      onInit: () => events.push("v2:init"),
      onUpdate: (items) => events.push(`v2:update:${items.length}`),
      onSearch: (search) => events.push(`v2:search:${search}`),
      onDispose: () => events.push("v2:dispose"),
    },
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: AGENT, storageName: "s7-storage" };
  await Storage.upsert({ ...base, item: { id: 1, text: "aa" } });
  await Storage.take({ ...base, search: "aa", total: 5, score: 0.5 });
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:init", "v2:update:1", "v2:search:aa");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared embedding callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s8-completion");
  addEmbedding({
    embeddingName: "s8-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
    callbacks: {
      onCreate: () => events.push("v1:create"),
      onCompare: () => events.push("v1:compare"),
    },
  });
  addStorage({
    storageName: "s8-storage",
    embedding: "s8-embedding",
    createIndex: (item) => item.text,
  });
  const AGENT = addAgent({
    agentName: "s8-agent",
    completion: COMPLETION,
    prompt: "",
    storages: ["s8-storage"],
  });
  const SWARM = addSwarm({ swarmName: "s8-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideEmbedding({
    embeddingName: "s8-embedding",
    callbacks: {
      onCreate: (text) => events.push(`v2:create:${text}`),
      onCompare: (a, b, score) => events.push(`v2:compare:${score}`),
    },
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: AGENT, storageName: "s8-storage" };
  await Storage.upsert({ ...base, item: { id: 1, text: "aa" } });
  await Storage.take({ ...base, search: "aa", total: 5, score: 0.5 });
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:create:aa", "v2:compare:1");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared compute callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s9-completion");
  addCompute({
    computeName: "s9-compute",
    getComputeData: async () => ({ n: 1 }),
    callbacks: {
      onInit: () => events.push("v1:init"),
      onUpdate: () => events.push("v1:update"),
      onDispose: () => events.push("v1:dispose"),
    },
  });
  const AGENT = addAgent({ agentName: "s9-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "s9-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideCompute({
    computeName: "s9-compute",
    callbacks: {
      onInit: () => events.push("v2:init"),
      onUpdate: () => events.push("v2:update"),
      onDispose: () => events.push("v2:dispose"),
    },
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  await Compute.getComputeData(CLIENT_ID, "s9-compute");
  await Compute.update(CLIENT_ID, "s9-compute");
  await chatSession.dispose();

  const ok =
    hasV2NoV1(events, "v2:init", "v2:update");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared mcp callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  addCompletion({
    completionName: "s10-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "mcp_s10_tool", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const MCP_NAME = addMCP({
    mcpName: "s10-mcp",
    listTools: async () => [
      { name: "mcp_s10_tool", description: "", inputSchema: { type: "object", properties: {}, required: [] } },
    ],
    callTool: async (toolName, { toolId, clientId }) => {
      await commitToolOutput(toolId, "mcp-done", clientId, "s10-agent");
      await executeForce("finish", clientId);
    },
    callbacks: {
      onInit: () => events.push("v1:init"),
      onList: () => events.push("v1:list"),
      onCall: () => events.push("v1:call"),
    },
  });
  const AGENT = addAgent({ agentName: "s10-agent", completion: "s10-completion", prompt: "", mcp: [MCP_NAME] });
  const SWARM = addSwarm({ swarmName: "s10-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideMCP({
    mcpName: MCP_NAME,
    callbacks: {
      onInit: () => events.push("v2:init"),
      onList: () => events.push("v2:list"),
      onCall: (toolName) => events.push(`v2:call:${toolName}`),
    },
  });

  const chatSession = session(randomString(), SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const ok =
    result === "echo:finish" && hasV2NoV1(events, "v2:list", "v2:call:mcp_s10_tool");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} events=${JSON.stringify(events)}`);
});

test("Will fire redeclared outline callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  addCompletion({
    completionName: "s11-completion",
    json: true,
    getCompletion: async () => ({
      role: "assistant",
      agentName: "outline",
      content: JSON.stringify({ ok: true }),
    }),
  });
  addOutline({
    outlineName: "s11-outline",
    completion: "s11-completion",
    format: { type: "object", required: [], properties: {} },
    getOutlineHistory: async ({ history }) => {
      await history.push({ role: "user", content: "q" });
    },
    callbacks: {
      onAttempt: () => events.push("v1:attempt"),
      onValidDocument: () => events.push("v1:valid"),
    },
  });

  await overrideOutline({
    outlineName: "s11-outline",
    callbacks: {
      onAttempt: ({ attempt }) => events.push(`v2:attempt:${attempt}`),
      onValidDocument: ({ data }) => events.push(`v2:valid:${data.ok}`),
    },
  });

  const result = await json("s11-outline");

  const ok =
    result.isValid && hasV2NoV1(events, "v2:attempt:0", "v2:valid:true");

  if (ok) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});

test("Will fire redeclared advisor callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  addAdvisor({
    advisorName: "s12-advisor",
    getChat: async (m) => `advice:${m}`,
    callbacks: {
      onChat: () => events.push("v1:chat"),
      onResult: () => events.push("v1:result"),
    },
  });

  await overrideAdvisor({
    advisorName: "s12-advisor",
    callbacks: {
      onChat: (m) => events.push(`v2:chat:${m}`),
      onResult: (id, content) => events.push(`v2:result:${content}`),
    },
  });

  const answer = await ask("q", "s12-advisor");

  const ok =
    answer === "advice:q" && hasV2NoV1(events, "v2:chat:q", "v2:result:advice:q");

  if (ok) {
    pass();
    return;
  }
  fail(`answer=${answer} events=${JSON.stringify(events)}`);
});

test("Will fire redeclared pipeline callbacks after override", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const events = [];
  const COMPLETION = addEcho("s13-completion");
  const AGENT = addAgent({ agentName: "s13-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "s13-swarm", agentList: [AGENT], defaultAgent: AGENT });
  addPipeline({
    pipelineName: "s13-pipeline",
    execute: async (clientId, agentName, payload) => payload.x + 1,
    callbacks: {
      onStart: () => events.push("v1:start"),
      onEnd: () => events.push("v1:end"),
    },
  });

  await overridePipeline({
    pipelineName: "s13-pipeline",
    callbacks: {
      onStart: () => events.push("v2:start"),
      onEnd: (clientId, pipelineName, payload, isError) => events.push(`v2:end:${isError}`),
    },
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const result = await startPipeline(CLIENT_ID, "s13-pipeline", AGENT, { x: 1 });
  await chatSession.dispose();

  const ok =
    result === 2 && hasV2NoV1(events, "v2:start", "v2:end:false");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} events=${JSON.stringify(events)}`);
});

