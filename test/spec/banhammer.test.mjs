import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addPolicy,
  addSwarm,
  makeConnection,
  session,
  setConfig,
  Policy,
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

test("Will auto-ban client on input validation failure", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const POLICY = addPolicy({
    policyName: "b1-policy",
    persist: false,
    autoBan: true,
    banMessage: "AUTO-BANNED",
    validateInput: async (incoming) => incoming !== "bad",
  });
  const C = addEcho("b1-completion");
  const AGENT = addAgent({ agentName: "b1-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({ swarmName: "b1-swarm", agentList: [AGENT], defaultAgent: AGENT, policies: [POLICY] });

  const cid = randomString();
  const cs = session(cid, SWARM);
  const beforeBan = await cs.complete("hello");
  const bad = await cs.complete("bad");
  const bannedNow = await Policy.hasBan({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  const afterBan = await cs.complete("hello");
  await cs.dispose();

  const ok =
    beforeBan === "echo:hello" && bad === "AUTO-BANNED" && bannedNow === true && afterBan === "AUTO-BANNED";

  if (ok) {
    pass();
    return;
  }
  fail(`before=${beforeBan} bad=${bad} banned=${bannedNow} after=${afterBan}`);
});

test("Will use banhammer placeholder when banMessage is missing", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const POLICY = addPolicy({
    policyName: "b2-policy",
    persist: false,
    validateInput: async (incoming) => incoming !== "bad",
  });
  const C = addEcho("b2-completion");
  const AGENT = addAgent({ agentName: "b2-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({ swarmName: "b2-swarm", agentList: [AGENT], defaultAgent: AGENT, policies: [POLICY] });

  const cid = randomString();
  const cs = session(cid, SWARM);
  const defaultMessage = await cs.complete("bad");
  await cs.dispose();

  const ok =
    defaultMessage === "I am not going to discuss it!";

  if (ok) {
    pass();
    return;
  }
  fail(`message=${JSON.stringify(defaultMessage)}`);
});

test("Will auto-ban client on output validation failure", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const POLICY = addPolicy({
    policyName: "b3-policy",
    persist: false,
    autoBan: true,
    banMessage: "OUTPUT-BANNED",
    validateOutput: async (outgoing) => !outgoing.includes("secret"),
  });
  addCompletion({
    completionName: "b3-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "leak") {
        return { agentName, content: "the-secret-data", role: "assistant" };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "b3-agent", completion: "b3-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "b3-swarm", agentList: [AGENT], defaultAgent: AGENT, policies: [POLICY] });

  const cid = randomString();
  const cs = session(cid, SWARM);
  const leak = await cs.complete("leak");
  const bannedNow = await Policy.hasBan({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  const afterBan = await cs.complete("hello");
  await cs.dispose();

  const ok =
    leak === "OUTPUT-BANNED" && bannedNow === true && afterBan === "OUTPUT-BANNED";

  if (ok) {
    pass();
    return;
  }
  fail(`leak=${leak} banned=${bannedNow} after=${afterBan}`);
});

test("Will deliver ban message to banned makeConnection client", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const POLICY = addPolicy({
    policyName: "b4-policy",
    persist: false,
    banMessage: "CONN-BANNED",
    validateInput: async () => true,
  });
  const C = addEcho("b4-completion");
  const AGENT = addAgent({ agentName: "b4-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({ swarmName: "b4-swarm", agentList: [AGENT], defaultAgent: AGENT, policies: [POLICY] });

  const cid = randomString();
  const received = [];
  const send = makeConnection((msg) => received.push(msg.data), cid, SWARM);
  await send("hello");
  await Policy.banClient({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  await send("after-ban");
  await sleep(100);

  const ok =
    received[0] === "echo:hello" && received[1] === "CONN-BANNED";

  if (ok) {
    pass();
    return;
  }
  fail(`received=${JSON.stringify(received)}`);
});

test("Will restore flow after unban of auto-banned client", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const POLICY = addPolicy({
    policyName: "b5-policy",
    persist: false,
    autoBan: true,
    banMessage: "B5-BANNED",
    validateInput: async (incoming) => incoming !== "bad",
  });
  const C = addEcho("b5-completion");
  const AGENT = addAgent({ agentName: "b5-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({ swarmName: "b5-swarm", agentList: [AGENT], defaultAgent: AGENT, policies: [POLICY] });

  const cid = randomString();
  const cs = session(cid, SWARM);
  await cs.complete("bad");
  const whileBanned = await cs.complete("hello");
  await Policy.unbanClient({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  const afterUnban = await cs.complete("hello");
  await cs.dispose();

  const ok =
    whileBanned === "B5-BANNED" && afterUnban === "echo:hello";

  if (ok) {
    pass();
    return;
  }
  fail(`whileBanned=${whileBanned} afterUnban=${afterUnban}`);
});

test("Will fall back to banMessage when getBanMessage returns null", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const POLICY = addPolicy({
    policyName: "b6-policy",
    persist: false,
    banMessage: "FALLBACK-MESSAGE",
    getBanMessage: async () => null,
    validateInput: async (incoming) => incoming !== "bad",
  });
  const C = addEcho("b6-completion");
  const AGENT = addAgent({ agentName: "b6-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({ swarmName: "b6-swarm", agentList: [AGENT], defaultAgent: AGENT, policies: [POLICY] });

  const cid = randomString();
  const cs = session(cid, SWARM);
  const blocked = await cs.complete("bad");
  await cs.dispose();

  const ok =
    blocked === "FALLBACK-MESSAGE";

  if (ok) {
    pass();
    return;
  }
  fail(`blocked=${blocked}`);
});

test("Will check ban before invoking validateInput", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let validateCalls = 0;
  const POLICY = addPolicy({
    policyName: "b7-policy",
    persist: false,
    banMessage: "B7-BANNED",
    validateInput: async () => {
      validateCalls += 1;
      return true;
    },
  });
  const C = addEcho("b7-completion");
  const AGENT = addAgent({ agentName: "b7-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({ swarmName: "b7-swarm", agentList: [AGENT], defaultAgent: AGENT, policies: [POLICY] });

  const cid = randomString();
  const cs = session(cid, SWARM);
  await Policy.banClient({ clientId: cid, swarmName: SWARM, policyName: POLICY });
  const blocked = await cs.complete("hello");
  await cs.dispose();

  const ok =
    blocked === "B7-BANNED" && validateCalls === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`blocked=${blocked} validateCalls=${validateCalls}`);
});

test("Will block via single merged policy ban and restore on unban", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const PASS_POLICY = addPolicy({
    policyName: "b8-pass",
    persist: false,
    banMessage: "PASS-BANNED",
    validateInput: async () => true,
  });
  const STRICT_POLICY = addPolicy({
    policyName: "b8-strict",
    persist: false,
    banMessage: "STRICT-BANNED",
    validateInput: async () => true,
  });
  const C = addEcho("b8-completion");
  const AGENT = addAgent({ agentName: "b8-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "b8-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    policies: [PASS_POLICY, STRICT_POLICY],
  });

  const cid = randomString();
  const cs = session(cid, SWARM);
  await Policy.banClient({ clientId: cid, swarmName: SWARM, policyName: STRICT_POLICY });
  const banInPass = await Policy.hasBan({ clientId: cid, swarmName: SWARM, policyName: PASS_POLICY });
  const banInStrict = await Policy.hasBan({ clientId: cid, swarmName: SWARM, policyName: STRICT_POLICY });
  const blocked = await cs.complete("hello");
  await Policy.unbanClient({ clientId: cid, swarmName: SWARM, policyName: STRICT_POLICY });
  const restored = await cs.complete("hello");
  await cs.dispose();

  const ok =
    banInPass === false && banInStrict === true && blocked === "STRICT-BANNED" && restored === "echo:hello";

  if (ok) {
    pass();
    return;
  }
  fail(`banInPass=${banInPass} banInStrict=${banInStrict} blocked=${blocked} restored=${restored}`);
});

