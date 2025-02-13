import { test } from "worker-testbed";

import { addAgent, addCompletion, addSwarm, addTool, session } from '../../build/index.mjs'
import { getErrorMessage, randomString } from "functools-kit";
import { commitToolOutput } from "../../build/index.mjs";

const CLIENT_ID = randomString();

const debug = {
    log(...args) {
        console.log(JSON.stringify(args, null, 2));
        void 0;
    }
}

const useCompletion = () => {
    addCompletion({
        completionName: "mock-completion",
        getCompletion: async ({ agentName, messages }) => {
            debug.log();
            await sleep(25);
            return {
                agentName,
                content: "Hello world",
                role: "assistant",
            }
        },
    });
}

const useAgent = () => {
    addAgent({
        agentName: "test-agent",
        completion: "mock-completion",
        prompt: "You are a mock agent which will return Hello world",
        tools: ["test-tool"],
    });
}

const useSwarm = () => {
    addSwarm({
        swarmName: "test-swarm",
        agentList: ["test-agent"],
        defaultAgent: "test-agent",
    });
}

const useTools = () => {
    addTool({
        toolName: "test-tool",
        type: "function",
        call: async (toolId, clientId, agentName) => await commitToolOutput(toolId, "Tool execution ok", clientId, agentName),
        validate: async () => true,
        function: {
            name: "test-tool(name for model)",
            description: "Example tool",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    })
}

test("Will pass validation when all dependencies provided", async ({ pass, fail }) => {
    try {
        useSwarm();
        useCompletion();
        useAgent();
        useTools();
        session(CLIENT_ID, "test-swarm");
        pass();
    } catch (error) {
        fail(getErrorMessage(error));
    }
});

test("Will fail validation when swarm is missing", async ({ pass, fail }) => {
    try {
        // useSwarm();
        useCompletion();
        useAgent();
        useTools();
        session(CLIENT_ID, "test-swarm");
        fail("Validation failed");
    } catch (error) {
        pass();
    }
});

test("Will fail validation when completion is missing", async ({ pass, fail }) => {
    try {
        useSwarm();
        // useCompletion();
        useAgent();
        useTools();
        session(CLIENT_ID, "test-swarm");
        fail("Validation failed");
    } catch (error) {
        pass();
    }
});

test("Will fail validation when agent is missing", async ({ pass, fail }) => {
    try {
        useSwarm();
        useCompletion();
        // useAgent();
        useTools();
        session(CLIENT_ID, "test-swarm");
        fail("Validation failed");
    } catch (error) {
        pass();
    }
});

test("Will fail validation when tool is missing", async ({ pass, fail }) => {
    try {
        useSwarm();
        useCompletion();
        useAgent();
        // useTools();
        session(CLIENT_ID, "test-swarm");
        fail("Validation failed");
    } catch (error) {
        pass();
    }
});

test("Will fail validation when swarm defaultAgent not in the list", async ({ pass, fail }) => {
    try {
        addSwarm({
            swarmName: "test-swarm",
            agentList: ["test-agent"],
            defaultAgent: "another-agent",
        });
        session(CLIENT_ID, "test-swarm");
        fail("Validation failed");
    } catch (error) {
        pass();
    }
});
