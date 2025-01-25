import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  changeAgent,
  execute,
  getRawHistory,
  commitSystemMessage,
  commitToolOutput,
  session,
} from "../../build/index.mjs";

import { randomString } from "functools-kit";

test("Will ignote execute due to the obsolete agent", async ({
  pass,
  fail,
}) => {
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const TEST1_AGENT = addAgent({
    agentName: "test1-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST2_AGENT = addAgent({
    agentName: "test2-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    agentList: [TEST1_AGENT, TEST2_AGENT],
    defaultAgent: TEST1_AGENT,
    swarmName: "test-swarm",
  });

  const { complete } = session(CLIENT_ID, TEST_SWARM);

  await complete("foo");
  await execute("bar", CLIENT_ID, TEST2_AGENT);

  {
    const history = await getRawHistory(CLIENT_ID);
    const [{ content }] = history.slice(-1);
    if (content !== "foo") {
      fail("bar should not be executed due to the inactive agent");
    }
  }

  await changeAgent(TEST2_AGENT, CLIENT_ID);
  await execute("bar", CLIENT_ID, TEST2_AGENT);

  {
    const history = await getRawHistory(CLIENT_ID);
    const [{ content }] = history.slice(-1);
    if (content === "foo") {
      fail("bar should be executed due to the agent become active");
    }
  }

  pass();
});

test("Will ignote commitToolOutput due to the obsolete agent", async ({
  pass,
  fail,
}) => {
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const TEST1_AGENT = addAgent({
    agentName: "test1-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST2_AGENT = addAgent({
    agentName: "test2-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    agentList: [TEST1_AGENT, TEST2_AGENT],
    defaultAgent: TEST1_AGENT,
    swarmName: "test-swarm",
  });

  const { complete } = session(CLIENT_ID, TEST_SWARM);

  await commitToolOutput("foo", CLIENT_ID, TEST1_AGENT);
  await commitToolOutput("bar", CLIENT_ID, TEST2_AGENT);
  await complete("test");

  {
    const history = await getRawHistory(CLIENT_ID);
    const [{ content }] = history
      .filter(({ role }) => role === "tool")
      .slice(-1);
    if (content !== "foo") {
      fail("bar should not be executed due to the inactive agent");
    }
  }

  await commitToolOutput("bar", CLIENT_ID, TEST1_AGENT);
  await complete("test");

  {
    const history = await getRawHistory(CLIENT_ID);
    const [{ content }] = history
      .filter(({ role }) => role === "tool")
      .slice(-1);
    if (content === "foo") {
      fail("bar should be executed due to the agent become active");
    }
  }

  pass();
});

test("Will ignote commitSystemMessage due to the obsolete agent", async ({
  pass,
  fail,
}) => {
  const CLIENT_ID = randomString();

  const MOCK_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const TEST1_AGENT = addAgent({
    agentName: "test1-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST2_AGENT = addAgent({
    agentName: "test2-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    agentList: [TEST1_AGENT, TEST2_AGENT],
    defaultAgent: TEST1_AGENT,
    swarmName: "test-swarm",
  });

  const { complete } = session(CLIENT_ID, TEST_SWARM);

  await commitSystemMessage("foo", CLIENT_ID, TEST1_AGENT);
  await commitSystemMessage("bar", CLIENT_ID, TEST2_AGENT);
  await complete("test");

  {
    const history = await getRawHistory(CLIENT_ID);
    const [{ content }] = history
      .filter(({ role }) => role === "system")
      .slice(-1);
    if (content !== "foo") {
      fail("bar should not be executed due to the inactive agent");
    }
  }

  await commitSystemMessage("bar", CLIENT_ID, TEST1_AGENT);
  await complete("test");

  {
    const history = await getRawHistory(CLIENT_ID);
    const [{ content }] = history
      .filter(({ role }) => role === "system")
      .slice(-1);
    if (content === "foo") {
      fail("bar should be executed due to the agent become active");
    }
  }

  pass();
});
