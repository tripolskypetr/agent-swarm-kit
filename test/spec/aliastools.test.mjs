import { test } from "worker-testbed";

import {
  addAgent,
  addCommitAction,
  addCompletion,
  addFetchInfo,
  addSwarm,
  session,
  setConfig,
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

const HANG = Symbol("hang");
const raceHang = (promise, ms = 8000) =>
  Promise.race([promise, sleep(ms).then(() => HANG)]);

const trackUnhandled = () => {
  const unhandled = [];
  process.on("unhandledRejection", (reason) => {
    unhandled.push(String(reason?.message ?? reason));
  });
  return unhandled;
};

const makeSwarm = (suffix, toolName, lastToolMessages = {}) => {
  addCompletion({
    completionName: `${suffix}-completion`,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: toolName, arguments: { value: 5 } } }],
        };
      }
      lastToolMessages.toolContent =
        messages.filter((m) => m.role === "tool").slice(-1)[0]?.content ?? null;
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({
    agentName: `${suffix}-agent`,
    completion: `${suffix}-completion`,
    prompt: "",
    tools: [toolName],
  });
  return addSwarm({
    swarmName: `${suffix}-swarm`,
    agentList: [AGENT],
    defaultAgent: AGENT,
  });
};

test("Will recover commit action when validateParams throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addCommitAction({
    toolName: "t1_action",
    function: { name: "t1_action", description: "", parameters: { type: "object", properties: {}, required: [] } },
    validateParams: () => {
      throw new Error("validateParams exploded");
    },
    executeAction: () => "never",
    successMessage: "never",
  });
  const SWARM = makeSwarm("t1", "t1_action");
  const chatSession = session(randomString(), SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await chatSession.dispose();
  await sleep(100);
  const ok =
    (result !== HANG && PLACEHOLDERS.includes(result)) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will run commit action failure branch when executeAction throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  let fallbackError = "";
  const seen = {};
  addCommitAction({
    toolName: "t2_action",
    function: { name: "t2_action", description: "", parameters: { type: "object", properties: {}, required: [] } },
    executeAction: () => {
      throw new Error("action exploded");
    },
    fallback: (error) => {
      fallbackError = error.message;
    },
    successMessage: "action succeeded",
    failureMessage: "action failed",
  });
  const SWARM = makeSwarm("t2", "t2_action", seen);
  const chatSession = session(randomString(), SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await chatSession.dispose();
  await sleep(100);
  const ok =
    (result === "echo:action failed" &&
      fallbackError === "action exploded" &&
      String(seen.toolContent).includes("action exploded")) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} fallback=${fallbackError} toolContent=${seen.toolContent}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will recover commit action when successMessage throws after commit", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addCommitAction({
    toolName: "t3_action",
    function: { name: "t3_action", description: "", parameters: { type: "object", properties: {}, required: [] } },
    executeAction: () => "stored",
    successMessage: () => {
      throw new Error("successMessage exploded");
    },
  });
  const SWARM = makeSwarm("t3", "t3_action");
  const chatSession = session(randomString(), SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await chatSession.dispose();
  await sleep(100);
  const ok =
    (result !== HANG && PLACEHOLDERS.includes(result)) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will keep session usable after commit action happy path", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const executed = [];
  const seen = {};
  addCommitAction({
    toolName: "t4_action",
    function: {
      name: "t4_action",
      description: "",
      parameters: { type: "object", properties: { value: { type: "number" } }, required: [] },
    },
    executeAction: (params) => {
      executed.push(params.value);
      return `stored ${params.value}`;
    },
    successMessage: (params) => `saved:${params.value}`,
  });
  const SWARM = makeSwarm("t4", "t4_action", seen);
  const chatSession = session(randomString(), SWARM);
  const result = await raceHang(chatSession.complete("start"));
  const after = await raceHang(chatSession.complete("plain"));
  await chatSession.dispose();
  await sleep(100);
  const ok =
    (result === "echo:saved:5" &&
      after === "echo:plain" &&
      executed.join(",") === "5" &&
      seen.toolContent === "stored 5") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} after=${String(after)} executed=${executed} toolContent=${seen.toolContent}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will commit fallback content when fetchContent throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const seen = {};
  addFetchInfo({
    toolName: "t5_fetch",
    function: { name: "t5_fetch", description: "", parameters: { type: "object", properties: {}, required: [] } },
    fetchContent: () => {
      throw new Error("fetch exploded");
    },
  });
  const SWARM = makeSwarm("t5", "t5_fetch", seen);
  const chatSession = session(randomString(), SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await chatSession.dispose();
  await sleep(100);
  const ok =
    (result !== HANG &&
      typeof result === "string" &&
      typeof seen.toolContent === "string" &&
      seen.toolContent.length > 0) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} toolContent=${seen.toolContent}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will use custom emptyContent for empty fetch result", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const seen = {};
  addFetchInfo({
    toolName: "t6_fetch",
    function: { name: "t6_fetch", description: "", parameters: { type: "object", properties: {}, required: [] } },
    fetchContent: () => "",
    emptyContent: () => "nothing-found",
  });
  const SWARM = makeSwarm("t6", "t6_fetch", seen);
  const chatSession = session(randomString(), SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await chatSession.dispose();
  await sleep(100);
  const ok =
    (result !== HANG && seen.toolContent === "nothing-found") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} toolContent=${seen.toolContent}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will recover fetch info when validateParams throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addFetchInfo({
    toolName: "t7_fetch",
    function: { name: "t7_fetch", description: "", parameters: { type: "object", properties: {}, required: [] } },
    validateParams: () => {
      throw new Error("fetch validate exploded");
    },
    fetchContent: () => "never",
  });
  const SWARM = makeSwarm("t7", "t7_fetch");
  const chatSession = session(randomString(), SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await chatSession.dispose();
  await sleep(100);
  const ok =
    (result !== HANG && PLACEHOLDERS.includes(result)) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

