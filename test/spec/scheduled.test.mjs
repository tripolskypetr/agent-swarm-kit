import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  commitUserMessage,
  getAssistantHistory,
  getLastUserMessage,
  getRawHistory,
  getUserHistory,
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

test("Will schedule messages for makeConnection", async ({ pass, fail }) => {
  const CLIENT_ID = randomString();
  const COMPLETION_DELAY = 500;

  setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
  })

  let completionCounter = 0;

  const TEST_COMPLETION = addCompletion({
    completionName: "test-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      await sleep(COMPLETION_DELAY);
      completionCounter += 1;
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

  const complete = makeConnection.scheduled(
    ({ data }) => void historyList.push(data),
    CLIENT_ID,
    TEST_SWARM
  );

  const TEST_CASE = [
    "foo",
    "bar",
    "baz",
    "bad",
  ];

  await Promise.all(TEST_CASE.map(complete));

  if (completionCounter !== 2) {
    fail("Messages not being scheduled")
  }

  const userHistory = await getUserHistory(CLIENT_ID);

  for (const testCase of TEST_CASE) {
    
    if (!userHistory.some(({ content }) => content === testCase)) {
        fail(`Missing ${testCase} in user messages`);
    }
  }

  for (const testCase of ["bad"]) {
    if (!historyList.includes(testCase)) {
        fail(`Missing ${testCase} in assistant messages ${historyList}`);
    }
  }

  pass();
});

test("Will schedule messages for session", async ({ pass, fail }) => {
    const CLIENT_ID = randomString();
    const COMPLETION_DELAY = 500;

    setConfig({
      CC_PERSIST_ENABLED_BY_DEFAULT: false,
    })

    let completionCounter = 0;
  
    const TEST_COMPLETION = addCompletion({
      completionName: "test-completion",
      getCompletion: async ({ agentName, messages }) => {
        const [{ content }] = messages.slice(-1);
        await sleep(COMPLETION_DELAY);
        completionCounter += 1;
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
  
    const { complete } = session.scheduled(
      CLIENT_ID,
      TEST_SWARM
    );
  
    const TEST_CASE = [
      "foo",
      "bar",
      "baz",
      "bad",
    ];
  
    await Promise.all(TEST_CASE.map(complete));
  
    if (completionCounter !== 2) {
      fail("Messages not being scheduled")
    }
  
    const userHistory = await getUserHistory(CLIENT_ID);
    const assistantHistory = await getAssistantHistory(CLIENT_ID);
  
    for (const testCase of TEST_CASE) {
      if (!userHistory.some(({ content }) => content === testCase)) {
          fail(`Missing ${testCase} in user messages data=${JSON.stringify(userHistory)}`);
      }
    }
  
    for (const testCase of ["bad"]) {
      if (!assistantHistory.some(({ content }) => content === testCase)) {
          fail(`Missing ${testCase} in assistant messages data=${JSON.stringify(assistantHistory)}`);
      }
    }
  
    pass();
  });
  
