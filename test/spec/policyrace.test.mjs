import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addPolicy,
  session,
  setConfig,
  Policy,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const addEcho = () =>
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

/**
 * ClientPolicy.banClient is a read-modify-write over the shared _banSet with
 * awaits in between (getBannedClients + setBannedClients). It is not serialized
 * by a queue, unlike ClientState/ClientStorage. Two concurrent bans of DIFFERENT
 * clients on the same policy instance both read the same (empty) ban set, each
 * adds only its own client, and the later setBannedClients overwrites the earlier
 * one — one ban is silently lost, in memory and in the persisted store.
 */
test("Will not lose a concurrent ban of a different client", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let stored = [];
  const TEST_POLICY = addPolicy({
    policyName: "race-policy-different",
    banMessage: "BLOCKED",
    persist: false,
    // Slow persistence widens the window; the race exists without it too.
    getBannedClients: async () => {
      await sleep(5);
      return [...stored];
    },
    setBannedClients: async (list) => {
      await sleep(20);
      stored = [...list];
    },
    validateInput: async () => true,
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({
    agentName: "race-agent-different",
    completion: MOCK_COMPLETION,
    prompt: "",
  });
  const TEST_SWARM = addSwarm({
    swarmName: "race-swarm-different",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    policies: [TEST_POLICY],
  });

  const CLIENT_A = randomString();
  const CLIENT_B = randomString();
  session(CLIENT_A, TEST_SWARM);
  session(CLIENT_B, TEST_SWARM);

  await Promise.all([
    Policy.banClient({
      clientId: CLIENT_A,
      policyName: TEST_POLICY,
      swarmName: TEST_SWARM,
    }),
    Policy.banClient({
      clientId: CLIENT_B,
      policyName: TEST_POLICY,
      swarmName: TEST_SWARM,
    }),
  ]);

  const banA = await Policy.hasBan({
    clientId: CLIENT_A,
    policyName: TEST_POLICY,
    swarmName: TEST_SWARM,
  });
  const banB = await Policy.hasBan({
    clientId: CLIENT_B,
    policyName: TEST_POLICY,
    swarmName: TEST_SWARM,
  });

  if (banA && banB && stored.length === 2) {
    pass();
    return;
  }
  fail(
    `concurrent ban lost an update: hasBan A=${banA} B=${banB} persisted=${JSON.stringify(
      stored
    )}`
  );
});

/**
 * Same underlying race, observed through the persisted store: after two
 * concurrent bans both clients must be present in what setBannedClients received.
 */
test("Will persist both clients after concurrent bans", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let stored = [];
  const TEST_POLICY = addPolicy({
    policyName: "race-policy-persist",
    banMessage: "BLOCKED",
    persist: false,
    getBannedClients: async () => {
      await sleep(5);
      return [...stored];
    },
    setBannedClients: async (list) => {
      await sleep(20);
      stored = [...list];
    },
    validateInput: async () => true,
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({
    agentName: "race-agent-persist",
    completion: MOCK_COMPLETION,
    prompt: "",
  });
  const TEST_SWARM = addSwarm({
    swarmName: "race-swarm-persist",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    policies: [TEST_POLICY],
  });

  const CLIENT_A = randomString();
  const CLIENT_B = randomString();
  session(CLIENT_A, TEST_SWARM);
  session(CLIENT_B, TEST_SWARM);

  await Promise.all([
    Policy.banClient({
      clientId: CLIENT_A,
      policyName: TEST_POLICY,
      swarmName: TEST_SWARM,
    }),
    Policy.banClient({
      clientId: CLIENT_B,
      policyName: TEST_POLICY,
      swarmName: TEST_SWARM,
    }),
  ]);

  if (stored.length === 2 && stored.includes(CLIENT_A) && stored.includes(CLIENT_B)) {
    pass();
    return;
  }
  fail(`persisted ban set = ${JSON.stringify(stored)} (expected both clients)`);
});

/**
 * A banned client must not stop being banned because another client was banned
 * concurrently. This is the security-relevant symptom: the "loser" of the race
 * passes hasBan and can keep interacting despite having been banned.
 */
test("Will keep an already-issued ban after a concurrent ban of another client", async ({
  pass,
  fail,
}) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  let stored = [];
  const TEST_POLICY = addPolicy({
    policyName: "race-policy-security",
    banMessage: "BLOCKED",
    persist: false,
    getBannedClients: async () => [...stored],
    setBannedClients: async (list) => {
      await sleep(10);
      stored = [...list];
    },
    validateInput: async () => true,
  });

  const MOCK_COMPLETION = addEcho();
  const TEST_AGENT = addAgent({
    agentName: "race-agent-security",
    completion: MOCK_COMPLETION,
    prompt: "",
  });
  const TEST_SWARM = addSwarm({
    swarmName: "race-swarm-security",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    policies: [TEST_POLICY],
  });

  const CLIENT_A = randomString();
  const CLIENT_B = randomString();
  session(CLIENT_A, TEST_SWARM);
  session(CLIENT_B, TEST_SWARM);

  await Promise.all([
    Policy.banClient({
      clientId: CLIENT_A,
      policyName: TEST_POLICY,
      swarmName: TEST_SWARM,
    }),
    Policy.banClient({
      clientId: CLIENT_B,
      policyName: TEST_POLICY,
      swarmName: TEST_SWARM,
    }),
  ]);

  const banA = await Policy.hasBan({
    clientId: CLIENT_A,
    policyName: TEST_POLICY,
    swarmName: TEST_SWARM,
  });
  const banB = await Policy.hasBan({
    clientId: CLIENT_B,
    policyName: TEST_POLICY,
    swarmName: TEST_SWARM,
  });

  if (banA && banB) {
    pass();
    return;
  }
  fail(
    `a concurrently-banned client escaped the ban: hasBan A=${banA} B=${banB}`
  );
});
