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

const TOTAL_ATTEMPTS = 25;
const JIT_ATTEMPTS = 5;
const COMPLETES_PER_ITER = 25;
const PARALLEL_EXECUTIONS = 5;
const SCHEDULED_DELAY = 0;

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
    TEST_COMPLETION,
    {
      delay: SCHEDULED_DELAY,
    }
  );

  const outputs = await Promise.all([
    /**
     * Using `scheduled` session so only the last complete
     * will be executed
     */
    ...Array.from({length: PARALLEL_EXECUTIONS}, () => complete("inc")),
    commitUserMessage("inc", CLIENT_ID, TEST_AGENT).then(() => "0"),
    execute("inc", CLIENT_ID, TEST_AGENT),
  ]);

  const maxItem = Math.max(...outputs.map(Number));

  assert.equal(maxItem, 3, "The queue is not working");

  await dispose();

  CLIENT_IDS.push(CLIENT_ID);
};

const runInParallel = async () => {
    const promises = [];
    for (let i = 0; i !== COMPLETES_PER_ITER; i++) {
        promises.push(runBenchmark());
    }
    await Promise.all(promises);
}

console.log("Benchmark started")

for (let i = 0; i !== TOTAL_ATTEMPTS; i++) {

  if (i < JIT_ATTEMPTS) {
    console.log(`Attempt ${i + 1} (JIT)`);
    await runInParallel();
  } else {
    console.time(`Attempt ${i + 1}`);
    await runInParallel();
    console.timeEnd(`Attempt ${i + 1}`);
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
