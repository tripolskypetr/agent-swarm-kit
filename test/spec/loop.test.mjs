import { test } from "worker-testbed";

import {
  addAgent,
  addAgentNavigation,
  addCompletion,
  addSwarm,
  addTool,
  changeToAgent,
  commitToolOutput,
  complete,
  executeForce,
  getAgentName,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

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

test("Will break infinite executeForce recursion with default nested limit", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let completionCalls = 0;

  addCompletion({
    completionName: "l1-completion",
    getCompletion: async ({ agentName }) => {
      completionCalls += 1;
      return {
        agentName,
        content: "",
        role: "assistant",
        tool_calls: [{ function: { name: "l1_loop", arguments: {} } }],
      };
    },
  });
  addTool({
    toolName: "l1_loop",
    validate: () => true,
    type: "function",
    function: { name: "l1_loop", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "looping", clientId, agentName);
      await executeForce("again", clientId);
    },
  });
  const AGENT = addAgent({ agentName: "l1-agent", completion: "l1-completion", prompt: "", tools: ["l1_loop"] });
  const SWARM = addSwarm({ swarmName: "l1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const result = await complete("start", CLIENT_ID, SWARM);

  const ok =
    PLACEHOLDERS.includes(result) && completionCalls <= 30;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} completionCalls=${completionCalls}`);
});

test("Will dampen navigation ping-pong between two agents", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let completionCalls = 0;

  addCompletion({
    completionName: "l2-completion",
    getCompletion: async ({ agentName, messages }) => {
      completionCalls += 1;
      const [last] = messages.slice(-1);
      if (completionCalls > 40) {
        return { agentName, content: "runaway", role: "assistant" };
      }
      if (agentName === "l2-a") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l2-nav-to-b", arguments: {} } }],
        };
      }
      if (agentName === "l2-b") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l2-nav-to-a", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const NAV_TO_B = addAgentNavigation({ toolName: "l2-nav-to-b", description: "", navigateTo: "l2-b" });
  const NAV_TO_A = addAgentNavigation({ toolName: "l2-nav-to-a", description: "", navigateTo: "l2-a" });

  const A = addAgent({
    agentName: "l2-a",
    completion: "l2-completion",
    prompt: "",
    tools: [NAV_TO_B],
    dependsOn: ["l2-b"],
  });
  const B = addAgent({
    agentName: "l2-b",
    completion: "l2-completion",
    prompt: "",
    tools: [NAV_TO_A],
    dependsOn: ["l2-a"],
  });
  const SWARM = addSwarm({ swarmName: "l2-swarm", agentList: [A, B], defaultAgent: A });

  const result = await complete("go", CLIENT_ID, SWARM);

  const ok =
    typeof result === "string" && result !== "runaway" && completionCalls <= 10;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} completionCalls=${completionCalls}`);
});

test("Will dampen navigation triangle loop across three agents", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let completionCalls = 0;

  addCompletion({
    completionName: "l3-completion",
    getCompletion: async ({ agentName, messages }) => {
      completionCalls += 1;
      const [last] = messages.slice(-1);
      if (completionCalls > 40) {
        return { agentName, content: "runaway", role: "assistant" };
      }
      if (agentName === "l3-a") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l3-nav-to-b", arguments: {} } }],
        };
      }
      if (agentName === "l3-b") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l3-nav-to-c", arguments: {} } }],
        };
      }
      if (agentName === "l3-c") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l3-nav-to-a", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const NB = addAgentNavigation({ toolName: "l3-nav-to-b", description: "", navigateTo: "l3-b" });
  const NC = addAgentNavigation({ toolName: "l3-nav-to-c", description: "", navigateTo: "l3-c" });
  const NA = addAgentNavigation({ toolName: "l3-nav-to-a", description: "", navigateTo: "l3-a" });

  const A = addAgent({ agentName: "l3-a", completion: "l3-completion", prompt: "", tools: [NB], dependsOn: ["l3-b"] });
  const B = addAgent({ agentName: "l3-b", completion: "l3-completion", prompt: "", tools: [NC], dependsOn: ["l3-c"] });
  const C = addAgent({ agentName: "l3-c", completion: "l3-completion", prompt: "", tools: [NA], dependsOn: ["l3-a"] });
  const SWARM = addSwarm({ swarmName: "l3-swarm", agentList: [A, B, C], defaultAgent: A });

  const result = await complete("go", CLIENT_ID, SWARM);

  const ok =
    typeof result === "string" && result !== "runaway" && completionCalls <= 12;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} completionCalls=${completionCalls}`);
});

test("Will terminate self-navigation to the same agent", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let completionCalls = 0;

  addCompletion({
    completionName: "l4-completion",
    getCompletion: async ({ agentName, messages }) => {
      completionCalls += 1;
      const [last] = messages.slice(-1);
      if (completionCalls > 40) {
        return { agentName, content: "runaway", role: "assistant" };
      }
      if (last.content === "go") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l4-nav-self", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const NAV_SELF = addAgentNavigation({ toolName: "l4-nav-self", description: "", navigateTo: "l4-agent" });
  const AGENT = addAgent({
    agentName: "l4-agent",
    completion: "l4-completion",
    prompt: "",
    tools: [NAV_SELF],
    dependsOn: ["l4-agent"],
  });
  const SWARM = addSwarm({ swarmName: "l4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("go");
  const active = await getAgentName(CLIENT_ID);
  await chatSession.dispose();

  const ok =
    typeof result === "string" && result !== "runaway" && completionCalls <= 6 && active === AGENT;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} completionCalls=${completionCalls} active=${active}`);
});

