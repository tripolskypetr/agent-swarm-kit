import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  cancelOutput,
  commitToolOutput,
  emit,
  executeForce,
  makeConnection,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (promise, ms = 8000) =>
  Promise.race([promise, sleep(ms).then(() => HANG)]);

test("Will keep pairing when second message arrives during slow tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  addCompletion({
    completionName: "d1-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "with-tool") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "d1_slow", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "d1_slow",
    validate: () => true,
    type: "function",
    function: { name: "d1_slow", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName, isLast }) => {
      await sleep(200);
      await commitToolOutput(toolId, "slow-done", clientId, agentName);
      if (isLast) {
        await executeForce("tool-finish", clientId);
      }
    },
  });
  const AGENT = addAgent({ agentName: "d1-agent", completion: "d1-completion", prompt: "", tools: ["d1_slow"] });
  const SWARM = addSwarm({ swarmName: "d1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const first = chatSession.complete("with-tool");
  await sleep(50); // first is inside the slow tool now
  const second = chatSession.complete("plain");
  const [r1, r2] = await Promise.all([raceHang(first), raceHang(second)]);
  await chatSession.dispose();

  const ok =
    r1 === "echo:tool-finish" && r2 === "echo:plain";

  if (ok) {
    pass();
    return;
  }
  fail(`r1=${String(r1)} r2=${String(r2)}`);
});

test("Will keep pairing for fire-and-forget double send", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const outputs = [];
  addCompletion({
    completionName: "d2-completion",
    getCompletion: async ({ agentName, messages }) => {
      await sleep(80);
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "d2-agent", completion: "d2-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "d2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  chatSession.complete("first").then((r) => outputs.push(`first:${r}`));
  chatSession.complete("second").then((r) => outputs.push(`second:${r}`));
  const third = await raceHang(chatSession.complete("third"), 8000);
  await sleep(100);
  await chatSession.dispose();

  const ok =
    third === "echo:third" &&
    outputs.includes("first:echo:first") &&
    outputs.includes("second:echo:second");
  if (ok) {
    pass();
    return;
  }
  fail(`third=${String(third)} outputs=${JSON.stringify(outputs)}`);
});

test("Will keep makeConnection double send ordered", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  const received = [];
  addCompletion({
    completionName: "d3-completion",
    getCompletion: async ({ agentName, messages }) => {
      await sleep(Math.floor(Math.random() * 40));
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "d3-agent", completion: "d3-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "d3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const send = makeConnection(
    ({ data }) => {
      received.push(data);
    },
    CLIENT_ID,
    SWARM
  );

  const p1 = send("one");
  const p2 = send("two");
  const done = await raceHang(Promise.all([p1, p2]), 8000);
  await sleep(100);

  const ok =
    done !== HANG &&
    received.length === 2 &&
    received[0] === "echo:one" &&
    received[1] === "echo:two";
  if (ok) {
    pass();
    return;
  }
  fail(`received=${JSON.stringify(received)}`);
});

test("Will not poison next exchange after cancelOutput", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  addCompletion({
    completionName: "d4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "slow-question") {
        await sleep(300);
        return { agentName, content: "STALE-ANSWER", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "d4-agent", completion: "d4-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "d4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const first = chatSession.complete("slow-question");
  await sleep(50);
  await cancelOutput(CLIENT_ID, AGENT);
  const r1 = await raceHang(first);
  const r2 = await raceHang(chatSession.complete("next-question"));
  await sleep(400);
  await chatSession.dispose();

  const ok =
    r1 === "" && r2 === "echo:next-question";

  if (ok) {
    pass();
    return;
  }
  fail(`r1=${String(r1)} r2=${String(r2)}`);
});

test("Will not poison next exchange after emit substitution", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const CLIENT_ID = randomString();
  addCompletion({
    completionName: "d5-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "slow-question") {
        await sleep(300);
        return { agentName, content: "STALE-ANSWER", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "d5-agent", completion: "d5-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "d5-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(CLIENT_ID, SWARM);
  const first = chatSession.complete("slow-question");
  await sleep(50);
  await emit("hijacked", CLIENT_ID, AGENT);
  const r1 = await raceHang(first);
  const r2 = await raceHang(chatSession.complete("next-question"));
  await sleep(400);
  await chatSession.dispose();

  const ok =
    r1 === "hijacked" && r2 === "echo:next-question";

  if (ok) {
    pass();
    return;
  }
  fail(`r1=${String(r1)} r2=${String(r2)}`);
});

