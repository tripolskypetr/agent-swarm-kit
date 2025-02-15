import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  changeAgent,
  complete,
  disposeConnection,
  execute,
  makeConnection,
  session,
  swarm,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

const debug = {
  log(...args) {
    void 0;
  },
};

test("Will dispose connections for session function", async ({
  pass,
  fail,
}) => {
  const TOTAL_CHECKS = 100;

  const NAVIGATE_TOOL = addTool({
    toolName: "navigate-tool",
    call: async ({ toolId, clientId, agentName, params: { to }}) => {
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

  const clientIds = [];

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    session(clientId, TEST_SWARM);
    clientIds.push(clientId);
  }

  for (const clientId of clientIds) {
    await disposeConnection(clientId, TEST_SWARM);
  }

  if (swarm.sessionValidationService.getSessionList().length) {
    fail();
  }

  for (const clientId of clientIds) {
    if (swarm.sessionValidationService.getSessionAgentList(clientId).length) {
        fail();
    }
  }

  for (const clientId of clientIds) {
    if (swarm.sessionValidationService.getSessionHistoryList(clientId).length) {
        fail();
    }
  }

  pass();
});


test("Will dispose connections for makeConnection function", async ({
  pass,
  fail,
}) => {
  const TOTAL_CHECKS = 100;

  const NAVIGATE_TOOL = addTool({
    toolName: "navigate-tool",
    call: async ({ toolId, clientId, agentName, params: { to }}) => {
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

  const clientIds = [];

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    makeConnection(() => {}, clientId, TEST_SWARM);
    clientIds.push(clientId);
  }

  for (const clientId of clientIds) {
    await disposeConnection(clientId, TEST_SWARM);
  }

  if (swarm.sessionValidationService.getSessionList().length) {
    fail();
  }

  for (const clientId of clientIds) {
    if (swarm.sessionValidationService.getSessionAgentList(clientId).length) {
        fail();
    }
  }

  for (const clientId of clientIds) {
    if (swarm.sessionValidationService.getSessionHistoryList(clientId).length) {
        fail();
    }
  }

  pass();
});

test("Will dispose connections for complete function", async ({
  pass,
  fail,
}) => {
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

  const clientIds = [];

  for (let i = 0; i !== TOTAL_CHECKS; i++) {
    const clientId = randomString();
    complete(SALES_AGENT, clientId, TEST_SWARM);
    clientIds.push(clientId);
  }

  if (swarm.sessionValidationService.getSessionList().length) {
    fail();
  }

  for (const clientId of clientIds) {
    if (swarm.sessionValidationService.getSessionAgentList(clientId).length) {
        fail();
    }
  }

  for (const clientId of clientIds) {
    if (swarm.sessionValidationService.getSessionHistoryList(clientId).length) {
        fail();
    }
  }

  pass();
});
