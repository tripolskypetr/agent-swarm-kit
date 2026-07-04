import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  addAgentNavigation,
  addTriageNavigation,
  complete,
  session,
  commitToolOutput,
  commitStopTools,
  executeForce,
  setConfig,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

test("Will execute multiple tool calls in sequence", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const order = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            { function: { name: "fn_a", arguments: {} } },
            { function: { name: "fn_b", arguments: {} } },
          ],
        };
      }
      if (last.content === "finish") {
        return { agentName, content: "final", role: "assistant" };
      }
      return { agentName, content: last.content, role: "assistant" };
    },
  });

  const TOOL_A = addTool({
    toolName: "tool-a",
    validate: () => true,
    type: "function",
    function: { name: "fn_a", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      order.push("a");
      await commitToolOutput(toolId, "out-a", clientId, agentName);
    },
  });

  const TOOL_B = addTool({
    toolName: "tool-b",
    validate: () => true,
    type: "function",
    function: { name: "fn_b", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName, isLast }) => {
      order.push("b");
      await commitToolOutput(toolId, "out-b", clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [TOOL_A, TOOL_B],
    maxToolCalls: 2,
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "final" && order.join(",") === "a,b") {
    pass();
    return;
  }
  fail(`result=${result} order=${order.join(",")}`);
});

test("Will slice tool calls above maxToolCalls", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const order = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            { function: { name: "fn_a", arguments: {} } },
            { function: { name: "fn_b", arguments: {} } },
            { function: { name: "fn_c", arguments: {} } },
          ],
        };
      }
      if (last.content === "finish") {
        return { agentName, content: "final", role: "assistant" };
      }
      return { agentName, content: last.content, role: "assistant" };
    },
  });

  const makeTool = (letter, isFinal) =>
    addTool({
      toolName: `tool-${letter}`,
      validate: () => true,
      type: "function",
      function: { name: `fn_${letter}`, description: "", parameters: { type: "object", properties: {}, required: [] } },
      call: async ({ toolId, clientId, agentName, isLast }) => {
        order.push(letter);
        await commitToolOutput(toolId, `out-${letter}`, clientId, agentName);
        if (isFinal && isLast) {
          await executeForce("finish", clientId);
        }
      },
    });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [makeTool("a", false), makeTool("b", false), makeTool("c", true)],
    maxToolCalls: 2,
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "final" && order.join(",") === "b,c") {
    pass();
    return;
  }
  fail(`result=${result} order=${order.join(",")}`);
});

test("Will prioritize navigation tool over regular tools", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let regularCalled = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (agentName === "triage-agent" && last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            { function: { name: "fn_regular", arguments: {} } },
            { function: { name: "navigate-to-target", arguments: {} } },
          ],
        };
      }
      if (agentName === "target-agent") {
        return { agentName, content: "arrived", role: "assistant" };
      }
      return { agentName, content: last.content || "noop", role: "assistant" };
    },
  });

  const REGULAR_TOOL = addTool({
    toolName: "tool-regular",
    validate: () => true,
    type: "function",
    function: { name: "fn_regular", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      regularCalled = true;
    },
  });

  const TARGET_AGENT = addAgent({
    agentName: "target-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const NAVIGATE_TOOL = addAgentNavigation({
    toolName: "navigate-to-target",
    description: "Navigate to the target agent",
    navigateTo: TARGET_AGENT,
  });

  const TRIAGE_AGENT = addAgent({
    agentName: "triage-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [REGULAR_TOOL, NAVIGATE_TOOL],
    maxToolCalls: 2,
    dependsOn: [TARGET_AGENT],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TRIAGE_AGENT, TARGET_AGENT],
    defaultAgent: TRIAGE_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "arrived" && regularCalled === false) {
    pass();
    return;
  }
  fail(`result=${result} regularCalled=${regularCalled}`);
});

test("Will resurrect model when tool call throws", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_RESQUE_STRATEGY: "flush",
    CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"],
  });
  const CLIENT_ID = randomString();
  let toolErrorSeen = null;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fn_boom", arguments: {} } }],
        };
      }
      return { agentName, content: last.content || "", role: "assistant" };
    },
  });

  const BOOM_TOOL = addTool({
    toolName: "tool-boom",
    validate: () => true,
    type: "function",
    function: { name: "fn_boom", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      throw new Error("boom");
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [BOOM_TOOL],
    callbacks: {
      onToolError: (clientId, agentName, toolName, error) => {
        toolErrorSeen = `${toolName}:${error.message}`;
      },
    },
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "Resque" && toolErrorSeen === "tool-boom:boom") {
    pass();
    return;
  }
  fail(`result=${result} toolError=${toolErrorSeen}`);
});

