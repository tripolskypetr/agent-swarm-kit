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

test("Will observe an in-flight write from an unrelated concurrent getState", async ({
  pass,
  fail,
}) => {
  const TEST_COMPLETION = addCompletion({
    completionName: "test_completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return { agentName, content, role: "assistant" };
    },
  });

  const TEST_STATE = addState({
    stateName: "test_state",
    getDefaultState: () => "foo",
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "x",
    states: [TEST_STATE],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test_swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const CLIENT_ID = randomString();
  session(CLIENT_ID, TEST_SWARM);
  const ref = { clientId: CLIENT_ID, agentName: TEST_AGENT, stateName: TEST_STATE };

  await State.setState(() => "foo", ref);

  // A slow write, not awaited: it holds the dispatch queue for 200ms.
  const writePromise = State.setState(async () => {
    await sleep(200);
    return "WRITTEN";
  }, ref);

  // Let the write enter the dispatch, then issue an UNRELATED getState.
  // It must queue behind the write and observe "WRITTEN", not the stale "foo".
  await sleep(20);
  const readDuringWrite = await State.getState(ref);
  await writePromise;

  if (readDuringWrite !== "WRITTEN") {
    fail(`concurrent getState bypassed the dispatch queue: got ${readDuringWrite}`);
  }

  pass();
});

test("Will serve a reentrant getState from inside a setState without deadlock", async ({
  pass,
  fail,
}) => {
  const TEST_COMPLETION = addCompletion({
    completionName: "test_completion",
    getCompletion: async ({ agentName, messages }) => {
      const [{ content }] = messages.slice(-1);
      return { agentName, content, role: "assistant" };
    },
  });

  const TEST_STATE = addState({
    stateName: "test_state",
    getDefaultState: () => "init",
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "x",
    states: [TEST_STATE],
  });

  const TEST_SWARM = addSwarm({
    swarmName: "test_swarm",
    agentList: [TEST_AGENT],
    defaultAgent: TEST_AGENT,
  });

  const CLIENT_ID = randomString();
  session(CLIENT_ID, TEST_SWARM);
  const ref = { clientId: CLIENT_ID, agentName: TEST_AGENT, stateName: TEST_STATE };

  let reentrantValue = "NOT_RUN";
  const writePromise = State.setState(async () => {
    // getState called from INSIDE the dispatchFn must not deadlock behind
    // this very write; it reads the current value directly.
    reentrantValue = await State.getState(ref);
    return "after-reentrant";
  }, ref);

  const settled = await Promise.race([
    writePromise.then(() => "SETTLED"),
    sleep(2_000).then(() => "DEADLOCK"),
  ]);

  if (settled !== "SETTLED") {
    fail("reentrant getState deadlocked behind its enclosing setState");
  }
  if (reentrantValue !== "init") {
    fail(`reentrant getState returned the wrong value: ${reentrantValue}`);
  }

  pass();
});
