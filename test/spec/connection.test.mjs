import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  changeAgent,
  complete,
  execute,
  getRawHistory,
  makeConnection,
  session,
  swarm,
  emit,
} from "../../build/index.mjs";
import { getErrorMessage, randomString, sleep } from "functools-kit";

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
    getCompletion: async ({ agentName, messages }) => {
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
  pass("");
});

test("Will orchestrate swarms for each connection", async ({ pass, fail }) => {
  const TOTAL_CHECKS = 100;

  const NAVIGATE_TOOL = addTool({
    toolName: "navigate-tool",
    call: async ({ toolId, clientId, agentName, params: { to } }) => {
      await changeAgent(to, clientId);
      await execute("Navigation complete", clientId, to);
    },
    validate: async () => true,
    type: "function",
    function: {
      name: "navigate-tool",
      description: "The tool for navigation",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "The target agent for navigation",
          },
        },
        required: ["to"],
      },
    },
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      if (content === "Navigation complete") {
        return {
          agentName,
          role: "assistant",
          content: "Ok",
        };
      }
      return {
        agentName,
        role: "assistant",
        content: "",
        tool_calls: [
          {
            function: {
              name: "navigate-tool",
              arguments: {
                to: content,
              },
            },
          },
        ],
      };
    },
  });

  const TRIAGE_AGENT = addAgent({
    agentName: "triage-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
    tools: [NAVIGATE_TOOL],
  });

  const SALES_AGENT = addAgent({
    agentName: "sales-agent",
    completion: MOCK_COMPLETION,
    prompt: "0",
    tools: [NAVIGATE_TOOL],
  });

  const REDUND_AGENT = addAgent({
    agentName: "refund-agent",
    completion: MOCK_COMPLETION,
    prompt: "0",
    tools: [NAVIGATE_TOOL],
  });

  const TEST_SWARM = addSwarm({
    agentList: [TRIAGE_AGENT, SALES_AGENT, REDUND_AGENT],
    defaultAgent: TRIAGE_AGENT,
    swarmName: "navigation-swarm",
  });

  const clientMap = new Map();
  const promises = [];

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    const { complete } = session(clientId, TEST_SWARM);
    const targetAgent = i % 2 === 0 ? SALES_AGENT : REDUND_AGENT;
    promises.push(
      complete(targetAgent).then(() => {
        clientMap.set(clientId, targetAgent);
      })
    );
    clientMap.set(clientId, targetAgent);
  }

  await Promise.all(promises);

  for (const [clientId, agentName] of clientMap) {
    const currentAgent = await swarm.swarmPublicService.getAgentName(
      "request-id",
      clientId,
      TEST_SWARM
    );
    if (agentName !== currentAgent) {
      fail(
        `The expected agent ${agentName} is not equal to ${currentAgent} for ${clientId}`
      );
    }
  }

  pass("");
});

test("Will queue user messages in connection", async ({ pass, fail }) => {
  const TOTAL_CHECKS = 10;

  const checkMessages = (messages) => {
    const assistantMessages = messages
      .filter(({ role }) => role === "assistant")
      .map(({ content }) => content);
    if (assistantMessages.length < 3) {
      return;
    }
    const [foo, bar, baz] = assistantMessages;
    if (foo !== "foo") {
      throw new Error(
        `Queue is broken on foo: ${assistantMessages.join(", ")}`
      );
    }
    if (bar !== "bar") {
      throw new Error(
        `Queue is broken on bar: ${assistantMessages.join(", ")}`
      );
    }
    if (baz !== "baz") {
      throw new Error(
        `Queue is broken on baz: ${assistantMessages.join(", ")}`
      );
    }
  };

  const MOCK_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: async ({ clientId, agentName, messages }) => {
      checkMessages(await getRawHistory(clientId));
      await sleep(Math.floor(Math.random() * 1_000));
      const [{ content }] = messages.slice(-1);

      if (content === "foo") {
        return {
          agentName,
          content: "foo",
          role: "assistant",
        };
      }
      if (content === "bar") {
        return {
          agentName,
          content: "bar",
          role: "assistant",
        };
      }
      if (content === "baz") {
        return {
          agentName,
          content: "baz",
          role: "assistant",
        };
      }
      return {
        agentName,
        content: "bad",
        role: "assistant",
      };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "Will return foo-bar-baz-bad",
  });

  const TEST_SWARM = addSwarm({
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
    swarmName: "test-swarm",
  });

  const messageList = ["foo", "bar", "baz", "bad", "bam"];
  const promises = [];

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    const { complete } = session(clientId, TEST_SWARM);
    for (const message of messageList) {
      promises.push(complete(message));
    }
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    fail(getErrorMessage(error));
  }

  promises.splice(0, promises.length);

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    const complete = makeConnection(() => {}, clientId, TEST_SWARM);
    for (const message of messageList) {
      promises.push(complete(message));
    }
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    fail(getErrorMessage(error));
  }

  promises.splice(0, promises.length);

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    session(clientId, TEST_SWARM);
    for (const message of messageList) {
      promises.push(execute(message, clientId, TEST_AGENT));
    }
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    fail(getErrorMessage(error));
  }

  pass("Ok");
});

