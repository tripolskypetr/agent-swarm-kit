import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  complete,
  session,
  commitToolOutput,
  commitSystemMessage,
  commitAssistantMessage,
  commitUserMessage,
  commitToolRequest,
  executeForce,
  runStateless,
  getRawHistory,
  getUserHistory,
  getAssistantHistory,
  getLastUserMessage,
  getLastAssistantMessage,
  getLastSystemMessage,
  getLastToolMessage,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

test("Will pass prompt, static, dynamic and flag system messages to the model", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let systemSeen = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    flags: ["FLAG"],
    getCompletion: async ({ agentName, messages }) => {
      systemSeen = messages.filter((m) => m.role === "system").map((m) => m.content);
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: async () => "PROMPT",
    systemStatic: ["STAT"],
    systemDynamic: async () => ["DYN"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("hi", CLIENT_ID, TEST_SWARM);
  const wanted = ["PROMPT", "STAT", "DYN", "FLAG"];

  if (result === "echo:hi" && wanted.every((w) => systemSeen.includes(w))) {
    pass();
    return;
  }
  fail(`result=${result} system=${JSON.stringify(systemSeen)}`);
});

test("Will apply agent output transform", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

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
    transform: (input) => input.toUpperCase(),
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("shout", CLIENT_ID, TEST_SWARM);

  if (result === "ECHO:SHOUT") {
    pass();
    return;
  }
  fail(`result=${result}`);
});

test("Will apply agent message map", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName }) => ({ agentName, content: "raw", role: "assistant" }),
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    map: (message) =>
      message.content === "raw" ? { ...message, content: "mapped" } : message,
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("go", CLIENT_ID, TEST_SWARM);

  if (result === "mapped") {
    pass();
    return;
  }
  fail(`result=${result}`);
});

test("Will filter tool calls with mapToolCalls", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let dropCalled = false;

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
            { function: { name: "fn_keep", arguments: {} } },
            { function: { name: "fn_drop", arguments: {} } },
          ],
        };
      }
      if (last.content === "finish") {
        return { agentName, content: "final", role: "assistant" };
      }
      return { agentName, content: last.content, role: "assistant" };
    },
  });

  const KEEP_TOOL = addTool({
    toolName: "tool-keep",
    validate: () => true,
    type: "function",
    function: { name: "fn_keep", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName, isLast }) => {
      await commitToolOutput(toolId, "keep-out", clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });

  const DROP_TOOL = addTool({
    toolName: "tool-drop",
    validate: () => true,
    type: "function",
    function: { name: "fn_drop", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      dropCalled = true;
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [KEEP_TOOL, DROP_TOOL],
    maxToolCalls: 2,
    mapToolCalls: (calls) => calls.filter((call) => call.function.name !== "fn_drop"),
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "final" && dropCalled === false) {
    pass();
    return;
  }
  fail(`result=${result} dropCalled=${dropCalled}`);
});

test("Will trim model context to keepMessages", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let lastCommonCount = -1;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "three") {
        lastCommonCount = messages.filter((m) => m.role !== "system").length;
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    keepMessages: 2,
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await chatSession.complete("one");
  await chatSession.complete("two");
  await chatSession.complete("three");
  await chatSession.dispose();

  if (lastCommonCount === 2) {
    pass();
    return;
  }
  fail(`lastCommonCount=${lastCommonCount}`);
});

test("Will run stateless completion without touching history", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

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
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await chatSession.complete("hi");
  const before = (await getRawHistory(CLIENT_ID)).length;
  const result = await runStateless("stateless", CLIENT_ID, TEST_AGENT);
  const after = (await getRawHistory(CLIENT_ID)).length;
  await chatSession.dispose();

  if (result === "echo:stateless" && before === after) {
    pass();
    return;
  }
  fail(`result=${result} before=${before} after=${after}`);
});

