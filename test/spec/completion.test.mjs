import { test } from "worker-testbed";

import { addAgent, addCompletion, addSwarm, complete } from '../../build/index.mjs'
import { randomString } from "functools-kit";

const CLIENT_ID = randomString();

const debug = {
    log(...args) {
        void 0;
    }
}

test("Will run model completion", async ({ pass, fail }) => {

    addCompletion({
        completionName: "mock-completion",
        getCompletion: async ({ agentName, messages }) => {
            debug.log(JSON.stringify(messages, null, 2));
            // await sleep(1_000);
            return {
                agentName,
                content: "Hello world",
                role: "assistant",
            }
        },
    });

    addAgent({
        agentName: "test-agent",
        completion: "mock-completion",
        prompt: "You are a mock agent which will return Hello world",
    });

    addSwarm({
        swarmName: "test-swarm",
        agentList: ["test-agent"],
        defaultAgent: "test-agent",
    });

    const result = await complete("Tell me something", CLIENT_ID, "test-swarm");

    if (result === "Hello world") {
        pass();
        return
    }

    fail();

});
