import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  complete,
  setConfig,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

const CLIENT_ID = randomString();

const debug = {
  log(...args) {
    void 0;
  },
};

test("Will resque model on unexisting tool call", async ({ pass, fail }) => {

    setConfig({
        CC_RESQUE_STRATEGY: "flush",
        CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"]
    })

    const MOCK_COMPLETION = addCompletion({
        completionName: "mock-completion",
        getCompletion: async ({ agentName, messages }) => {
            const [{ content }] = messages.slice(-1);
            if (content === "test") {
                return {
                    agentName,
                    content: "",
                    role: "assistant",
                    tool_calls: [
                        {
                            function: {
                                name: "not_existing_tool",
                                arguments: {},
                            }
                        }
                    ]
                }
            }
            return {
                agentName,
                content,
                role: "assistant",
            }
        },
    });

    const TEST_AGENT = addAgent({
        agentName: "test-agent",
        completion: MOCK_COMPLETION,
        prompt: "",
    });

    const TEST_SWARM = addSwarm({
        swarmName: "test-swarm",
        agentList: [TEST_AGENT],
        defaultAgent: TEST_AGENT,
    });

    const result = await complete("test", CLIENT_ID, TEST_SWARM);

    if (result === "Resque") {
        pass();
        return
    }

    fail();

});

test("Will resque model on empty output", async ({ pass, fail }) => {

    setConfig({
        CC_RESQUE_STRATEGY: "flush",
        CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"]
    })

    const MOCK_COMPLETION = addCompletion({
        completionName: "mock-completion",
        getCompletion: async ({ agentName, messages }) => {
            const [{ content }] = messages.slice(-1);
            if (content === "test") {
                return {
                    agentName,
                    content: "",
                    role: "assistant",
                }
            }
            return {
                agentName,
                content,
                role: "assistant",
            }
        },
    });

    const TEST_AGENT = addAgent({
        agentName: "test-agent",
        completion: MOCK_COMPLETION,
        prompt: "",
    });

    const TEST_SWARM = addSwarm({
        swarmName: "test-swarm",
        agentList: [TEST_AGENT],
        defaultAgent: TEST_AGENT,
    });

    const result = await complete("test", CLIENT_ID, TEST_SWARM);

    if (result === "Resque") {
        pass();
        return
    }

    fail();

});

test("Will resque model on failed tool validation", async ({ pass, fail }) => {

    setConfig({
        CC_RESQUE_STRATEGY: "flush",
        CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"]
    })

    const MOCK_COMPLETION = addCompletion({
        completionName: "mock-completion",
        getCompletion: async ({ agentName, messages }) => {
            const [{ content }] = messages.slice(-1);
            if (content === "test") {
                return {
                    agentName,
                    content: "",
                    role: "assistant",
                    tool_calls: [
                        {
                            function: "test_tool",
                            arguments: {},
                        }
                    ]
                }
            }
            return {
                agentName,
                content,
                role: "assistant",
            }
        },
    });

    const TEST_TOOL = addTool({
        toolName: 'test-tool',
        call: () => { fail("Tool should not be called") },
        validate: async () => false,
        type: 'function',
        function: {
            name: "test_tool",
            description: "",
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            }
        },
    })

    const TEST_AGENT = addAgent({
        agentName: "test-agent",
        completion: MOCK_COMPLETION,
        tools: [TEST_TOOL],
        prompt: "",
    });

    const TEST_SWARM = addSwarm({
        swarmName: "test-swarm",
        agentList: [TEST_AGENT],
        defaultAgent: TEST_AGENT,
    });

    const result = await complete("test", CLIENT_ID, TEST_SWARM);

    if (result === "Resque") {
        pass();
        return
    }

    fail();

});

test("Failed resque raise a placeholder", async ({ pass, fail }) => {
    
  const MOCK_COMPLETION = addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName }) => {
      return {
        agentName,
        content: "",
        role: "assistant",
      };
    },
  });

  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: MOCK_COMPLETION,
    prompt: "",
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test-swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  setConfig({
    CC_EMPTY_OUTPUT_PLACEHOLDERS: ["Resque"],
  });

  const output = await complete("test", CLIENT_ID, TEST_SWARM);
  if (output === "Resque") {
    pass();
    return;
  }

  fail("exception not thrown");
});