test("Will cap cross-agent executeForce ping-pong through plain tools", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  setConfig({ CC_MAX_NESTED_EXECUTIONS: 5 });
  const CLIENT_ID = randomString();
  let completionCalls = 0;

  addCompletion({
    completionName: "l5-completion",
    getCompletion: async ({ agentName }) => {
      completionCalls += 1;
      if (completionCalls > 40) {
        return { agentName, content: "runaway", role: "assistant" };
      }
      if (agentName === "l5-a") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l5_jump_b", arguments: {} } }],
        };
      }
      return {
        agentName,
        content: "",
        role: "assistant",
        tool_calls: [{ function: { name: "l5_jump_a", arguments: {} } }],
      };
    },
  });

  addTool({
    toolName: "l5_jump_b",
    validate: () => true,
    type: "function",
    function: { name: "l5_jump_b", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "to-b", clientId, agentName);
      await changeToAgent("l5-b", clientId);
      await executeForce("landed-b", clientId);
    },
  });
  addTool({
    toolName: "l5_jump_a",
    validate: () => true,
    type: "function",
    function: { name: "l5_jump_a", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "to-a", clientId, agentName);
      await changeToAgent("l5-a", clientId);
      await executeForce("landed-a", clientId);
    },
  });

  const A = addAgent({
    agentName: "l5-a",
    completion: "l5-completion",
    prompt: "",
    tools: ["l5_jump_b"],
    dependsOn: ["l5-b"],
  });
  const B = addAgent({
    agentName: "l5-b",
    completion: "l5-completion",
    prompt: "",
    tools: ["l5_jump_a"],
    dependsOn: ["l5-a"],
  });
  const SWARM = addSwarm({ swarmName: "l5-swarm", agentList: [A, B], defaultAgent: A });

  const result = await complete("go", CLIENT_ID, SWARM);
  setConfig({ CC_MAX_NESTED_EXECUTIONS: 20 });

  const ok =
    typeof result === "string" && result !== "runaway" && completionCalls <= 15;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} completionCalls=${completionCalls}`);
});

test("Will terminate always-empty model under recomplete strategy", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  setConfig({ CC_RESQUE_STRATEGY: "recomplete" });
  const CLIENT_ID = randomString();
  let completionCalls = 0;

  addCompletion({
    completionName: "l6-completion",
    getCompletion: async ({ agentName }) => {
      completionCalls += 1;
      return { agentName, content: "", role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "l6-agent", completion: "l6-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "l6-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const result = await complete("hi", CLIENT_ID, SWARM);
  setConfig({ CC_RESQUE_STRATEGY: "flush" });

  const ok =
    PLACEHOLDERS.includes(result) && completionCalls <= 8;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} completionCalls=${completionCalls}`);
});

test("Will keep session usable after repeatedly failing tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  addCompletion({
    completionName: "l7-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "boom") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "l7_boom", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "l7_boom",
    validate: () => true,
    type: "function",
    function: { name: "l7_boom", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async () => {
      throw new Error("always failing");
    },
  });
  const AGENT = addAgent({ agentName: "l7-agent", completion: "l7-completion", prompt: "", tools: ["l7_boom"] });
  const SWARM = addSwarm({ swarmName: "l7-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const first = await chatSession.complete("boom");
  const second = await chatSession.complete("boom");
  const normal = await chatSession.complete("hello");
  await chatSession.dispose();

  const ok =
    PLACEHOLDERS.includes(first) && PLACEHOLDERS.includes(second) && normal === "echo:hello";

  if (ok) {
    pass();
    return;
  }
  fail(`first=${first} second=${second} normal=${normal}`);
});

