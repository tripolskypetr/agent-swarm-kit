import { test } from "worker-testbed";

import {
  addAgent,
  addAgentNavigation,
  addCommitAction,
  addCompletion,
  addFetchInfo,
  addMCP,
  addSwarm,
  complete,
  getNavigationRoute,
  getRawHistory,
  runStatelessForce,
  scope,
  session,
  setConfig,
  validate,
  Chat,
  ChatInstance,
  History,
  HistoryMemoryInstance,
  MCP,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const addEcho = (name) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will isolate schema registrations inside scope", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const result = await scope(async () => {
    const COMPLETION = addEcho("m1-completion");
    const AGENT = addAgent({ agentName: "m1-agent", completion: COMPLETION, prompt: "" });
    const SWARM = addSwarm({ swarmName: "m1-swarm", agentList: [AGENT], defaultAgent: AGENT });
    return await complete("hi", randomString(), SWARM);
  });

  let outsideError = "";
  try {
    await complete("hi", randomString(), "m1-swarm");
  } catch (error) {
    outsideError = error.message;
  }

  const ok =
    result === "echo:hi" && outsideError.includes("m1-swarm");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} outsideError=${outsideError}`);
});

test("Will run stateless completion without history mutation", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const COMPLETION = addEcho("m2-completion");
  const AGENT = addAgent({ agentName: "m2-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "m2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  await chatSession.complete("real");
  const before = (await getRawHistory(CLIENT_ID)).length;
  const stateless = await runStatelessForce("ghost", CLIENT_ID);
  const after = (await getRawHistory(CLIENT_ID)).length;
  await chatSession.dispose();

  const ok =
    stateless === "echo:ghost" && before === after;

  if (ok) {
    pass();
    return;
  }
  fail(`stateless=${stateless} before=${before} after=${after}`);
});

test("Will track visited agents in navigation route", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  addCompletion({
    completionName: "m3-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (agentName === "m3-a" && last.content === "go") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "m3-navigate", arguments: {} } }],
        };
      }
      return { agentName, content: `final:${agentName}`, role: "assistant" };
    },
  });
  const B = addAgent({ agentName: "m3-b", completion: "m3-completion", prompt: "" });
  const NAV = addAgentNavigation({ toolName: "m3-navigate", description: "", navigateTo: B });
  const A = addAgent({
    agentName: "m3-a",
    completion: "m3-completion",
    prompt: "",
    tools: [NAV],
    dependsOn: [B],
  });
  const SWARM = addSwarm({ swarmName: "m3-swarm", agentList: [A, B], defaultAgent: A });

  const chatSession = session(CLIENT_ID, SWARM);
  await chatSession.complete("go");
  const route = [...getNavigationRoute(CLIENT_ID, SWARM)];
  await chatSession.dispose();

  const ok =
    route.includes(B);

  if (ok) {
    pass();
    return;
  }
  fail(`route=${JSON.stringify(route)}`);
});

test("Will handle addCommitAction success and failure branches", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const executed = [];
  addCompletion({
    completionName: "m4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "do-good") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "m4_action", arguments: { value: 1 } } }],
        };
      }
      if (last.content === "do-bad") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "m4_action", arguments: { value: -1 } } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const ACTION_TOOL = addCommitAction({
    toolName: "m4_action",
    function: {
      name: "m4_action",
      description: "",
      parameters: { type: "object", properties: { value: { type: "number" } }, required: [] },
    },
    validateParams: ({ params }) => (params.value < 0 ? "value must be positive" : null),
    executeAction: (params) => {
      executed.push(params.value);
      return `stored ${params.value}`;
    },
    successMessage: "action succeeded",
    failureMessage: "action failed",
  });

  const AGENT = addAgent({
    agentName: "m4-agent",
    completion: "m4-completion",
    prompt: "",
    tools: [ACTION_TOOL],
  });
  const SWARM = addSwarm({ swarmName: "m4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const good = await chatSession.complete("do-good");
  const bad = await chatSession.complete("do-bad");
  await chatSession.dispose();

  const ok =
    good === "echo:action succeeded" && bad === "echo:action failed" && executed.join(",") === "1";

  if (ok) {
    pass();
    return;
  }
  fail(`good=${good} bad=${bad} executed=${executed}`);
});

test("Will commit fetched content through addFetchInfo", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  let fetchSeen = null;
  addCompletion({
    completionName: "m5-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "lookup") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "m5_fetch", arguments: { id: 7 } } }],
        };
      }
      fetchSeen = messages.find((m) => m.role === "tool")?.content ?? null;
      return { agentName, content: "final", role: "assistant" };
    },
  });

  const FETCH_TOOL = addFetchInfo({
    toolName: "m5_fetch",
    function: {
      name: "m5_fetch",
      description: "",
      parameters: { type: "object", properties: { id: { type: "number" } }, required: [] },
    },
    fetchContent: (params) => `info-for-${params.id}`,
  });

  const AGENT = addAgent({
    agentName: "m5-agent",
    completion: "m5-completion",
    prompt: "",
    tools: [FETCH_TOOL],
  });
  const SWARM = addSwarm({ swarmName: "m5-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("lookup");
  await chatSession.dispose();

  const ok =
    result === "final" && fetchSeen === "info-for-7";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} fetchSeen=${fetchSeen}`);
});

