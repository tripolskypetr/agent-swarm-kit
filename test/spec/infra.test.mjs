import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  addAgentNavigation,
  complete,
  session,
  commitUserMessage,
  commitUserMessageForce,
  executeForce,
  listenAgentEvent,
  listenEventOnce,
  event,
  overrideCompletion,
  getAgentName,
  hasSession,
  setConfig,
  History,
  Logger,
  Chat,
  RoundRobin,
  PersistBase,
  PersistList,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";
import fs from "fs/promises";
import path from "path";

const addEcho = () =>
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will fire history onPush callback for stored messages", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const pushed = [];

  History.useHistoryCallbacks({
    onPush: (message) => pushed.push(message.role),
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("hi", CLIENT_ID, TEST_SWARM);

  if (result === "echo:hi" && pushed.includes("user") && pushed.includes("assistant")) {
    pass();
    return;
  }
  fail(`pushed=${JSON.stringify(pushed)}`);
});

test("Will deliver history getSystemPrompt alongside onRead callback", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let systemSeen = [];

  History.useHistoryCallbacks({
    getSystemPrompt: () => ["CB_SYS"],
    onRead: () => void 0,
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      systemSeen = messages.filter((m) => m.role === "system").map((m) => m.content);
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

  const result = await complete("hi", CLIENT_ID, TEST_SWARM);

  if (result === "echo:hi" && systemSeen.includes("CB_SYS")) {
    pass();
    return;
  }
  fail(`system=${JSON.stringify(systemSeen)}`);
});

test("Will route client logs through logger callbacks", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false, CC_LOGGER_ENABLE_LOG: true });
  const CLIENT_ID = randomString();
  const logged = [];

  Logger.useClientCallbacks({
    onLog: (clientId) => logged.push(clientId),
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  await complete("hi", CLIENT_ID, TEST_SWARM);

  if (logged.length > 0 && logged.every((clientId) => clientId === CLIENT_ID)) {
    pass();
    return;
  }
  fail(`loggedCount=${logged.length}`);
});

test("Will ignore temporary atomic-write files in PersistBase", async ({ pass, fail }) => {
  const baseDir = `./dump/persist-${randomString()}`;
  const persist = new PersistBase("test-entity", baseDir);
  await persist.waitForInit(true);
  await persist.writeValue("1", { a: 1 });
  await fs.writeFile(
    path.join(baseDir, "test-entity", ".tmp-abc123-9.json"),
    JSON.stringify({ junk: true }),
    "utf8"
  );

  const count = await persist.getCount();
  const keys = [];
  for await (const key of persist.keys()) keys.push(key);
  const value = await persist.readValue("1");

  if (count === 1 && keys.join(",") === "1" && value.a === 1) {
    pass();
    return;
  }
  fail(`count=${count} keys=${keys} value=${JSON.stringify(value)}`);
});

test("Will pop PersistList entries in LIFO order", async ({ pass, fail }) => {
  const baseDir = `./dump/persist-${randomString()}`;
  const list = new PersistList("test-entity", baseDir);
  await list.waitForInit(true);
  await list.push({ v: 1 });
  await list.push({ v: 2 });
  const popped1 = await list.pop();
  const popped2 = await list.pop();
  const popped3 = await list.pop();

  if (popped1?.v === 2 && popped2?.v === 1 && popped3 === null) {
    pass();
    return;
  }
  fail(`p1=${JSON.stringify(popped1)} p2=${JSON.stringify(popped2)} p3=${JSON.stringify(popped3)}`);
});

test("Will cycle RoundRobin tokens", async ({ pass, fail }) => {
  const roundRobin = RoundRobin.create(["a", "b"], (token) => () => token);
  const sequence = [roundRobin(), roundRobin(), roundRobin()].join(",");

  if (sequence === "a,b,a") {
    pass();
    return;
  }
  fail(`sequence=${sequence}`);
});

test("Will receive commit events on the agent bus", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const types = [];

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  listenAgentEvent(CLIENT_ID, (busEvent) => types.push(busEvent.type));
  await commitUserMessage("note", "user", CLIENT_ID, TEST_AGENT);
  await sleep(50);
  await chatSession.dispose();

  if (types.includes("commit-user-message")) {
    pass();
    return;
  }
  fail(`types=${JSON.stringify(types)}`);
});

