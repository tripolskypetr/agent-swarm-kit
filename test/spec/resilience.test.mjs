import { test } from "worker-testbed";

import {
  addAgent,
  addAgentNavigation,
  addCompletion,
  addState,
  addSwarm,
  addTool,
  commitToolOutput,
  commitToolRequest,
  executeForce,
  getAgentName,
  session,
  setConfig,
  State,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const PLACEHOLDERS = [
  "Sorry, I missed that. Could you say it again?",
  "I couldn't catch that. Would you mind repeating?",
  "I didn’t quite hear you. Can you repeat that, please?",
  "Pardon me, I didn’t hear that clearly. Could you repeat it?",
  "Sorry, I didn’t catch what you said. Could you say it again?",
  "Could you repeat that? I didn’t hear it clearly.",
  "I missed that. Can you say it one more time?",
  "Sorry, I didn’t get that. Could you repeat it, please?",
  "I didn’t hear you properly. Can you say that again?",
  "Could you please repeat that? I didn’t catch it.",
];

test("Will prioritize navigation tool over sibling data tool in one batch", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let dataCalled = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (agentName === "main-agent" && last.content === "go") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            { function: { name: "fn_data", arguments: {} } },
            { function: { name: "navigate-to-target", arguments: {} } },
          ],
        };
      }
      return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
    },
  });

  const TARGET_AGENT = addAgent({ agentName: "target-agent", completion: MOCK_COMPLETION, prompt: "" });

  const NAV_TOOL = addAgentNavigation({
    toolName: "navigate-to-target",
    description: "nav",
    navigateTo: TARGET_AGENT,
  });

  const DATA_TOOL = addTool({
    toolName: "fn_data",
    validate: () => true,
    type: "function",
    function: { name: "fn_data", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      dataCalled = true;
      await commitToolOutput(toolId, "data", clientId, agentName);
    },
  });

  const MAIN_AGENT = addAgent({
    agentName: "main-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [DATA_TOOL, NAV_TOOL],
    dependsOn: [TARGET_AGENT],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [MAIN_AGENT, TARGET_AGENT],
    defaultAgent: MAIN_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("go");
  const active = await getAgentName(CLIENT_ID);
  await chatSession.dispose();

  if (dataCalled === false && active === TARGET_AGENT && result.startsWith("echo:target-agent:")) {
    pass();
    return;
  }
  fail(`dataCalled=${dataCalled} active=${active} result=${result}`);
});

test("Will slice tool calls to the trailing maxToolCalls window", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const executed = [];

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
            { function: { name: "fn_rec", arguments: { tag: "a" } } },
            { function: { name: "fn_rec", arguments: { tag: "b" } } },
            { function: { name: "fn_rec", arguments: { tag: "c" } } },
          ],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const REC_TOOL = addTool({
    toolName: "fn_rec",
    validate: () => true,
    type: "function",
    function: {
      name: "fn_rec",
      description: "",
      parameters: { type: "object", properties: { tag: { type: "string" } }, required: [] },
    },
    call: async ({ toolId, clientId, agentName, params, isLast }) => {
      executed.push(params.tag);
      await commitToolOutput(toolId, `out:${params.tag}`, clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [REC_TOOL],
    maxToolCalls: 2,
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  if (executed.join(",") === "b,c" && result === "echo:finish") {
    pass();
    return;
  }
  fail(`executed=${executed} result=${result}`);
});

test("Will keep only the last tool call with default maxToolCalls", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const executed = [];

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
            { function: { name: "fn_rec", arguments: { tag: "a" } } },
            { function: { name: "fn_rec", arguments: { tag: "b" } } },
          ],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const REC_TOOL = addTool({
    toolName: "fn_rec",
    validate: () => true,
    type: "function",
    function: {
      name: "fn_rec",
      description: "",
      parameters: { type: "object", properties: { tag: { type: "string" } }, required: [] },
    },
    call: async ({ toolId, clientId, agentName, params, isLast }) => {
      executed.push(params.tag);
      await commitToolOutput(toolId, `out:${params.tag}`, clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [REC_TOOL],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  if (executed.join(",") === "b" && result === "echo:finish") {
    pass();
    return;
  }
  fail(`executed=${executed} result=${result}`);
});

test("Will recover from unknown tool call with placeholder and flushed history", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let sawStartAfterResque = null;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fn_ghost", arguments: {} } }],
        };
      }
      if (last.content === "hello") {
        sawStartAfterResque = messages.some((m) => m.content === "start");
      }
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
  const result = await chatSession.complete("start");
  const after = await chatSession.complete("hello");
  await chatSession.dispose();

  if (PLACEHOLDERS.includes(result) && after === "echo:hello" && sawStartAfterResque === false) {
    pass();
    return;
  }
  fail(`result=${result} after=${after} sawStart=${sawStartAfterResque}`);
});

test("Will skip tool execution when tool validation fails", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let called = false;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fn_guarded", arguments: { ok: false } } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const GUARDED_TOOL = addTool({
    toolName: "fn_guarded",
    validate: () => false,
    type: "function",
    function: { name: "fn_guarded", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      called = true;
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [GUARDED_TOOL],
  });
  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  if (PLACEHOLDERS.includes(result) && called === false) {
    pass();
    return;
  }
  fail(`result=${result} called=${called}`);
});