test("Will stop remaining tools via commitStopTools", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let secondToolCalled = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            { function: { name: "fn_stopper", arguments: {} } },
            { function: { name: "fn_never", arguments: {} } },
          ],
        };
      }
      if (last.content === "stopped") {
        return { agentName, content: "final", role: "assistant" };
      }
      return { agentName, content: last.content, role: "assistant" };
    },
  });

  const STOPPER_TOOL = addTool({
    toolName: "tool-stopper",
    validate: () => true,
    type: "function",
    function: { name: "fn_stopper", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ clientId, agentName }) => {
      await commitStopTools(clientId, agentName);
      await executeForce("stopped", clientId);
    },
  });

  const NEVER_TOOL = addTool({
    toolName: "tool-never",
    validate: () => true,
    type: "function",
    function: { name: "fn_never", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      secondToolCalled = true;
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [STOPPER_TOOL, NEVER_TOOL],
    maxToolCalls: 2,
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "final" && secondToolCalled === false) {
    pass();
    return;
  }
  fail(`result=${result} secondToolCalled=${secondToolCalled}`);
});

test("Will exclude tool when isAvailable returns false", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_RESQUE_STRATEGY: "flush",
    CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"],
  });
  const CLIENT_ID = randomString();
  let toolsSeen = -1;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages, tools }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        toolsSeen = tools?.length ?? 0;
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fn_hidden", arguments: {} } }],
        };
      }
      return { agentName, content: last.content || "", role: "assistant" };
    },
  });

  const HIDDEN_TOOL = addTool({
    toolName: "tool-hidden",
    validate: () => true,
    isAvailable: () => false,
    type: "function",
    function: { name: "fn_hidden", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      fail("Unavailable tool should not be called");
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [HIDDEN_TOOL],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "Resque" && toolsSeen === 0) {
    pass();
    return;
  }
  fail(`result=${result} toolsSeen=${toolsSeen}`);
});

test("Will resolve dynamic tool function factory", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let dynamicNameSeen = false;
  let toolCalled = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages, tools }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        dynamicNameSeen = tools?.[0]?.function?.name === "dynamic_tool";
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "dynamic_tool", arguments: {} } }],
        };
      }
      if (last.content === "finish") {
        return { agentName, content: "final", role: "assistant" };
      }
      return { agentName, content: last.content, role: "assistant" };
    },
  });

  const DYNAMIC_TOOL = addTool({
    toolName: "tool-dynamic",
    validate: () => true,
    type: "function",
    function: async () => ({
      name: "dynamic_tool",
      description: "dynamic",
      parameters: { type: "object", properties: {}, required: [] },
    }),
    call: async ({ toolId, clientId, agentName, isLast }) => {
      toolCalled = true;
      await commitToolOutput(toolId, "dynamic-out", clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [DYNAMIC_TOOL],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "final" && dynamicNameSeen && toolCalled) {
    pass();
    return;
  }
  fail(`result=${result} dynamicNameSeen=${dynamicNameSeen} toolCalled=${toolCalled}`);
});

test("Will deduplicate tools with the same function name", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let toolsSeen = -1;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages, tools }) => {
      const [last] = messages.slice(-1);
      toolsSeen = tools?.length ?? 0;
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const makeDuplicate = (index) =>
    addTool({
      toolName: `tool-duplicate-${index}`,
      validate: () => true,
      type: "function",
      function: { name: "same_fn", description: "", parameters: { type: "object", properties: {}, required: [] } },
      call: async () => {},
    });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [makeDuplicate(1), makeDuplicate(2)],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("hello", CLIENT_ID, TEST_SWARM);

  if (result === "echo:hello" && toolsSeen === 1) {
    pass();
    return;
  }
  fail(`result=${result} toolsSeen=${toolsSeen}`);
});

test("Will name the default agent in triage navigation tool output", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const toolOutputs = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (agentName === "triage-agent" && last.content === "go sales") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "navigate-to-sales", arguments: {} } }],
        };
      }
      if (agentName === "sales-agent" && last.content === "go back") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "navigate-to-triage", arguments: {} } }],
        };
      }
      return { agentName, content: `${agentName}-answer`, role: "assistant" };
    },
  });

  const TRIAGE_AGENT = addAgent({
    agentName: "triage-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: ["navigate-to-sales"],
    dependsOn: ["sales-agent"],
  });

  const SALES_AGENT = addAgent({
    agentName: "sales-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: ["navigate-to-triage"],
    dependsOn: ["triage-agent"],
    callbacks: {
      onToolOutput: (toolId, clientId, agentName, content) => {
        toolOutputs.push(content);
      },
    },
  });

  addAgentNavigation({
    toolName: "navigate-to-sales",
    description: "Navigate to the sales agent",
    navigateTo: SALES_AGENT,
  });

  addTriageNavigation({
    toolName: "navigate-to-triage",
    description: "Navigate back to the triage agent",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TRIAGE_AGENT, SALES_AGENT],
    defaultAgent: TRIAGE_AGENT,
  });

  const { complete: sessionComplete, dispose } = session(CLIENT_ID, TEST_SWARM);
  await sessionComplete("go sales");
  await sessionComplete("go back");
  await dispose();

  const accept = toolOutputs.find((content) =>
    content.includes("Successfully navigated to")
  );

  if (accept && accept.includes(TRIAGE_AGENT) && !accept.includes(SALES_AGENT)) {
    pass();
    return;
  }
  fail(`accept=${accept} outputs=${JSON.stringify(toolOutputs)}`);
});