test("Will receive events from any client on wildcard listener", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const types = [];

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  listenAgentEvent("*", (busEvent) => types.push(`${busEvent.clientId}:${busEvent.type}`));
  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await commitUserMessageForce("note", "user", CLIENT_ID);
  await sleep(50);
  await chatSession.dispose();

  if (types.includes(`${CLIENT_ID}:commit-user-message`)) {
    pass();
    return;
  }
  fail(`types=${JSON.stringify(types)}`);
});

test("Will trigger listenEventOnce only for the first matching event", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const hits = [];

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  listenEventOnce(
    CLIENT_ID,
    "once-topic",
    (payload) => payload.n === 2,
    (payload) => hits.push(payload.n)
  );
  await event(CLIENT_ID, "once-topic", { n: 1 });
  await event(CLIENT_ID, "once-topic", { n: 2 });
  await event(CLIENT_ID, "once-topic", { n: 2 });
  await sleep(50);
  await chatSession.dispose();

  if (hits.join(",") === "2") {
    pass();
    return;
  }
  fail(`hits=${JSON.stringify(hits)}`);
});

test("Will stop navigation loop with flush message", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (agentName === "agent-a") {
        if (last.content === "start" || String(last.content).includes("Successfully navigated")) {
          return {
            agentName,
            content: "",
            role: "assistant",
            tool_calls: [{ function: { name: "nav-to-b", arguments: {} } }],
          };
        }
        return { agentName, content: "a-answer", role: "assistant" };
      }
      return {
        agentName,
        content: "",
        role: "assistant",
        tool_calls: [{ function: { name: "nav-to-a", arguments: {} } }],
      };
    },
  });

  const AGENT_A = addAgent({
    agentName: "agent-a",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: ["nav-to-b"],
    dependsOn: ["agent-b"],
  });
  const AGENT_B = addAgent({
    agentName: "agent-b",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: ["nav-to-a"],
    dependsOn: ["agent-a"],
  });

  addAgentNavigation({
    toolName: "nav-to-b",
    description: "to b",
    navigateTo: AGENT_B,
    flushMessage: "LOOP_STOPPED",
  });
  addAgentNavigation({
    toolName: "nav-to-a",
    description: "to a",
    navigateTo: AGENT_A,
    flushMessage: "LOOP_STOPPED",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [AGENT_A, AGENT_B],
    defaultAgent: AGENT_A,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("start");
  const active = await getAgentName(CLIENT_ID);
  await chatSession.dispose();

  if (result === "LOOP_STOPPED" && active === AGENT_A) {
    pass();
    return;
  }
  fail(`result=${result} active=${active}`);
});

test("Will break infinite tool execution loop by nested execution limit", async ({ pass, fail }) => {
  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
    CC_MAX_NESTED_EXECUTIONS: 3,
    CC_RESQUE_STRATEGY: "flush",
    CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"],
  });
  const CLIENT_ID = randomString();
  let completionCalls = 0;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName }) => {
      completionCalls += 1;
      return {
        agentName,
        content: "",
        role: "assistant",
        tool_calls: [{ function: { name: "fn_loop", arguments: {} } }],
      };
    },
  });

  const LOOP_TOOL = addTool({
    toolName: "tool-loop",
    validate: () => true,
    type: "function",
    function: { name: "fn_loop", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ clientId }) => {
      await executeForce("again", clientId);
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [LOOP_TOOL],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("start", CLIENT_ID, TEST_SWARM);

  if (result === "Resque" && completionCalls <= 6) {
    pass();
    return;
  }
  fail(`result=${result} completionCalls=${completionCalls}`);
});

test("Will manage chat lifecycle through Chat utils", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const began = await Chat.beginChat(CLIENT_ID, TEST_SWARM);
  const answer = await Chat.sendMessage(CLIENT_ID, "hi", TEST_SWARM);
  const beganTwice = await Chat.beginChat(CLIENT_ID, TEST_SWARM);
  await Chat.dispose(CLIENT_ID, TEST_SWARM);
  await sleep(50);

  if (began === true && answer === "echo:hi" && beganTwice === false && hasSession(CLIENT_ID) === false) {
    pass();
    return;
  }
  fail(`began=${began} answer=${answer} beganTwice=${beganTwice} hasSession=${hasSession(CLIENT_ID)}`);
});

test("Will use overridden completion for new sessions", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName }) => ({ agentName, content: "v1", role: "assistant" }),
  });

  await overrideCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName }) => ({ agentName, content: "v2", role: "assistant" }),
  });

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: "mock-completion", prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const result = await complete("go", CLIENT_ID, TEST_SWARM);

  if (result === "v2") {
    pass();
    return;
  }
  fail(`result=${result}`);
});
