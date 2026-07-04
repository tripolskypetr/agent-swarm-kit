import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  commitSystemMessage,
  commitFlushForce,
  disposeConnection,
  makeConnection,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (p, ms = 8000) => Promise.race([p, sleep(ms).then(() => HANG)]);

test("Will resolve own in-flight complete with empty output on dispose", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "e1-completion",
    getCompletion: async ({ agentName, messages }) => {
      await sleep(300);
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "e1-agent", completion: "e1-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "e1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const chatSession = session(randomString(), SWARM);
  const pending = chatSession.complete("question");
  await sleep(50);
  const disposeResult = await raceHang(chatSession.dispose());
  const result = await raceHang(pending);
  await sleep(400);

  const ok =
    disposeResult !== HANG && result === "";

  if (ok) {
    pass();
    return;
  }
  fail(`dispose=${String(disposeResult)} result=${String(result)}`);
});

test("Will let the same client start fresh session after dispose mid-flight", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "e2-completion",
    getCompletion: async ({ agentName, messages }) => {
      await sleep(200);
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "e2-agent", completion: "e2-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "e2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const first = session(CLIENT_ID, SWARM);
  const pending = first.complete("question");
  await sleep(30);
  await first.dispose();
  const stale = await raceHang(pending);

  const second = session(CLIENT_ID, SWARM);
  const fresh = await raceHang(second.complete("again"), 6000);
  await second.dispose();
  await sleep(300);

  const ok =
    stale === "" && fresh === "echo:again";

  if (ok) {
    pass();
    return;
  }
  fail(`stale=${String(stale)} fresh=${String(fresh)}`);
});

test("Will resolve pending makeConnection send on disposeConnection", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "e3-completion",
    getCompletion: async ({ agentName, messages }) => {
      await sleep(250);
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "e3-agent", completion: "e3-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "e3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const received = [];
  const send = makeConnection((msg) => received.push(msg.data), CLIENT_ID, SWARM);
  const pending = send("question");
  await sleep(30);
  await raceHang(disposeConnection(CLIENT_ID, SWARM));
  const result = await raceHang(pending);
  await sleep(300);

  const ok =
    result !== HANG;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} received=${JSON.stringify(received)}`);
});

test("Will keep system messages beyond keepMessages window", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let systemSeen = null;
  let commonCount = null;
  addCompletion({
    completionName: "e4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "turn4") {
        systemSeen = messages
          .filter((m) => m.role === "system")
          .map((m) => m.content);
        commonCount = messages.filter((m) => m.role !== "system").length;
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({
    agentName: "e4-agent",
    completion: "e4-completion",
    prompt: "",
    keepMessages: 2,
  });
  const SWARM = addSwarm({ swarmName: "e4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  await commitSystemMessage("rule-one", CLIENT_ID, AGENT);
  await chatSession.complete("turn1");
  await commitSystemMessage("rule-two", CLIENT_ID, AGENT);
  await chatSession.complete("turn2");
  await chatSession.complete("turn3");
  await chatSession.complete("turn4");
  await chatSession.dispose();

  const ok =
    Array.isArray(systemSeen) &&
    systemSeen.includes("rule-one") &&
    systemSeen.includes("rule-two") &&
    commonCount === 2;
  if (ok) {
    pass();
    return;
  }
  fail(`system=${JSON.stringify(systemSeen)} commonCount=${commonCount}`);
});

test("Will clear accumulated system messages on flush", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let systemAfterFlush = null;
  addCompletion({
    completionName: "e5-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "after-flush") {
        systemAfterFlush = messages
          .filter((m) => m.role === "system")
          .map((m) => m.content);
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "e5-agent", completion: "e5-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "e5-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  await commitSystemMessage("stale-rule", CLIENT_ID, AGENT);
  await chatSession.complete("turn1");
  await commitFlushForce(CLIENT_ID);
  await chatSession.complete("after-flush");
  await chatSession.dispose();

  const ok = Array.isArray(systemAfterFlush) && !systemAfterFlush.includes("stale-rule");
  if (ok) {
    pass();
    return;
  }
  fail(`system=${JSON.stringify(systemAfterFlush)}`);
});

