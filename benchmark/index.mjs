import {
  addAgent,
  addCompletion,
  addSwarm,
  commitUserMessage,
  execute,
  getLastSystemMessage,
  session,
  setConfig,
  swarm,
} from "../build/index.mjs";
import { randomString } from "functools-kit";
import assert from "assert";

const TOTAL_ATTEMPTS = 10_000;
const JIT_ATTEMPTS = 500;

setConfig({
  CC_SWARM_AGENT_CHANGED: () => Promise.resolve(),
  CC_SWARM_DEFAULT_AGENT: ({}, {}, defaultAgent) =>
    Promise.resolve(defaultAgent),
});

const TEST_COMPLETION = addCompletion({
  completionName: "test-completion",
  getCompletion: async ({ agentName, clientId }) => {
    const content = await getLastSystemMessage(clientId) ?? "0";
    return {
      agentName,
      content: String(parseInt(content) + 1),
      role: "system",
    };
  },
});

const TEST_AGENT = addAgent({
  agentName: "test-agent",
  completion: TEST_COMPLETION,
  prompt: "0",
});

const TEST_SWARM = addSwarm({
  swarmName: "test-swarm",
  agentList: [TEST_AGENT],
  defaultAgent: TEST_AGENT,
});

const CLIENT_IDS = [];

const runBenchmark = async () => {
  const CLIENT_ID = randomString();

  const { complete, dispose } = session.scheduled(
    CLIENT_ID,
    TEST_SWARM,
    TEST_COMPLETION
  );

  const outputs = await Promise.all([
    complete("inc"),
    commitUserMessage("inc", CLIENT_ID, TEST_AGENT).then(() => "0"),
    execute("inc", CLIENT_ID, TEST_AGENT),
  ]);

  const maxItem = Math.max(...outputs.map(Number));

  assert.equal(maxItem, 2, "The queue is not working");

  await dispose();

  CLIENT_IDS.push(CLIENT_ID);
};

for (let i = 0; i !== TOTAL_ATTEMPTS; i++) {
  if (i < JIT_ATTEMPTS) {
    await runBenchmark();
  } else {
    console.time(`Attempt ${i}`);
    await runBenchmark();
    console.timeEnd(`Attempt ${i}`);
  }
}

for (const clientId of CLIENT_IDS) {
  assert.equal(
    swarm.sessionValidationService.getSessionAgentList(clientId).length,
    0,
    "The disposal is not working"
  );
  assert.equal(
    swarm.sessionValidationService.getSessionHistoryList(clientId).length,
    0,
    "The disposal is not working"
  );
}

console.log("Everything is ok")
