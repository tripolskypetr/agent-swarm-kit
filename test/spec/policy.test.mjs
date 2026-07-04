import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  addPolicy,
  session,
  complete,
  changeToAgent,
  executeForce,
  getAgentName,
  setConfig,
  Policy,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

const addEcho = () =>
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will ban and unban client through Policy utils", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const TEST_POLICY = addPolicy({
    policyName: "test-policy",
    banMessage: "BLOCKED",
    persist: false,
    validateInput: async () => true,
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    policies: [TEST_POLICY],
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const target = { clientId: CLIENT_ID, swarmName: TEST_SWARM, policyName: TEST_POLICY };
  await Policy.banClient(target);
  const banned = await Policy.hasBan(target);
  const whileBanned = await chatSession.complete("hi");
  await Policy.unbanClient(target);
  const unbanned = await Policy.hasBan(target);
  const afterUnban = await chatSession.complete("hi");
  await chatSession.dispose();

  if (banned === true && whileBanned === "BLOCKED" && unbanned === false && afterUnban === "echo:hi") {
    pass();
    return;
  }
  fail(`banned=${banned} whileBanned=${whileBanned} unbanned=${unbanned} afterUnban=${afterUnban}`);
});

test("Will block invalid output with custom ban message", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const TEST_POLICY = addPolicy({
    policyName: "test-policy",
    persist: false,
    getBanMessage: (clientId) => `OUT:${clientId}`,
    validateOutput: async (outgoing) => !outgoing.includes("secret"),
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (last.content === "leak") {
        return { agentName, content: "secret-data", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    policies: [TEST_POLICY],
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const blocked = await chatSession.complete("leak");
  const allowed = await chatSession.complete("hi");
  await chatSession.dispose();

  if (blocked === `OUT:${CLIENT_ID}` && allowed === "echo:hi") {
    pass();
    return;
  }
  fail(`blocked=${blocked} allowed=${allowed}`);
});

test("Will use the failing policy ban message in merged policies", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const PASS_POLICY = addPolicy({
    policyName: "pass-policy",
    persist: false,
    banMessage: "P1MSG",
    validateInput: async () => true,
  });

  const BLOCK_POLICY = addPolicy({
    policyName: "block-policy",
    persist: false,
    getBanMessage: () => "P2MSG",
    validateInput: async (incoming) => incoming !== "bad",
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    policies: [PASS_POLICY, BLOCK_POLICY],
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const blocked = await chatSession.complete("bad");
  const allowed = await chatSession.complete("good");
  await chatSession.dispose();

  if (blocked === "P2MSG" && allowed === "echo:good") {
    pass();
    return;
  }
  fail(`blocked=${blocked} allowed=${allowed}`);
});

test("Will throw on repeated navigation to the same agent within one execution", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_THROW_WHEN_NAVIGATION_RECURSION: true,
  });
  const CLIENT_ID = randomString();
  let recursionError = "";

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (agentName === "agent-a" && last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "fn_double_nav", arguments: {} } }],
        };
      }
      return { agentName, content: `final-${agentName}`, role: "assistant" };
    },
  });

  const DOUBLE_NAV_TOOL = addTool({
    toolName: "tool-double-nav",
    validate: () => true,
    type: "function",
    function: { name: "fn_double_nav", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ clientId }) => {
      await changeToAgent("agent-b", clientId);
      try {
        await changeToAgent("agent-b", clientId);
      } catch (error) {
        recursionError = error.message;
      }
      await executeForce("done", clientId);
    },
  });

  const AGENT_A = addAgent({
    agentName: "agent-a",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [DOUBLE_NAV_TOOL],
    dependsOn: ["agent-b"],
  });
  const AGENT_B = addAgent({ agentName: "agent-b", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [AGENT_A, AGENT_B],
    defaultAgent: AGENT_A,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (recursionError.includes("recursion") && result === "final-agent-b") {
    pass();
    return;
  }
  fail(`error=${recursionError} result=${result}`);
});

test("Will skip navigation to an agent outside the swarm", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });
  const OUTSIDER_AGENT = addAgent({ agentName: "outsider-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });
  addSwarm({
    swarmName: "other-swarm",
    agentList: [OUTSIDER_AGENT],
    defaultAgent: OUTSIDER_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const changed = await changeToAgent(OUTSIDER_AGENT, CLIENT_ID);
  const active = await getAgentName(CLIENT_ID);
  await chatSession.dispose();

  if (changed === false && active === TEST_AGENT) {
    pass();
    return;
  }
  fail(`changed=${changed} active=${active}`);
});

test("Will throw on duplicate session for the same client", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  let duplicateError = "";
  try {
    session(CLIENT_ID, TEST_SWARM);
  } catch (error) {
    duplicateError = error.message;
  }
  await chatSession.dispose();

  if (duplicateError.includes("already exist")) {
    pass();
    return;
  }
  fail(`error=${duplicateError}`);
});

test("Will fire swarm level callbacks across the session lifecycle", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const events = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (agentName === "agent-a" && last.content === "go") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "nav-to-b", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const AGENT_B = addAgent({ agentName: "agent-b", completion: MOCK_COMPLETION, prompt: "" });

  const NAV_TOOL = addTool({
    toolName: "nav-to-b",
    validate: () => true,
    type: "function",
    function: { name: "nav-to-b", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ clientId }) => {
      await changeToAgent(AGENT_B, clientId);
      await executeForce("landed", clientId);
    },
  });

  const AGENT_A = addAgent({
    agentName: "agent-a",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [NAV_TOOL],
    dependsOn: [AGENT_B],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [AGENT_A, AGENT_B],
    defaultAgent: AGENT_A,
    callbacks: {
      onInit: () => events.push("init"),
      onExecute: () => events.push("execute"),
      onAgentChanged: async (clientId, agentName) => events.push(`agentChanged:${agentName}`),
      onDispose: () => events.push("dispose"),
    },
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await chatSession.complete("go");
  await chatSession.dispose();

  const wanted = ["init", "execute", `agentChanged:${AGENT_B}`, "dispose"];
  if (wanted.every((w) => events.includes(w))) {
    pass();
    return;
  }
  fail(`events=${JSON.stringify(events)}`);
});
