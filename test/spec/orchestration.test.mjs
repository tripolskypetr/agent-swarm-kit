import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  addPolicy,
  addPipeline,
  addOutline,
  addAdvisor,
  addAgentNavigation,
  session,
  makeAutoDispose,
  runStateless,
  startPipeline,
  fork,
  json,
  chat,
  ask,
  event,
  listenEvent,
  getAgentName,
  getSessionMode,
  hasSession,
  hasNavigation,
  getCheckBusy,
  getToolNameForModel,
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

test("Will run scoped session via fork", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const MOCK_COMPLETION = addEcho();

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  let insideHasSession = false;
  const result = await fork(
    async (clientId, agentName) => {
      insideHasSession = hasSession(clientId);
      return `${agentName}:${await runStateless("scoped", clientId, agentName)}`;
    },
    { clientId: CLIENT_ID, swarmName: TEST_SWARM }
  );
  const afterHasSession = hasSession(CLIENT_ID);

  if (result === "test-agent:echo:scoped" && insideHasSession && !afterHasSession) {
    pass();
    return;
  }
  fail(`result=${result} inside=${insideHasSession} after=${afterHasSession}`);
});

test("Will switch agent for pipeline and restore it afterwards", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const events = [];
  const MOCK_COMPLETION = addEcho();

  const MAIN_AGENT = addAgent({
    agentName: "main-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    dependsOn: ["worker-agent"],
  });
  const WORKER_AGENT = addAgent({
    agentName: "worker-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    dependsOn: ["main-agent"],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [MAIN_AGENT, WORKER_AGENT],
    defaultAgent: MAIN_AGENT,
  });

  let agentInside = "";
  addPipeline({
    pipelineName: "test-pipeline",
    execute: async (clientId, agentName, payload) => {
      agentInside = await getAgentName(clientId);
      return payload.x * 2;
    },
    callbacks: {
      onStart: () => events.push("start"),
      onEnd: (clientId, pipelineName, payload, isError) => events.push(`end:${isError}`),
    },
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await startPipeline(CLIENT_ID, "test-pipeline", WORKER_AGENT, { x: 21 });
  const agentAfter = await getAgentName(CLIENT_ID);
  await chatSession.dispose();

  const ok =
    result === 42 &&
    agentInside === WORKER_AGENT &&
    agentAfter === MAIN_AGENT &&
    events.join(",") === "start,end:false";

  if (ok) {
    pass();
    return;
  }
  fail(`result=${result} inside=${agentInside} after=${agentAfter} events=${events}`);
});

test("Will report pipeline error through callbacks", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const events = [];
  const MOCK_COMPLETION = addEcho();

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  addPipeline({
    pipelineName: "test-pipeline",
    execute: async () => {
      throw new Error("pipe-boom");
    },
    callbacks: {
      onError: (clientId, pipelineName, payload, error) => events.push(`error:${error.message}`),
      onEnd: (clientId, pipelineName, payload, isError) => events.push(`end:${isError}`),
    },
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await startPipeline(CLIENT_ID, "test-pipeline", TEST_AGENT, {});
  await chatSession.dispose();

  if (result === null && events.join(",") === "error:pipe-boom,end:true") {
    pass();
    return;
  }
  fail(`result=${result} events=${events}`);
});

test("Will auto ban client after failed policy validation", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  const MOCK_COMPLETION = addEcho();

  const TEST_POLICY = addPolicy({
    policyName: "test-policy",
    banMessage: "BANNED",
    autoBan: true,
    persist: false,
    validateInput: async (incoming) => incoming !== "bad",
  });

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    policies: [TEST_POLICY],
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const first = await chatSession.complete("ok");
  const second = await chatSession.complete("bad");
  const third = await chatSession.complete("ok");
  await chatSession.dispose();

  if (first === "echo:ok" && second === "BANNED" && third === "BANNED") {
    pass();
    return;
  }
  fail(`first=${first} second=${second} third=${third}`);
});

test("Will route messages through operator agent and dispose its signal", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let operatorDisposed = false;
  const operatorMessages = [];

  const TEST_AGENT = addAgent({
    agentName: "operator-agent",
    operator: true,
    prompt: "",
    connectOperator: () => (message, next) => {
      operatorMessages.push(message);
      setTimeout(() => next(`op:${message}`), 10);
      return () => {
        operatorDisposed = true;
      };
    },
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const result = await chatSession.complete("help");
  await chatSession.dispose();

  if (result === "op:help" && operatorMessages.join(",") === "help" && operatorDisposed) {
    pass();
    return;
  }
  fail(`result=${result} messages=${operatorMessages} disposed=${operatorDisposed}`);
});

test("Will auto dispose idle session", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();
  let destroyed = false;
  const MOCK_COMPLETION = addEcho();

  const TEST_AGENT = addAgent({ agentName: "test-agent", completion: MOCK_COMPLETION, prompt: "" });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  await chatSession.complete("hi");
  makeAutoDispose(CLIENT_ID, TEST_SWARM, {
    timeoutSeconds: 1,
    onDestroy: () => {
      destroyed = true;
    },
  });
  await sleep(3_500);

  if (destroyed && !hasSession(CLIENT_ID)) {
    pass();
    return;
  }
  fail(`destroyed=${destroyed} hasSession=${hasSession(CLIENT_ID)}`);
});

test("Will expose session mode, busy state, navigation route and model tool name", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (agentName === "main-agent" && last.content === "go") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "navigate-to-target", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

  const TARGET_AGENT = addAgent({ agentName: "target-agent", completion: MOCK_COMPLETION, prompt: "" });

  const NAVIGATE_TOOL = addAgentNavigation({
    toolName: "navigate-to-target",
    description: "Navigate to the target agent",
    navigateTo: TARGET_AGENT,
  });

  const DYNAMIC_TOOL = addTool({
    toolName: "tool-dynamic",
    validate: () => true,
    type: "function",
    function: async () => ({
      name: "dynamic_model_name",
      description: "",
      parameters: { type: "object", properties: {}, required: [] },
    }),
    call: async () => {},
  });

  const MAIN_AGENT = addAgent({
    agentName: "main-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [NAVIGATE_TOOL, DYNAMIC_TOOL],
    dependsOn: [TARGET_AGENT],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [MAIN_AGENT, TARGET_AGENT],
    defaultAgent: MAIN_AGENT,
  });

  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const mode = await getSessionMode(CLIENT_ID);
  const busyIdle = await getCheckBusy(CLIENT_ID);
  await chatSession.complete("go");
  const navigated = await hasNavigation(CLIENT_ID, TARGET_AGENT);
  const modelToolName = await getToolNameForModel(DYNAMIC_TOOL, CLIENT_ID, MAIN_AGENT);
  await chatSession.dispose();

  const ok =
    mode === "session" &&
    busyIdle === false &&
    navigated === true &&
    modelToolName === "dynamic_model_name" &&
    hasSession(CLIENT_ID) === false;

  if (ok) {
    pass();
    return;
  }
  fail(`mode=${mode} busyIdle=${busyIdle} navigated=${navigated} toolName=${modelToolName}`);
});

