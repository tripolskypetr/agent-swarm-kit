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
} from "../../build/index.mjs";
import { randomString } from "functools-kit";
import assert from "assert";

const SCHEDULED_DELAY = 0;

setConfig({
  CC_SWARM_AGENT_CHANGED: () => Promise.resolve(),
  CC_SWARM_DEFAULT_AGENT: ({}, {}, defaultAgent) =>
    Promise.resolve(defaultAgent),
});

const TEST_COMPLETION = addCompletion({
  completionName: "test-completion",
  getCompletion: async ({ agentName, clientId }) => {
    const content = (await getLastSystemMessage(clientId)) ?? "0";
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

  console.time("Execution");
  console.log(await complete("test"));
  console.log(await complete("test"));
  console.log(await complete("test"));
  console.timeEnd("Execution");
};

runBenchmark();
