import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  changeAgent,
  complete,
  execute,
  session,
  swarm,
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
  pass("");
});

test("Will orchestrate swarms for each connection", async ({ pass, fail, end }) => {
  const TOTAL_CHECKS = 1;

  const NAVIGATE_TOOL = addTool({
    toolName: "navigate-tool",
    call: async (clientId, agentName, { to }) => {
      await changeAgent(to, clientId);
      await execute("Navigation complete", clientId);
    },
    validate: async () => true,
    type: "function",
    function: {
      name: "navigate-tool",
      description: "The tool for navigation",
      parameters: {
        type: "object",
        properties: {
          type: "string",
          description: "The target agent for navigation",
        },
        required: ["to"],
      },
    },
  });

  const MOCK_COMPLETION = addCompletion({
    completionName: "navigate-completion",
    getCompletion: async (agentName, messages) => {
      const [{ content }] = messages.slice(-1);
      if (content === "Navigation complete") {
        return {
          agentName,
          role: "assistant",
          content: "Ok",
        }
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

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    const { complete } = session(clientId, TEST_SWARM);
    const targetAgent = i % 2 === 0 ? SALES_AGENT : REDUND_AGENT;
    await complete(targetAgent);
    clientMap.set(clientId, targetAgent);
  }
  
  for (const [clientId, agentName] of clientMap) {
    const currentAgent = await swarm.swarmPublicService.getAgentName(clientId, TEST_SWARM);
    if (agentName !== currentAgent) {
      fail(`The expected agent ${agentName} is not equal to ${currentAgent} for ${clientId}`);
    }
  }

  pass("");
});
