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
  session,
  swarm,
  commitToolOutput,
} from "../../build/index.mjs";
import { createAwaiter, randomString, sleep, Subject } from "functools-kit";

const CLIENT_ID = randomString();

const NAVIGATE_TO_SALES_REQUEST = "Navigate to the sales agent";
const NAVIGATE_TO_REFUND_REQUEST = "Navigate to the refund agent";

const STUCK_ATTEMPT_REQUEST = "Navigate to deadlock condition";

const NAVIGATE_TO_SALES_TOOL = "navigate_to_sales";
const NAVIGATE_TO_REFUND_TOOL = "navigate_to_refund";

const STUCK_ATTEMPT_TOOL = "stuck_attempt";

const REFUND_AGENT = "refund_agent";
const SALES_AGENT = "sales_agent";

const debug = {
  log(...args) {
    void 0;
  },
};

const beforeAll = () => {
  const TRIAGE_AGENT = addAgent({
    agentName: "triage_agent",
    completion: "mock-completion",
    prompt:
      "You are a triage agent which need to navigate user to sales agent or refund agent",
    tools: [NAVIGATE_TO_SALES_TOOL, NAVIGATE_TO_REFUND_TOOL, STUCK_ATTEMPT_TOOL],
  });

  addAgent({
    agentName: SALES_AGENT,
    completion: "mock-completion",
    prompt: "Tell your name to the user",
  });

  addAgent({
    agentName: REFUND_AGENT,
    completion: "mock-completion",
    prompt: "Tell your name to the user",
  });

  addTool({
    toolName: STUCK_ATTEMPT_TOOL,
    call: async (clientId) => {
      await changeAgent(TRIAGE_AGENT, clientId);
      await execute(NAVIGATE_TO_SALES_REQUEST, clientId, TRIAGE_AGENT);
    },
    validate: async () => true,
    function: {
      name: STUCK_ATTEMPT_TOOL,
      description: "If tool does not commitToolOutput, cancel the await after navigation",
      parameters: {
        type: "function",
        properties: {},
        required: [],
      },
    },
  });

  addTool({
    toolName: NAVIGATE_TO_SALES_TOOL,
    call: async (clientId) => {
      await changeAgent(SALES_AGENT, clientId);
      await execute("Say hello to the user", clientId, SALES_AGENT);
    },
    validate: async () => true,
    function: {
      name: NAVIGATE_TO_SALES_TOOL,
      description: "If user asking for sales agent, do the navigation",
      parameters: {
        type: "function",
        properties: {},
        required: [],
      },
    },
  });

  addTool({
    toolName: NAVIGATE_TO_REFUND_TOOL,
    call: async (clientId) => {
      await changeAgent(REFUND_AGENT, clientId);
      await execute("Say hello to the user", clientId, REFUND_AGENT);
    },
    validate: async () => true,
    function: {
      name: NAVIGATE_TO_REFUND_TOOL,
      description: "If user asking for refund agent, do the navigation",
      parameters: {
        type: "function",
        properties: {},
        required: [],
      },
    },
  });

  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [lastMessage] = messages.slice(-1);
      if (
        agentName === TRIAGE_AGENT &&
        lastMessage.content === STUCK_ATTEMPT_REQUEST
      ) {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            {
              function: {
                name: STUCK_ATTEMPT_TOOL,
                arguments: {},
              },
            },
          ],
        };
      }
      if (
        agentName === TRIAGE_AGENT &&
        lastMessage.content === NAVIGATE_TO_SALES_REQUEST
      ) {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            {
              function: {
                name: NAVIGATE_TO_SALES_TOOL,
                arguments: {},
              },
            },
          ],
        };
      }
      if (
        agentName === TRIAGE_AGENT &&
        lastMessage.content === NAVIGATE_TO_REFUND_REQUEST
      ) {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            {
              function: {
                name: NAVIGATE_TO_REFUND_TOOL,
                arguments: {},
              },
            },
          ],
        };
      }
      return {
        agentName,
        content: agentName,
        role: "assistant",
      };
    },
  });

  addSwarm({
    swarmName: "test-swarm",
    agentList: [TRIAGE_AGENT, SALES_AGENT, REFUND_AGENT],
    defaultAgent: TRIAGE_AGENT,
  });
};

test("Will navigate to sales agent on request", async ({ pass, fail }) => {
  beforeAll();
  const result = await complete(
    NAVIGATE_TO_SALES_REQUEST,
    CLIENT_ID,
    "test-swarm"
  );
  if (result === SALES_AGENT) {
    pass();
    return;
  }
  fail(result);
});

test("Will navigate to refund agent on request", async ({ pass, fail }) => {
  beforeAll();
  const result = await complete(
    NAVIGATE_TO_REFUND_REQUEST,
    CLIENT_ID,
    "test-swarm"
  );
  if (result === REFUND_AGENT) {
    pass();
    return;
  }
  fail(result);
});

test("Will avoid deadlock if commitToolOutput was not executed before navigation", async ({ pass, fail }) => {
  beforeAll();
  let result = await complete(
    STUCK_ATTEMPT_REQUEST,
    CLIENT_ID,
    "test-swarm"
  );
  if (result !== SALES_AGENT) {
    fail('Tool was not being executed');
    return;
  }
  result = await Promise.race([
    complete(
      STUCK_ATTEMPT_REQUEST,
      CLIENT_ID,
      "test-swarm"
    ),
    sleep(5_000).then(() => Symbol.for('race-condition'))
  ]);
  if (result === Symbol.for('race-condition')) {
    fail('Agent stuck in race condition');
    return;
  }
  pass("Ok")
});


test("Will avoid deadlock when commitToolOutput is executed in parallel with next completion", async ({ pass, fail }) => {

  const nextMessageSubject = new Subject();

  const STUCK_TOOL = addTool({
    toolName: 'stuck-attempt-tool',
    call: async (clientId, agentName) => {
      nextMessageSubject.next("baz");
      await commitToolOutput("The unblocking execution tool output", clientId, agentName);
      await execute("bar", clientId, agentName);
    },
    validate: async () => true,
    type: 'function',
    function: {
      name: 'stuck-attempt-tool',
      description: "Will not stuck on commitToolOutput",
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  })

  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({
      agentName,
      messages
    }) => {
      const [{ content }] = messages.slice(-1);
      if (content === STUCK_TOOL) {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [
            {
              function: {
                name: STUCK_TOOL,
                arguments: {},
              },
            }
          ]
        }
      }
      return {
        agentName,
        content,
        role: 'assistant',
      }
    },
  });

  const TEST_AGENT = addAgent({
    agentName: 'test-agent',
    completion: MOCK_COMPLETION,
    prompt: "I am an ai agent with third party tools integration",
    tools: [STUCK_TOOL]
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const { complete } = session(CLIENT_ID, TEST_SWARM);

  const [awaiter, { resolve }] = createAwaiter();

  nextMessageSubject.subscribe(async (msg) => {
    await complete(msg);
    resolve();
  });

  await complete("foo");
  await complete(STUCK_TOOL);
  await awaiter;

  const history = await getRawHistory(CLIENT_ID);
  const assistantMessages = history.filter(({ role }) => role === "assistant");

  for (const message of ["foo", "bar", "baz"]) {
    if (!assistantMessages.some(({ content }) => content === message)) {
      fail(`missed message ${message}`);
    }
  }

  pass();

});
