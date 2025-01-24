import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  complete,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const debug = {
  log(...args) {
    void 0;
  },
};

test("Will clear history for similar clientId after each parallel complete call", async ({
  pass,
  fail,
}) => {
  const CLIENT_ID = randomString();

  const USER_MESSAGE = "Hey! Please increment the value";

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async (agentName, messages) => {
      const [{ content }] = messages;
      await sleep(1);
      return {
        role: "assistant",
        agentName,
        content: String(parseInt(content) + 1),
      };
    },
  });

  const INCREMENT_AGENT = addAgent({
    agentName: "increment-agent",
    completion: MOCK_COMPLETION,
    prompt: "0",
  });

  const TEST_SWARM = addSwarm({
    agentList: [INCREMENT_AGENT],
    defaultAgent: INCREMENT_AGENT,
    swarmName: "test-swarm",
  });

  const result = await Promise.all(
    Array.from({ length: 50 }, () =>
      complete(USER_MESSAGE, CLIENT_ID, TEST_SWARM)
    )
  );

  if (result.some((value) => value !== "1")) {
    fail("The session queue is not working");
    return;
  }
  pass();
});
