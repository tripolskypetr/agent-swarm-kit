import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addPolicy,
  addSwarm,
  commitUserMessage,
  session,
  setConfig,
  Policy,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (promise, ms = 8000) =>
  Promise.race([promise, sleep(ms).then(() => HANG)]);

const addEcho = (name) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

test("Will keep ban sets isolated between swarms sharing a policy", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const persistedBySwarm = {};
  const POLICY = addPolicy({
    policyName: "fy1-policy",
    persist: false,
    banMessage: "BANNED",
    validateInput: async () => true,
    getBannedClients: async () => [],
    setBannedClients: async (clientIds, _policyName, swarmName) => {
      persistedBySwarm[swarmName] = [...clientIds];
    },
  });
  const C = addEcho("fy1-completion");
  const AGENT_A = addAgent({ agentName: "fy1-agent-a", completion: C, prompt: "" });
  const AGENT_B = addAgent({ agentName: "fy1-agent-b", completion: C, prompt: "" });
  const SWARM_A = addSwarm({
    swarmName: "fy1-swarm-a",
    agentList: [AGENT_A],
    defaultAgent: AGENT_A,
    policies: [POLICY],
  });
  const SWARM_B = addSwarm({
    swarmName: "fy1-swarm-b",
    agentList: [AGENT_B],
    defaultAgent: AGENT_B,
    policies: [POLICY],
  });

  const cid = randomString();
  // The ClientPolicy instance is memoized per policyName and outlives the
  // sessions, so its per-swarm ban sets persist across these three phases.
  // Populate swarm B's view first: with a shared ban set the later ban in
  // swarm A used to leak into it.
  const sessionB = session(cid, SWARM_B);
  const bannedInBBefore = await Policy.hasBan({ clientId: cid, swarmName: SWARM_B, policyName: POLICY });
  await sessionB.dispose();

  const sessionA = session(cid, SWARM_A);
  await Policy.banClient({ clientId: cid, swarmName: SWARM_A, policyName: POLICY });
  const bannedInA = await Policy.hasBan({ clientId: cid, swarmName: SWARM_A, policyName: POLICY });
  await sessionA.dispose();

  const sessionB2 = session(cid, SWARM_B);
  const bannedInBAfter = await Policy.hasBan({ clientId: cid, swarmName: SWARM_B, policyName: POLICY });
  await sessionB2.dispose();

  const ok =
    bannedInBBefore === false &&
    bannedInA === true &&
    bannedInBAfter === false &&
    JSON.stringify(persistedBySwarm) === JSON.stringify({ [SWARM_A]: [cid] });
  if (ok) {
    pass();
    return;
  }
  fail(
    `bBefore=${bannedInBBefore} a=${bannedInA} bAfter=${bannedInBAfter} persisted=${JSON.stringify(persistedBySwarm)}`
  );
});

test("Will fire onBanClient only when the ban actually happens", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let banEvents = 0;
  const POLICY = addPolicy({
    policyName: "fy2-policy",
    persist: false,
    banMessage: "BANNED",
    validateInput: async () => true,
    getBannedClients: async () => [],
    callbacks: {
      onBanClient: () => {
        banEvents += 1;
      },
    },
  });
  const C = addEcho("fy2-completion");
  const AGENT = addAgent({ agentName: "fy2-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "fy2-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    policies: [POLICY],
  });

  const cid = randomString();
  const chatSession = session(cid, SWARM);
  await Policy.banClient({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  await Policy.banClient({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  const banned = await Policy.hasBan({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  await chatSession.dispose();

  const ok = banned === true && banEvents === 1;
  if (ok) {
    pass();
    return;
  }
  fail(`banned=${banned} banEvents=${banEvents}`);
});

test("Will apply the output transform exactly once", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let transformCalls = 0;
  const C = addEcho("fy3-completion");
  const AGENT = addAgent({
    agentName: "fy3-agent",
    completion: C,
    prompt: "",
    transform: (input) => {
      transformCalls += 1;
      return `T[${input}]`;
    },
  });
  const SWARM = addSwarm({ swarmName: "fy3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const cid = randomString();
  const chatSession = session(cid, SWARM);
  const result = await raceHang(chatSession.complete("hi"));
  await chatSession.dispose();

  // A non-idempotent transform makes double application visible directly:
  // the old code produced T[T[echo:hi]].
  const ok = result === "T[echo:hi]" && transformCalls === 1;
  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} transformCalls=${transformCalls}`);
});

test("Will fire onAssistantMessage for a plain answer", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const assistantMessages = [];
  const C = addEcho("fy4-completion");
  const AGENT = addAgent({
    agentName: "fy4-agent",
    completion: C,
    prompt: "",
    callbacks: {
      onAssistantMessage: (_clientId, _agentName, message) => {
        assistantMessages.push(message);
      },
    },
  });
  const SWARM = addSwarm({ swarmName: "fy4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const cid = randomString();
  const chatSession = session(cid, SWARM);
  const result = await raceHang(chatSession.complete("ping"));
  await chatSession.dispose();

  const ok =
    result === "echo:ping" &&
    assistantMessages.length === 1 &&
    assistantMessages[0] === "echo:ping";
  if (ok) {
    pass();
    return;
  }
  fail(`result=${String(result)} assistantMessages=${JSON.stringify(assistantMessages)}`);
});

test("Will dispose the previous operator signal before sending the next message", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let disposeCount = 0;
  const received = [];
  const AGENT = addAgent({
    agentName: "fy5-agent",
    operator: true,
    connectOperator: () => (message) => {
      received.push(message);
      return () => {
        disposeCount += 1;
      };
    },
  });
  const SWARM = addSwarm({ swarmName: "fy5-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const cid = randomString();
  const chatSession = session(cid, SWARM);
  await commitUserMessage("first", "user", cid, AGENT);
  await commitUserMessage("second", "user", cid, AGENT);
  await chatSession.dispose();

  // The first signal must be disposed when the second message opens a new
  // one, and the second on session dispose — the old code leaked the first.
  const ok =
    received.length === 2 &&
    received[0] === "first" &&
    received[1] === "second" &&
    disposeCount === 2;
  if (ok) {
    pass();
    return;
  }
  fail(`received=${JSON.stringify(received)} disposeCount=${disposeCount}`);
});