test("Will produce and validate structured output via outline json()", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const OUTLINE_COMPLETION = addCompletion({
    completionName: "json-completion",
    json: true,
    getCompletion: async ({ messages }) => {
      const [last] = messages.slice(-1);
      return { role: "assistant", content: JSON.stringify({ value: last.content }) };
    },
  });

  addOutline({
    outlineName: "test-outline",
    completion: OUTLINE_COMPLETION,
    maxAttempts: 2,
    format: {
      type: "object",
      required: ["value"],
      properties: { value: { type: "string", description: "value" } },
    },
    getOutlineHistory: async ({ history }, param) => {
      await history.push({ role: "user", content: String(param) });
    },
    validations: [
      async ({ data }) => {
        if (data.value !== "42") {
          throw new Error("value must be 42");
        }
      },
    ],
  });

  const good = await json("test-outline", "42");
  const bad = await json("test-outline", "13");

  const ok =
    good.isValid === true &&
    good.data.value === "42" &&
    bad.isValid === false &&
    bad.attempt === 2 &&
    String(bad.error).includes("42");

  if (ok) {
    pass();
    return;
  }
  fail(
    `good=${JSON.stringify(good.data)} bad=${JSON.stringify({ isValid: bad.isValid, attempt: bad.attempt, error: bad.error })}`
  );
});

test("Will run one-shot chat completion", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "chat-completion",
    getCompletion: async ({ messages }) => {
      const [last] = messages.slice(-1);
      return { role: "assistant", content: `chat:${last.content}` };
    },
  });

  const output = await chat("chat-completion", [{ role: "user", content: "ping" }]);

  if (output === "chat:ping") {
    pass();
    return;
  }
  fail(`output=${output}`);
});

test("Will answer through advisor ask()", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const events = [];

  addAdvisor({
    advisorName: "test-advisor",
    getChat: async (message) => `adv:${message}`,
    callbacks: {
      onChat: (message) => events.push(`chat:${message}`),
      onResult: (resultId, content) => events.push(`result:${content}`),
    },
  });

  const output = await ask("question", "test-advisor");

  if (output === "adv:question" && events.join(",") === "chat:question,result:adv:question") {
    pass();
    return;
  }
  fail(`output=${output} events=${events}`);
});

test("Will deliver custom events to topic listeners", async ({ pass, fail }) => {
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
  let payloadSeen = null;
  listenEvent(CLIENT_ID, "my-topic", (payload) => {
    payloadSeen = payload;
  });
  await event(CLIENT_ID, "my-topic", { a: 1 });
  await sleep(50);
  await chatSession.dispose();

  if (payloadSeen?.a === 1) {
    pass();
    return;
  }
  fail(`payload=${JSON.stringify(payloadSeen)}`);
});
