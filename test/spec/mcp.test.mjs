import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  addMCP,
  complete,
  session,
  setConfig,
  MCP,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

test("Will merge MCP tools with agent tools", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let namesSeen = [];

  addMCP({
    mcpName: "test-mcp",
    listTools: async () => [
      {
        name: "mcp_tool",
        description: "mcp tool",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
    ],
    callTool: async () => "unused",
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages, tools }) => {
      const [last] = messages.slice(-1);
      namesSeen = (tools ?? []).map((tool) => tool.function.name).sort();
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const REGULAR_TOOL = addTool({
    toolName: "tool-regular",
    validate: () => true,
    type: "function",
    function: { name: "regular_fn", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {},
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [REGULAR_TOOL],
    mcp: ["test-mcp"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("hello", CLIENT_ID, TEST_SWARM);

  if (result === "echo:hello" && namesSeen.join(",") === "mcp_tool,regular_fn") {
    pass();
    return;
  }
  fail(`result=${result} names=${namesSeen.join(",")}`);
});

test("Will call MCP tool and commit its string output", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let dtoSeen = null;

  addMCP({
    mcpName: "test-mcp",
    listTools: async () => [
      {
        name: "mcp_tool",
        description: "mcp tool",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
    ],
    callTool: async (toolName, dto) => {
      dtoSeen = {
        toolName,
        hasToolId: !!dto.toolId,
        isLast: dto.isLast,
        clientId: dto.clientId,
      };
      return "mcp says hi";
    },
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "mcp_tool", arguments: {} } }],
        };
      }
      if (last.role === "tool" && last.content === "mcp says hi") {
        return { agentName, content: "mcp-ok", role: "assistant" };
      }
      return { agentName, content: last.content || "noop", role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    mcp: ["test-mcp"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  const dtoOk =
    dtoSeen &&
    dtoSeen.toolName === "mcp_tool" &&
    dtoSeen.hasToolId &&
    dtoSeen.isLast === true &&
    dtoSeen.clientId === CLIENT_ID;

  if (result === "mcp-ok" && dtoOk) {
    pass();
    return;
  }
  fail(`result=${result} dto=${JSON.stringify(dtoSeen)}`);
});

test("Will flush and emit placeholder when MCP tool throws", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"],
  });
  const CLIENT_ID = randomString();
  let toolErrorSeen = null;
  let resurrectSeen = null;

  addMCP({
    mcpName: "test-mcp",
    listTools: async () => [
      {
        name: "mcp_tool",
        description: "mcp tool",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
    ],
    callTool: async () => {
      throw new Error("mcp-boom");
    },
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "mcp_tool", arguments: {} } }],
        };
      }
      return { agentName, content: last.content || "noop", role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    mcp: ["test-mcp"],
    callbacks: {
      onToolError: (clientId, agentName, toolName, error) => {
        toolErrorSeen = `${toolName}:${error.message}`;
      },
      onResurrect: (clientId, agentName, mode, reason) => {
        resurrectSeen = reason;
      },
    },
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  const ok =
    result === "Resque" &&
    toolErrorSeen === "mcp_tool:mcp-boom" &&
    String(resurrectSeen).includes("mcp_tool");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} toolError=${toolErrorSeen} resurrect=${resurrectSeen}`);
});

test("Will dispose MCP client cache on session dispose", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let listCount = 0;
  const disposed = [];

  addMCP({
    mcpName: "test-mcp",
    listTools: async () => {
      listCount += 1;
      return [
        {
          name: "mcp_tool",
          description: "",
          inputSchema: { type: "object", properties: {}, required: [] },
        },
      ];
    },
    callTool: async () => "unused",
    callbacks: {
      onDispose: (clientId) => disposed.push(clientId),
    },
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    mcp: ["test-mcp"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const firstSession = session(CLIENT_ID, TEST_SWARM);
  await firstSession.complete("one");
  await firstSession.complete("two");
  const countWhileCached = listCount;
  await firstSession.dispose();

  const disposeOk = disposed.length === 1 && disposed[0] === CLIENT_ID;

  const secondSession = session(CLIENT_ID, TEST_SWARM);
  await secondSession.complete("three");
  const countAfterReconnect = listCount;
  await secondSession.dispose();

  if (countWhileCached === 1 && disposeOk && countAfterReconnect === 2) {
    pass();
    return;
  }
  fail(
    `countWhileCached=${countWhileCached} disposed=${JSON.stringify(disposed)} countAfterReconnect=${countAfterReconnect}`
  );
});

test("Will refetch MCP tools after MCP.update for client", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let listCount = 0;
  const updates = [];

  addMCP({
    mcpName: "test-mcp",
    listTools: async () => {
      listCount += 1;
      return [
        {
          name: "mcp_tool",
          description: "",
          inputSchema: { type: "object", properties: {}, required: [] },
        },
      ];
    },
    callTool: async () => "unused",
    callbacks: {
      onUpdate: (mcpName, clientId) => updates.push(`${mcpName}:${clientId}`),
    },
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    mcp: ["test-mcp"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chat = session(CLIENT_ID, TEST_SWARM);
  await chat.complete("one");
  const countBefore = listCount;
  await MCP.update("test-mcp", CLIENT_ID);
  await chat.complete("two");
  const countAfter = listCount;
  await chat.dispose();

  const ok =
    countBefore === 1 &&
    countAfter === 2 &&
    updates.length === 1 &&
    updates[0] === `test-mcp:${CLIENT_ID}`;

  if (ok) {
    pass();
    return;
  }
  fail(`countBefore=${countBefore} countAfter=${countAfter} updates=${JSON.stringify(updates)}`);
});

test("Will expose MCP tool without inputSchema to the model", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let requiredSeen = "unset";

  addMCP({
    mcpName: "test-mcp",
    listTools: async () => [{ name: "bare_mcp_tool" }],
    callTool: async () => "unused",
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages, tools }) => {
      const [last] = messages.slice(-1);
      const tool = (tools ?? []).find(
        (candidate) => candidate.function.name === "bare_mcp_tool"
      );
      requiredSeen = tool
        ? JSON.stringify(tool.function.parameters.required ?? null)
        : "missing";
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    mcp: ["test-mcp"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("hello", CLIENT_ID, TEST_SWARM);

  if (result === "echo:hello" && requiredSeen === "null") {
    pass();
    return;
  }
  fail(`result=${result} required=${requiredSeen}`);
});
