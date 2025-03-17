import { test } from "worker-testbed";

import {
  addState,
  addAgent,
  addCompletion,
  State,
  addSwarm,
  session,
} from "../../build/index.mjs";

import { randomString, sleep } from "functools-kit";

test("Will keep setState order for State", async ({
  pass,
  fail,
}) => {
  const TEST_COMPLETION = addCompletion({
    completionName: "test_completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const TEST_STATE = addState({
    stateName: "test_state",
    getDefaultState: () => "foo",
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "You are a mock agent which will return Hello world",
    states: [TEST_STATE],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test_swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  })

  const CLIENT_ID = randomString();

  session(CLIENT_ID, TEST_SWARM)

  for (let i = 0; i !== 3; i++) {
    State.setState((prevState) => {
      if (prevState === "foo") {
        return "bar";
      }
      if (prevState === "bar") {
        return "baz";
      }
      if (prevState === "baz") {
        return "bad";
      }
    }, {
      clientId: CLIENT_ID,
      agentName: TEST_AGENT,
      stateName: TEST_STATE,
    })
  }

  const state = await State.getState({
    clientId: CLIENT_ID,
    agentName: TEST_AGENT,
    stateName: TEST_STATE,
  });


  if (state !== "bad") {
    fail("setState queue is broken");
  }

  pass();
});

test("Will use setState middlewares", async ({
  pass,
  fail,
}) => {
  const TEST_COMPLETION = addCompletion({
    completionName: "test_completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const dispatch = (prevState) => {
    if (prevState === "foo") {
      return "bar";
    }
    if (prevState === "bar") {
      return "baz";
    }
    if (prevState === "baz") {
      return "bad";
    }
  };

  const TEST_STATE = addState({
    stateName: "test_state",
    getDefaultState: () => "foo",
    middlewares: [
      dispatch,
      dispatch,
    ],
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "You are a mock agent which will return Hello world",
    states: [TEST_STATE],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test_swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  })

  const CLIENT_ID = randomString();

  session(CLIENT_ID, TEST_SWARM)

  State.setState(dispatch, {
    clientId: CLIENT_ID,
    agentName: TEST_AGENT,
    stateName: TEST_STATE,
  })

  const state = await State.getState({
    clientId: CLIENT_ID,
    agentName: TEST_AGENT,
    stateName: TEST_STATE,
  });


  if (state !== "bad") {
    fail(`setState middleware is broken`);
  }

  pass();
});

test("Will keep separate states for different connections", async ({
  pass,
  fail,
}) => {
  const TEST_COMPLETION = addCompletion({
    completionName: "test_completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const TEST_STATE = addState({
    stateName: "test_state",
    getDefaultState: () => "foo",
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "You are a mock agent which will return Hello world",
    states: [TEST_STATE],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test_swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  })

  const CLIENT_ID1 = randomString();
  const CLIENT_ID2 = randomString();
  
  session(CLIENT_ID1, TEST_SWARM)
  session(CLIENT_ID2, TEST_SWARM)

  State.setState(() => "bar", {
    agentName: TEST_AGENT,
    clientId: CLIENT_ID1,
    stateName: TEST_STATE,
  });

  State.setState(() => "baz", {
    agentName: TEST_AGENT,
    clientId: CLIENT_ID2,
    stateName: TEST_STATE,
  });

  const test1 = await State.getState({
    agentName: TEST_AGENT,
    clientId: CLIENT_ID1,
    stateName: TEST_STATE,
  });

  const test2 = await State.getState({
    agentName: TEST_AGENT,
    clientId: CLIENT_ID2,
    stateName: TEST_STATE,
  });

  if (test1 !== "bar") {
    fail("CLIENT1 is broken");
  }

  if (test2 !== "baz") {
    fail("CLIENT2 is broken");
  }

  pass();
});

test("Will raise an exception if state is not declared in agent", async ({
  pass,
  fail,
}) => {
  const TEST_COMPLETION = addCompletion({
    completionName: "test_completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const TEST_STATE = addState({
    stateName: "test_state",
    getDefaultState: () => "foo",
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "You are a mock agent which will return Hello world",
  });

  const CLIENT_ID = randomString();

  try {
    await State.setState(() => "foo", {
      agentName: TEST_AGENT,
      clientId: CLIENT_ID,
      stateName: TEST_STATE
    });
    fail();
  } catch {
    pass();
  }
});

test("Will keep state order even if not awaited", async ({
  pass,
  fail,
}) => {

  const TOTAL_TESTS = 1_000;

  const TEST_COMPLETION = addCompletion({
    completionName: "test_completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return {
        agentName,
        content,
        role: "assistant",
      };
    },
  });

  const TEST_STATE = addState({
    stateName: "test_state",
    getDefaultState: () => 0,
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "You are a mock agent which will return Hello world",
    states: [TEST_STATE],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test_swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  })

  const CLIENT_ID = randomString();

  session(CLIENT_ID, TEST_SWARM)

  for (let i = 0; i !== TOTAL_TESTS; i++) {
    State.setState(async (prevState) => {
      await sleep(Math.random() * 10);
      if (prevState !== i) {
        fail(`Failed for idx=${i}`);
      }
      return prevState + 1;
    }, {
      clientId: CLIENT_ID,
      agentName: TEST_AGENT,
      stateName: TEST_STATE,
    })
  }

  const state = await State.getState({
    clientId: CLIENT_ID,
    agentName: TEST_AGENT,
    stateName: TEST_STATE,
  });


  if (state !== TOTAL_TESTS) {
    fail("setState queue is broken");
  }

  pass();
});