test("Will return empty string from runStateless when model requests tools", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "toolcase") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "whatever", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await runStateless("toolcase", CLIENT_ID, TEST_AGENT);
  await chatSession.dispose();

  if (result === "") {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)}`);
});

test("Will recover via recomplete resque strategy", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_RESQUE_STRATEGY: "recomplete",
  });
  const CLIENT_ID = randomString();
  let sawRecompletePrompt = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return { agentName, content: "", role: "assistant" };
      }
      if (last.content.includes("Please analyze the last tool call")) {
        sawRecompletePrompt = true;
        return { agentName, content: "recovered", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "recovered" && sawRecompletePrompt) {
    pass();
    return;
  }
  fail(`result=${result} sawPrompt=${sawRecompletePrompt}`);
});

test("Will recover via custom resque strategy", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_RESQUE_STRATEGY: "custom",
    CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION: async (clientId, agentName) => ({
      agentName,
      role: "assistant",
      content: "custom-fix",
    }),
  });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return { agentName, content: "", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "custom-fix") {
    pass();
    return;
  }
  fail(`result=${result}`);
});

test("Will fire agent lifecycle callbacks", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const events = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fn_step", arguments: {} } }],
        };
      }
      if (last.content === "finish") {
        return { agentName, content: "final", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const STEP_TOOL = addTool({
    toolName: "tool-step",
    validate: () => true,
    type: "function",
    function: { name: "fn_step", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName, isLast }) => {
      await commitToolOutput(toolId, "out", clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [STEP_TOOL],
    callbacks: {
      onInit: () => events.push("init"),
      onExecute: () => events.push("execute"),
      onOutput: () => events.push("output"),
      onAfterToolCalls: () => events.push("afterToolCalls"),
      onDispose: () => events.push("dispose"),
    },
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("start");
  await sleep(100);
  await chatSession.dispose();

  const wanted = ["init", "execute", "output", "afterToolCalls", "dispose"];
  if (result === "final" && wanted.every((w) => events.includes(w))) {
    pass();
    return;
  }
  fail(`result=${result} events=${JSON.stringify(events)}`);
});

test("Will commit tool request into history with generated ids", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

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
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const ids = await commitToolRequest(
    { toolName: "fn_requested", params: { a: 1 } },
    CLIENT_ID,
    TEST_AGENT
  );
  const raw = await getRawHistory(CLIENT_ID);
  await chatSession.dispose();

  const requestMessage = raw.find((m) => m.tool_calls?.length);
  const ok =
    Array.isArray(ids) &&
    ids.length === 1 &&
    !!ids[0] &&
    requestMessage &&
    requestMessage.role === "assistant" &&
    requestMessage.tool_calls[0].function.name === "fn_requested" &&
    requestMessage.tool_calls[0].id === ids[0];

  if (ok) {
    pass();
    return;
  }
  fail(`ids=${JSON.stringify(ids)} message=${JSON.stringify(requestMessage)}`);
});

test("Will read history through the getter family", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "hello") {
        return { agentName, content: "answer-1", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await chatSession.complete("hello");
  await commitSystemMessage("sys-note", CLIENT_ID, TEST_AGENT);
  await commitAssistantMessage("assist-extra", CLIENT_ID, TEST_AGENT);
  await commitUserMessage("user-extra", "user", CLIENT_ID, TEST_AGENT);
  await commitToolOutput("tool-id-1", "tool-out", CLIENT_ID, TEST_AGENT);

  const userHistory = await getUserHistory(CLIENT_ID);
  const assistantHistory = await getAssistantHistory(CLIENT_ID);
  const checks = {
    lastUser: (await getLastUserMessage(CLIENT_ID)) === "user-extra",
    userLen: userHistory.length === 2,
    lastAssistant: (await getLastAssistantMessage(CLIENT_ID)) === "assist-extra",
    assistantHasBoth:
      assistantHistory.some((m) => m.content === "answer-1") &&
      assistantHistory.some((m) => m.content === "assist-extra"),
    lastSystem: (await getLastSystemMessage(CLIENT_ID)) === "sys-note",
    lastTool: (await getLastToolMessage(CLIENT_ID)) === "tool-out",
  };
  await chatSession.dispose();

  if (Object.values(checks).every(Boolean)) {
    pass();
    return;
  }
  fail(JSON.stringify(checks));
});
