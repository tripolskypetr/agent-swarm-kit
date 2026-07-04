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
  commitToolOutput,
  executeForce,
  getAgentName,
  json,
  session,
  setConfig,
  startPipeline,
  overrideAdvisor,
  overrideAgent,
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
import { randomString } from "functools-kit";

const addEcho = (name) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
    },
  });

test("Will apply overrideAgent prompt to new sessions", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let promptSeen = "";
  addCompletion({
    completionName: "o1-completion",
    getCompletion: async ({ agentName, messages }) => {
      promptSeen = messages.find((m) => m.role === "system")?.content ?? "";
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "o1-agent", completion: "o1-completion", prompt: "sys-v1" });
  const SWARM = addSwarm({ swarmName: "o1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideAgent({ agentName: AGENT, prompt: "sys-v2" });

  const chatSession = session(randomString(), SWARM);
  const result = await chatSession.complete("hi");
  await chatSession.dispose();

  const ok =
    result === "echo:hi" && promptSeen === "sys-v2";

  if (ok) {
    pass();
    return;
  }
  fail(`prompt=${promptSeen}`);
});

test("Will apply overrideSwarm defaultAgent to new clients", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("o2-completion");
  const A = addAgent({ agentName: "o2-a", completion: COMPLETION, prompt: "" });
  const B = addAgent({ agentName: "o2-b", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "o2-swarm", agentList: [A, B], defaultAgent: A });

  await overrideSwarm({ swarmName: SWARM, defaultAgent: B });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const active = await getAgentName(CLIENT_ID);
  await chatSession.dispose();

  const ok =
    active === B;

  if (ok) {
    pass();
    return;
  }
  fail(`active=${active}`);
});

test("Will apply overrideTool call implementation", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const calls = [];
  addCompletion({
    completionName: "o3-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "o3_tool", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const TOOL = addTool({
    toolName: "o3_tool",
    validate: () => true,
    type: "function",
    function: { name: "o3_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      calls.push("v1");
      await commitToolOutput(toolId, "v1", clientId, agentName);
      await executeForce("finish", clientId);
    },
  });
  const AGENT = addAgent({ agentName: "o3-agent", completion: "o3-completion", prompt: "", tools: [TOOL] });
  const SWARM = addSwarm({ swarmName: "o3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideTool({
    toolName: TOOL,
    call: async ({ toolId, clientId, agentName }) => {
      calls.push("v2");
      await commitToolOutput(toolId, "v2", clientId, agentName);
      await executeForce("finish", clientId);
    },
  });

  const chatSession = session(randomString(), SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const ok =
    result === "echo:finish" && calls.join(",") === "v2";

  if (ok) {
    pass();
    return;
  }
  fail(`calls=${calls}`);
});

test("Will apply overridePolicy validateInput", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("o4-completion");
  const POLICY = addPolicy({
    policyName: "o4-policy",
    persist: false,
    banMessage: "BLOCKED",
    validateInput: async () => true,
  });
  const AGENT = addAgent({ agentName: "o4-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "o4-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    policies: [POLICY],
  });

  await overridePolicy({
    policyName: POLICY,
    validateInput: async (incoming) => incoming !== "bad",
  });

  const chatSession = session(randomString(), SWARM);
  const blocked = await chatSession.complete("bad");
  const allowed = await chatSession.complete("good");
  await chatSession.dispose();

  const ok =
    blocked === "BLOCKED" && allowed.startsWith("echo:");

  if (ok) {
    pass();
    return;
  }
  fail(`blocked=${blocked} allowed=${allowed}`);
});

