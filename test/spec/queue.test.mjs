import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  commitUserMessage,
  getLastUserMessage,
  getRawHistory,
  makeConnection,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const debug = {
  log(...args) {
    void 0;
  },
};

test("Will parallel completion for session", async ({ pass, fail }) => {
  const TEST_DELAY = 3_000;
  const TOTAL_TIMEOUT = 5_000;

  const TIMEOUT_SYMBOL = Symbol("timeout");

  const TEST_COMPLETION = addCompletion({
    completionName: "test-completion",
    getCompletion: async ({ agentName, messages }) => {
      await sleep(TEST_DELAY);
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

  const { complete: complete1 } = session(randomString(), TEST_SWARM);

  const { complete: complete2 } = session(randomString(), TEST_SWARM);

  const result = await Promise.race([
    complete1("Hello world"),
    complete2("Hello world"),
    sleep(TOTAL_TIMEOUT).then(() => TIMEOUT_SYMBOL),
  ]);

  if (result === TIMEOUT_SYMBOL) {
    fail("Tests was not executed in parallel");
  }

  if (result !== "Hello world") {
    fail("Model completion broken");
  }

  pass();
});

test("Will parallel completion for makeConnection", async ({ pass, fail }) => {
  const TEST_DELAY = 3_000;
  const TOTAL_TIMEOUT = 5_000;

  const TIMEOUT_SYMBOL = Symbol("timeout");

  const TEST_COMPLETION = addCompletion({
    completionName: "test-completion",
    getCompletion: async ({ agentName, messages }) => {
      await sleep(TEST_DELAY);
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

  const historyList1 = [];
  const historyList2 = [];

  const complete1 = makeConnection(({ data }) => void historyList1.push(data), randomString(), TEST_SWARM);
  const complete2 = makeConnection(({ data }) => void historyList2.push(data), randomString(), TEST_SWARM);

  const promises = [
    complete1("Hello world"),
    complete2("Hello world"),
  ];

  const result = await Promise.race([
    ...promises,
    sleep(TOTAL_TIMEOUT).then(() => TIMEOUT_SYMBOL),
  ]);

  await Promise.all(promises);

  if (result === TIMEOUT_SYMBOL) {
    fail("Tests was not executed in parallel");
  }

  if (historyList1[0] !== "Hello world") {
    fail("Model completion broken");
  }

  if (historyList2[0] !== "Hello world") {
    fail("Model completion broken");
  }

  pass();
});

test("Will commit user message for makeConnection without emit and execution", async ({ pass, fail }) => {
  
  const CLIENT_ID = randomString();

  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
  })

  const TEST_COMPLETION = addCompletion({
    completionName: "test-completion",
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

  const historyList = [];

  const complete = makeConnection(({ data }) => void historyList.push(data), CLIENT_ID, TEST_SWARM);
  
  await Promise.all([
    complete("foo"),
    commitUserMessage("bar", "user", CLIENT_ID, TEST_AGENT),
  ]);

  await commitUserMessage("baz", "user", CLIENT_ID, TEST_AGENT);

  const lastMessage = await getLastUserMessage(CLIENT_ID);

  if (lastMessage !== "baz") {
    fail("The last message was not pushed");
  }

  if (historyList.includes("bar")) {
    fail("bar should not be emitted");
  }

  const history = await getRawHistory(CLIENT_ID);

  if (!history.some(({ content }) => content === "foo")) {
    fail("foo should not be saved in history");
  }

  if (!history.some(({ content }) => content === "bar")) {
    fail("bar should not be saved in history");
  }

  if (!history.some(({ content }) => content === "baz")) {
    fail("baz should not be saved in history");
  }

  pass();
});