test("Will allow server-side emit for makeConnection", async ({
  pass,
  fail,
}) => {
  const CLIENT_ID = randomString();
  const TOTAL_CHECKS = 100;

  const TEST_COMPLETION = addCompletion({
    completionName: "test-completion",
    getCompletion: async ({ agentName }) => {
      await sleep(Math.floor(Math.random() * 10));
      const totalMessages = await getRawHistory(CLIENT_ID);
      const assistantMessages = totalMessages.filter(
        ({ role }) => role === "assistant"
      );
      const [{ content = "0" } = {}] = assistantMessages.slice(-1);
      return {
        agentName,
        content: String(parseInt(content) + 1),
        role: "assistant",
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

  const outputList = [];
  const tasks = [];

  const send = makeConnection(
    (msg) => {
      outputList.push(msg);
    },
    CLIENT_ID,
    TEST_SWARM
  );

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    tasks.push(async () => {
      await send("inc");
    });
  }

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    tasks.push(async () => {
      await execute("inc", CLIENT_ID, TEST_AGENT);
    });
  }

  await Promise.all(tasks.map(async (task) => await task()));

  if (outputList.length !== TOTAL_CHECKS) {
    fail("Missing execute server-side message");
  }

  const maxItem = outputList.reduce(
    (acm, { data: value }) => Math.max(acm, parseInt(value)),
    Number.NEGATIVE_INFINITY
  );

  if (maxItem !== TOTAL_CHECKS * 2) {
    fail("Missing execute server-side message");
  }

  for (let idx = 1; idx !== TOTAL_CHECKS; idx++) {
    const { content: prevItem } = outputList[idx - 1];
    const { content: currentItem } = outputList[idx] - 1;
    if (prevItem !== currentItem) {
      fail(
        `The execution queue failed: prevItem=${prevItem} currentItem=${currentItem} idx=${idx}`
      );
    }
  }

  pass();
});

test("Will emit in makeConnection", async ({ pass, fail }) => {

  const CLIENT_ID = randomString();

  const TEST_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: async ({ agentName, messages }) => {
      if (!messages.length) {

      }
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
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

  const outputList = [];

  const complete = makeConnection(
    ({ data }) => {
      outputList.push(data);
    },
    CLIENT_ID,
    TEST_SWARM
  );

  await complete("foo");
  await emit("bar", CLIENT_ID, TEST_AGENT);
  await complete("baz");

  const history = await getRawHistory(CLIENT_ID);

  if (history.some(({ content }) => content === "bar")) {
    fail("emit should not be in messages history");
  }

  if (!outputList.includes("bar")) {
    fail("emit shoud be in outgoing");
  }

  pass();

});

test("Will not emit for session", async ({ pass, fail }) => {

  const CLIENT_ID = randomString();

  const TEST_COMPLETION = addCompletion({
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

  const { complete } = session(
    CLIENT_ID,
    TEST_SWARM
  );

  try {
    await complete("foo");
    await emit("bar", CLIENT_ID, TEST_AGENT);
    await complete("baz");
    fail("Exception not raise")
  } catch {
    pass();
  }

});