test("Will detect broken schema references via validate", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("m6-completion");
  const AGENT = addAgent({ agentName: "m6-agent", completion: COMPLETION, prompt: "" });
  addSwarm({ swarmName: "m6-swarm", agentList: [AGENT], defaultAgent: AGENT });

  let validError = "";
  try {
    validate();
  } catch (error) {
    validError = error.message;
  }

  addAgent({
    agentName: "m6-broken",
    completion: COMPLETION,
    prompt: "",
    storages: ["m6-missing-storage"],
  });
  addSwarm({ swarmName: "m6-broken-swarm", agentList: ["m6-broken"], defaultAgent: "m6-broken" });

  let brokenError = "";
  try {
    validate();
  } catch (error) {
    brokenError = error.message;
  }

  const ok =
    validError === "" && brokenError.includes("m6-missing-storage");

  if (ok) {
    pass();
    return;
  }
  fail(`validError=${validError} brokenError=${brokenError}`);
});

test("Will intercept history pushes through custom history adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const pushedRoles = [];

  History.useHistoryAdapter(
    class extends HistoryMemoryInstance {
      async push(value, agentName) {
        pushedRoles.push(value.role);
        return await super.push(value, agentName);
      }
    }
  );

  const COMPLETION = addEcho("m7-completion");
  const AGENT = addAgent({ agentName: "m7-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "m7-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const result = await chatSession.complete("hi");
  await chatSession.dispose();

  const ok =
    result === "echo:hi" && pushedRoles.includes("user") && pushedRoles.includes("assistant");

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} roles=${JSON.stringify(pushedRoles)}`);
});

test("Will drive chat through custom adapter and callbacks", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const events = [];

  Chat.useChatAdapter(
    class extends ChatInstance {
      async sendMessage(content) {
        events.push(`adapter:${content}`);
        return await super.sendMessage(content);
      }
    }
  );
  Chat.useChatCallbacks({
    onBeginChat: () => events.push("begin"),
    onSendMessage: (clientId, swarmName, content) => events.push(`send:${content}`),
    onDispose: () => events.push("dispose"),
  });

  const COMPLETION = addEcho("m8-completion");
  const AGENT = addAgent({ agentName: "m8-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "m8-swarm", agentList: [AGENT], defaultAgent: AGENT });

  await Chat.beginChat(CLIENT_ID, SWARM);
  const answer = await Chat.sendMessage(CLIENT_ID, "ping", SWARM);
  await Chat.dispose(CLIENT_ID, SWARM);
  await sleep(100);

  const ok =
    answer === "echo:ping" &&
      events.includes("adapter:ping") &&
      events.includes("begin") &&
      events.includes("send:ping") &&
      events.includes("dispose");

  if (ok) {
    pass();
    return;
  }
  fail(`answer=${answer} events=${JSON.stringify(events)}`);
});

test("Will refresh MCP tools for all clients via MCP.update", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  let version = 1;
  const toolsSeen = [];
  addCompletion({
    completionName: "m9-completion",
    getCompletion: async ({ agentName, messages, tools }) => {
      toolsSeen.push((tools ?? []).map((t) => t.function.name).join(","));
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const MCP_NAME = addMCP({
    mcpName: "m9-mcp",
    listTools: async () => [
      {
        name: `mcp_tool_v${version}`,
        description: "",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
    ],
    callTool: async () => {},
  });
  const AGENT = addAgent({ agentName: "m9-agent", completion: "m9-completion", prompt: "", mcp: [MCP_NAME] });
  const SWARM = addSwarm({ swarmName: "m9-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  await chatSession.complete("one");
  version = 2;
  await chatSession.complete("two");
  await MCP.update(MCP_NAME);
  await chatSession.complete("three");
  await chatSession.dispose();

  const ok =
    toolsSeen[0] === "mcp_tool_v1" &&
      toolsSeen[1] === "mcp_tool_v1" &&
      toolsSeen[2] === "mcp_tool_v2";

  if (ok) {
    pass();
    return;
  }
  fail(`toolsSeen=${JSON.stringify(toolsSeen)}`);
});

