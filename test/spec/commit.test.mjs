import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  session,
  makeConnection,
  commitSystemMessage,
  commitSystemMessageForce,
  commitAssistantMessage,
  commitAssistantMessageForce,
  commitDeveloperMessage,
  commitDeveloperMessageForce,
  commitUserMessage,
  commitFlushForce,
  cancelOutputForce,
  emitForce,
  notify,
  notifyForce,
  getRawHistory,
  getLastSystemMessage,
  getLastAssistantMessage,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const addEcho = () =>
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will skip commitSystemMessage for inactive agent but apply force variant", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const MOCK_COMPLETION = addEcho();

  const ACTIVE_AGENT = addAgent({ agentName: "active-agent", completion: MOCK_COMPLETION, prompt: "" });
  const OTHER_AGENT = addAgent({ agentName: "other-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [ACTIVE_AGENT, OTHER_AGENT],
    defaultAgent: ACTIVE_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await commitSystemMessage("skipped", CLIENT_ID, OTHER_AGENT);
  const afterSkip = await getLastSystemMessage(CLIENT_ID);
  await commitSystemMessageForce("forced", CLIENT_ID);
  const afterForce = await getLastSystemMessage(CLIENT_ID);
  await chatSession.dispose();

  if (afterSkip === null && afterForce === "forced") {
    pass();
    return;
  }
  fail(`afterSkip=${afterSkip} afterForce=${afterForce}`);
});

test("Will skip commitAssistantMessage for inactive agent but apply force variant", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const MOCK_COMPLETION = addEcho();

  const ACTIVE_AGENT = addAgent({ agentName: "active-agent", completion: MOCK_COMPLETION, prompt: "" });
  const OTHER_AGENT = addAgent({ agentName: "other-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [ACTIVE_AGENT, OTHER_AGENT],
    defaultAgent: ACTIVE_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await commitAssistantMessage("skipped", CLIENT_ID, OTHER_AGENT);
  const afterSkip = await getLastAssistantMessage(CLIENT_ID);
  await commitAssistantMessageForce("forced", CLIENT_ID);
  const afterForce = await getLastAssistantMessage(CLIENT_ID);
  await chatSession.dispose();

  if (afterSkip === null && afterForce === "forced") {
    pass();
    return;
  }
  fail(`afterSkip=${afterSkip} afterForce=${afterForce}`);
});

test("Will skip commitDeveloperMessage for inactive agent but apply force variant", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const MOCK_COMPLETION = addEcho();

  const ACTIVE_AGENT = addAgent({ agentName: "active-agent", completion: MOCK_COMPLETION, prompt: "" });
  const OTHER_AGENT = addAgent({ agentName: "other-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [ACTIVE_AGENT, OTHER_AGENT],
    defaultAgent: ACTIVE_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await commitDeveloperMessage("skipped", CLIENT_ID, OTHER_AGENT);
  const rawAfterSkip = await getRawHistory(CLIENT_ID);
  await commitDeveloperMessageForce("forced", CLIENT_ID);
  const rawAfterForce = await getRawHistory(CLIENT_ID);
  await chatSession.dispose();

  const skipOk = !rawAfterSkip.some((m) => m.role === "developer");
  const forceMessage = rawAfterForce.find((m) => m.role === "developer");

  if (skipOk && forceMessage?.content === "forced") {
    pass();
    return;
  }
  fail(`skipOk=${skipOk} force=${JSON.stringify(forceMessage)}`);
});

test("Will attach payload to committed user message", async ({ pass, fail }) => {
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
  await commitUserMessage("with-payload", "user", CLIENT_ID, TEST_AGENT, { meta: 42 });
  const raw = await getRawHistory(CLIENT_ID);
  await chatSession.dispose();

  const message = raw.find((m) => m.content === "with-payload");

  if (message?.payload?.meta === 42) {
    pass();
    return;
  }
  fail(`message=${JSON.stringify(message)}`);
});

test("Will reset model context after commitFlushForce", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let commonAfterFlush = -1;

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "three") {
        commonAfterFlush = messages.filter((m) => m.role !== "system").length;
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
  await chatSession.complete("one");
  await chatSession.complete("two");
  await commitFlushForce(CLIENT_ID);
  await chatSession.complete("three");
  await chatSession.dispose();

  if (commonAfterFlush === 1) {
    pass();
    return;
  }
  fail(`commonAfterFlush=${commonAfterFlush}`);
});

test("Will resolve pending execution with empty output on cancelOutputForce", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const received = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "hang") {
        return new Promise(() => void 0);
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

  const send = makeConnection((msg) => received.push(msg.data), CLIENT_ID, TEST_SWARM);
  const pending = send("hang");
  await sleep(200);
  await cancelOutputForce(CLIENT_ID);
  const result = await pending;

  if (result === "" && received.length === 0) {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)} received=${JSON.stringify(received)}`);
});

test("Will guard notify by session mode and deliver in makeConnection", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const SESSION_CLIENT = randomString();
  const CONNECTION_CLIENT = randomString();
  const received = [];
  const MOCK_COMPLETION = addEcho();

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(SESSION_CLIENT, TEST_SWARM);
  let threw = false;
  try {
    await notifyForce("nope", SESSION_CLIENT);
  } catch {
    threw = true;
  }
  await chatSession.dispose();

  makeConnection((msg) => received.push(msg.data), CONNECTION_CLIENT, TEST_SWARM);
  await notify("notified", CONNECTION_CLIENT, TEST_AGENT);
  await sleep(50);

  if (threw && received.join(",") === "notified") {
    pass();
    return;
  }
  fail(`threw=${threw} received=${JSON.stringify(received)}`);
});

test("Will substitute pending execution output via emitForce", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const received = [];

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "hang") {
        return new Promise(() => void 0);
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

  const send = makeConnection((msg) => received.push(msg.data), CLIENT_ID, TEST_SWARM);
  const pending = send("hang");
  await sleep(200);
  await emitForce("substituted", CLIENT_ID);
  const result = await pending;

  if (result === "substituted" && received.join(",") === "substituted") {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)} received=${JSON.stringify(received)}`);
});