test("Will halt tool chain and emit placeholder when a tool throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let secondCalled = false;

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
            { function: { name: "fn_boom", arguments: {} } },
            { function: { name: "fn_next", arguments: {} } },
          ],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const BOOM_TOOL = addTool({
    toolName: "fn_boom",
    validate: () => true,
    type: "function",
    function: { name: "fn_boom", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      throw new Error("tool exploded");
    },
  });

  const NEXT_TOOL = addTool({
    toolName: "fn_next",
    validate: () => true,
    type: "function",
    function: { name: "fn_next", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      secondCalled = true;
      await commitToolOutput(toolId, "next", clientId, agentName);
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [BOOM_TOOL, NEXT_TOOL],
    maxToolCalls: 5,
  });
  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("start");
  await chatSession.dispose();

  if (PLACEHOLDERS.includes(result) && secondCalled === false) {
    pass();
    return;
  }
  fail(`result=${result} secondCalled=${secondCalled}`);
});

test("Will filter dangling tool requests and orphan tool outputs from model context", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let danglingSeen = null;
  let orphanSeen = null;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "check") {
        danglingSeen = messages.some((m) => m.tool_calls?.length);
        orphanSeen = messages.some((m) => m.role === "tool");
      }
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
  const ids = await commitToolRequest([{ toolName: "fn_never", params: {} }], CLIENT_ID, TEST_AGENT);
  await commitToolOutput("orphan-id", "orphan", CLIENT_ID, TEST_AGENT);
  const result = await chatSession.complete("check");
  await chatSession.dispose();

  const ok =
    Array.isArray(ids) &&
    ids.length === 1 &&
    danglingSeen === false &&
    orphanSeen === false &&
    result === "echo:check";

  if (ok) {
    pass();
    return;
  }
  fail(`ids=${JSON.stringify(ids)} dangling=${danglingSeen} orphan=${orphanSeen} result=${result}`);
});

test("Will trim model context to keepMessages trailing window", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let windowSnapshot = null;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "turn4") {
        windowSnapshot = messages.filter((m) => m.role !== "system").map((m) => m.content);
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
  await chatSession.complete("turn1");
  await chatSession.complete("turn2");
  await chatSession.complete("turn3");
  await chatSession.complete("turn4");
  await chatSession.dispose();

  const ok =
    Array.isArray(windowSnapshot) &&
    windowSnapshot.length === 2 &&
    windowSnapshot[0] === "echo:turn3" &&
    windowSnapshot[1] === "turn4";

  if (ok) {
    pass();
    return;
  }
  fail(`window=${JSON.stringify(windowSnapshot)}`);
});

test("Will keep input-output pairing for concurrent completes", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      await sleep(10);
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
  const [one, two] = await Promise.all([
    chatSession.complete("one"),
    chatSession.complete("two"),
  ]);
  const three = await chatSession.complete("three");
  await chatSession.dispose();

  if (one === "echo:one" && two === "echo:two" && three === "echo:three") {
    pass();
    return;
  }
  fail(`one=${one} two=${two} three=${three}`);
});

test("Will serialize concurrent setState calls without lost updates", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  addState({
    stateName: "test-state",
    getDefaultState: () => ({ counter: 0 }),
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
    states: ["test-state"],
  });
  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const context = { clientId: CLIENT_ID, agentName: TEST_AGENT, stateName: "test-state" };
  await Promise.all(
    Array.from({ length: 10 }, () =>
      State.setState(async (prev) => {
        await sleep(Math.floor(Math.random() * 5));
        return { counter: prev.counter + 1 };
      }, context)
    )
  );
  const finalState = await State.getState(context);
  await chatSession.dispose();

  if (finalState.counter === 10) {
    pass();
    return;
  }
  fail(`state=${JSON.stringify(finalState)}`);
});

test("Will fall back to default agent when active agent is not in the swarm", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_SWARM_DEFAULT_AGENT: async () => "ghost-agent",
  });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });
  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("hi");
  await chatSession.dispose();

  if (result === "echo:test-agent:hi") {
    pass();
    return;
  }
  fail(`result=${result}`);
});
