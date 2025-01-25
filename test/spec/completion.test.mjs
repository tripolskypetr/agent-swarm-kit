import { test } from "worker-testbed";

import { addAgent, addCompletion, addSwarm, changeAgent, complete, session, swarm } from '../../build/index.mjs'
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

test("Will use different completion on multiple agents", async ({ pass, fail }) => {

    const FOO_COMPLETION = addCompletion({
        completionName: "foo-completion",
        getCompletion: async ({ agentName, messages }) => {
            return {
                agentName,
                content: "foo",
                role: "assistant",
            }
        },
    });

    const BAR_COMPLETION = addCompletion({
        completionName: "bar-completion",
        getCompletion: async ({ agentName, messages }) => {
            return {
                agentName,
                content: "bar",
                role: "assistant",
            }
        },
    });

    const FOO_AGENT = addAgent({
        agentName: "foo-agent",
        completion: FOO_COMPLETION,
        prompt: "",
    });

    const BAR_AGENT = addAgent({
        agentName: "bar-agent",
        completion: BAR_COMPLETION,
        prompt: "",
    });

    const TEST_SWARM = addSwarm({
        swarmName: "test-swarm",
        agentList: [FOO_AGENT, BAR_AGENT],
        defaultAgent: FOO_AGENT,
    });

    const { complete } = session(CLIENT_ID, TEST_SWARM);

    {
        const result = await complete("test");
        if (result !== "foo") {
            fail();
            return;
        }
    }


    await changeAgent(BAR_AGENT, CLIENT_ID);

    {
        const result = await complete("test");
        if (result !== "bar") {
            fail();
            return;
        }
    }

    pass();
});