test("Will apply overrideState default state", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("o5-completion");
  addState({ stateName: "o5-state", getDefaultState: () => ({ v: 1 }) });
  const AGENT = addAgent({
    agentName: "o5-agent",
    completion: COMPLETION,
    prompt: "",
    states: ["o5-state"],
  });
  const SWARM = addSwarm({ swarmName: "o5-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideState({ stateName: "o5-state", getDefaultState: () => ({ v: 42 }) });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const value = await State.getState({ clientId: CLIENT_ID, agentName: AGENT, stateName: "o5-state" });
  await chatSession.dispose();

  const ok =
    value?.v === 42;

  if (ok) {
    pass();
    return;
  }
  fail(`value=${JSON.stringify(value)}`);
});

test("Will apply overrideStorage index and overrideEmbedding logic", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const created = [];
  const COMPLETION = addEcho("o6-completion");
  addEmbedding({
    embeddingName: "o6-embedding",
    createEmbedding: async (text) => {
      created.push(text);
      return [text.length];
    },
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: "o6-storage",
    embedding: "o6-embedding",
    createIndex: (item) => item.text,
  });
  const AGENT = addAgent({
    agentName: "o6-agent",
    completion: COMPLETION,
    prompt: "",
    storages: ["o6-storage"],
  });
  const SWARM = addSwarm({ swarmName: "o6-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideStorage({ storageName: "o6-storage", createIndex: (item) => item.alt });
  await overrideEmbedding({
    embeddingName: "o6-embedding",
    createEmbedding: async (text) => {
      created.push(`v2:${text}`);
      return [text.length * 10];
    },
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: AGENT, storageName: "o6-storage" };
  await Storage.upsert({ ...base, item: { id: 1, text: "xx", alt: "zz" } });
  const found = await Storage.take({ ...base, search: "zz", total: 5, score: 0.5 });
  await chatSession.dispose();

  const ok =
    found.length === 1 && found[0].id === 1 && created.every((c) => c.startsWith("v2:"));

  if (ok) {
    pass();
    return;
  }
  fail(`found=${JSON.stringify(found)} created=${JSON.stringify(created)}`);
});

test("Will apply overrideCompute getComputeData", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("o7-completion");
  addCompute({ computeName: "o7-compute", getComputeData: async () => ({ src: "v1" }) });
  const AGENT = addAgent({ agentName: "o7-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "o7-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideCompute({ computeName: "o7-compute", getComputeData: async () => ({ src: "v2" }) });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const data = await Compute.getComputeData(CLIENT_ID, "o7-compute");
  await chatSession.dispose();

  const ok =
    data?.src === "v2";

  if (ok) {
    pass();
    return;
  }
  fail(`data=${JSON.stringify(data)}`);
});

test("Will apply overrideMCP tool list and callTool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let toolCalled = "";
  addCompletion({
    completionName: "o8-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "mcp_v2_tool", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const MCP_NAME = addMCP({
    mcpName: "o8-mcp",
    listTools: async () => [
      { name: "mcp_v1_tool", description: "", inputSchema: { type: "object", properties: {}, required: [] } },
    ],
    callTool: async () => {},
  });
  const AGENT = addAgent({ agentName: "o8-agent", completion: "o8-completion", prompt: "", mcp: [MCP_NAME] });
  const SWARM = addSwarm({ swarmName: "o8-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await overrideMCP({
    mcpName: MCP_NAME,
    listTools: async () => [
      { name: "mcp_v2_tool", description: "", inputSchema: { type: "object", properties: {}, required: [] } },
    ],
    callTool: async (toolName, { toolId, clientId, agentName }) => {
      toolCalled = toolName;
      await commitToolOutput(toolId, "mcp-done", clientId, agentName);
      await executeForce("finish", clientId);
    },
  });

  const chatSession = session(randomString(), SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  const ok =
    result === "echo:finish" && toolCalled === "mcp_v2_tool";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} toolCalled=${toolCalled}`);
});

test("Will apply overrideOutline prompt", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "o9-completion",
    json: true,
    getCompletion: async ({ messages }) => {
      const sys = messages.find((m) => m.role === "system")?.content ?? "";
      return {
        role: "assistant",
        agentName: "outline",
        content: JSON.stringify({ prompt: sys }),
      };
    },
  });
  addOutline({
    outlineName: "o9-outline",
    completion: "o9-completion",
    prompt: "outline-v1",
    format: { type: "object", required: [], properties: {} },
    getOutlineHistory: async ({ history }) => {
      await history.push({ role: "user", content: "q" });
    },
  });

  await overrideOutline({ outlineName: "o9-outline", prompt: "outline-v2" });

  const result = await json("o9-outline");

  const ok =
    result.isValid && result.data?.prompt === "outline-v2";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result.data)}`);
});

test("Will apply overrideAdvisor getChat", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addAdvisor({ advisorName: "o10-advisor", getChat: async (m) => `v1:${m}` });
  await overrideAdvisor({ advisorName: "o10-advisor", getChat: async (m) => `v2:${m}` });
  const answer = await ask("q", "o10-advisor");
  const ok =
    answer === "v2:q";

  if (ok) {
    pass();
    return;
  }
  fail(`answer=${answer}`);
});

test("Will apply overridePipeline execute", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("o11-completion");
  const AGENT = addAgent({ agentName: "o11-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "o11-swarm", agentList: [AGENT], defaultAgent: AGENT });
  addPipeline({
    pipelineName: "o11-pipeline",
    execute: async () => "v1",
  });

  await overridePipeline({
    pipelineName: "o11-pipeline",
    execute: async (clientId, agentName, payload) => `v2:${payload.x}`,
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const result = await startPipeline(CLIENT_ID, "o11-pipeline", AGENT, { x: 7 });
  await chatSession.dispose();

  const ok =
    result === "v2:7";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result}`);
});

