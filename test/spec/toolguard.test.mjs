import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  commitToolOutput,
  executeForce,
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

const makeScenario = (toolOverrides) => {
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "guarded_tool", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "guarded_tool",
    validate: () => true,
    type: "function",
    function: {
      name: "guarded_tool",
      description: "",
      parameters: { type: "object", properties: {}, required: [] },
    },
    call: async ({ toolId, clientId, agentName, isLast }) => {
      await commitToolOutput(toolId, "done", clientId, agentName);
      if (isLast) {
        await executeForce("finish", clientId);
      }
    },
    ...toolOverrides,
  });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    tools: ["guarded_tool"],
  });
  return addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });
};

const trackUnhandled = () => {
  const unhandled = [];
  process.on("unhandledRejection", (reason) => {
    unhandled.push(String(reason?.message ?? reason));
  });
  return unhandled;
};

test("Will survive throwing onValidate tool callback", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const TEST_SWARM = makeScenario({
    callbacks: {
      onValidate: () => {
        throw new Error("onValidate exploded");
      },
    },
  });

  const chatSession = session(randomString(), TEST_SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await sleep(100);
  await chatSession.dispose();

  if (result === "echo:finish" && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`result=${String(result)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will survive throwing onBeforeCall tool callback", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const TEST_SWARM = makeScenario({
    callbacks: {
      onBeforeCall: () => {
        throw new Error("onBeforeCall exploded");
      },
    },
  });

  const chatSession = session(randomString(), TEST_SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await sleep(100);
  await chatSession.dispose();

  if (result === "echo:finish" && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`result=${String(result)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will not treat throwing onAfterCall as a tool error", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const TEST_SWARM = makeScenario({
    callbacks: {
      onAfterCall: () => {
        throw new Error("onAfterCall exploded");
      },
    },
  });

  const chatSession = session(randomString(), TEST_SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await sleep(100);
  await chatSession.dispose();

  if (result === "echo:finish" && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`result=${String(result)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will recover with placeholder when onCallError throws too", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const TEST_SWARM = makeScenario({
    call: async () => {
      throw new Error("tool exploded");
    },
    callbacks: {
      onCallError: () => {
        throw new Error("onCallError exploded");
      },
    },
  });

  const chatSession = session(randomString(), TEST_SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await sleep(100);
  await chatSession.dispose();

  if (result !== HANG && PLACEHOLDERS.includes(result) && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`result=${String(result)} unhandled=${JSON.stringify(unhandled)}`);
});

test("Will treat throwing tool validate as failed validation", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const TEST_SWARM = makeScenario({
    validate: () => {
      throw new Error("validate exploded");
    },
  });

  const chatSession = session(randomString(), TEST_SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await sleep(100);
  await chatSession.dispose();

  if (result !== HANG && PLACEHOLDERS.includes(result) && unhandled.length === 0) {
    pass();
    return;
  }
  fail(`result=${String(result)} unhandled=${JSON.stringify(unhandled)}`);
});
