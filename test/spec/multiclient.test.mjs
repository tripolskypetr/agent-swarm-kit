import { test } from "worker-testbed";

import {
  addAgent,
  addAgentNavigation,
  addCompletion,
  addPolicy,
  addState,
  addStorage,
  addEmbedding,
  addSwarm,
  addTool,
  commitToolOutput,
  executeForce,
  getAgentName,
  session,
  setConfig,
  Policy,
  State,
  SharedState,
  Storage,
  SharedStorage,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

test("Will keep pairing and history isolation for parallel clients", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const contexts = new Map();
  addCompletion({
    completionName: "u1-completion",
    getCompletion: async ({ agentName, clientId, messages }) => {
      await sleep(Math.floor(Math.random() * 20));
      contexts.set(
        clientId,
        messages.filter((m) => m.role === "user").map((m) => m.content)
      );
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${clientId}:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "u1-agent", completion: "u1-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "u1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_A = `a-${randomString()}`;
  const CLIENT_B = `b-${randomString()}`;
  const sessionA = session(CLIENT_A, SWARM);
  const sessionB = session(CLIENT_B, SWARM);

  const [a1, b1] = await Promise.all([
    sessionA.complete("hello-from-a"),
    sessionB.complete("hello-from-b"),
  ]);
  const [a2, b2] = await Promise.all([
    sessionA.complete("second-a"),
    sessionB.complete("second-b"),
  ]);
  await sessionA.dispose();
  await sessionB.dispose();

  const historyA = contexts.get(CLIENT_A) ?? [];
  const historyB = contexts.get(CLIENT_B) ?? [];
  const ok =
    a1 === `echo:${CLIENT_A}:hello-from-a` &&
    b1 === `echo:${CLIENT_B}:hello-from-b` &&
    a2 === `echo:${CLIENT_A}:second-a` &&
    b2 === `echo:${CLIENT_B}:second-b` &&
    historyA.every((c) => !c.includes("-b")) &&
    historyB.every((c) => !c.includes("-a"));
  if (ok) {
    pass();
    return;
  }
  fail(`a1=${a1} b1=${b1} a2=${a2} b2=${b2} historyA=${JSON.stringify(historyA)} historyB=${JSON.stringify(historyB)}`);
});

test("Will keep navigation per-client within one swarm", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "u2-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (agentName === "u2-main" && last.content === "navigate") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "u2-nav", arguments: {} } }],
        };
      }
      return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
    },
  });
  const TARGET = addAgent({ agentName: "u2-target", completion: "u2-completion", prompt: "" });
  const NAV = addAgentNavigation({ toolName: "u2-nav", description: "", navigateTo: TARGET });
  const MAIN = addAgent({
    agentName: "u2-main",
    completion: "u2-completion",
    prompt: "",
    tools: [NAV],
    dependsOn: [TARGET],
  });
  const SWARM = addSwarm({ swarmName: "u2-swarm", agentList: [MAIN, TARGET], defaultAgent: MAIN });

  const CLIENT_A = `a-${randomString()}`;
  const CLIENT_B = `b-${randomString()}`;
  const sessionA = session(CLIENT_A, SWARM);
  const sessionB = session(CLIENT_B, SWARM);

  const [navResult, plainResult] = await Promise.all([
    sessionA.complete("navigate"),
    sessionB.complete("stay"),
  ]);
  const activeA = await getAgentName(CLIENT_A);
  const activeB = await getAgentName(CLIENT_B);
  const afterB = await sessionB.complete("still-here");
  await sessionA.dispose();
  await sessionB.dispose();

  const ok =
    navResult.startsWith("echo:u2-target:") &&
    plainResult === "echo:u2-main:stay" &&
    activeA === TARGET &&
    activeB === MAIN &&
    afterB === "echo:u2-main:still-here";
  if (ok) {
    pass();
    return;
  }
  fail(`navResult=${navResult} plainResult=${plainResult} activeA=${activeA} activeB=${activeB} afterB=${afterB}`);
});

test("Will keep ten concurrent clients with tool flows paired", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "u3-completion",
    getCompletion: async ({ agentName, clientId, messages }) => {
      await sleep(Math.floor(Math.random() * 15));
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "",
          role: "assistant",
          tool_calls: [{ function: { name: "u3_tool", arguments: { tag: clientId } } }],
        };
      }
      return { agentName, content: `done:${clientId}:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "u3_tool",
    validate: () => true,
    type: "function",
    function: {
      name: "u3_tool",
      description: "",
      parameters: { type: "object", properties: { tag: { type: "string" } }, required: [] },
    },
    call: async ({ toolId, clientId, agentName, params, isLast }) => {
      await sleep(Math.floor(Math.random() * 10));
      await commitToolOutput(toolId, `out:${params.tag}`, clientId, agentName);
      if (isLast) {
        await executeForce(`finish:${params.tag}`, clientId);
      }
    },
  });
  const AGENT = addAgent({ agentName: "u3-agent", completion: "u3-completion", prompt: "", tools: ["u3_tool"] });
  const SWARM = addSwarm({ swarmName: "u3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const clients = Array.from({ length: 10 }, (_, i) => `c${i}-${randomString()}`);
  const sessions = clients.map((clientId) => session(clientId, SWARM));
  const results = await Promise.all(sessions.map((s) => s.complete("start")));
  await Promise.all(sessions.map((s) => s.dispose()));

  const ok = results.every(
    (result, i) => result === `done:${clients[i]}:finish:${clients[i]}`
  );
  if (ok) {
    pass();
    return;
  }
  fail(`results=${JSON.stringify(results.map((r, i) => [clients[i].slice(0, 4), r.slice(0, 40)]))}`);
});

test("Will isolate client state while sharing shared state", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "u4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addState({ stateName: "u4-own", getDefaultState: () => ({ v: 0 }) });
  addState({ stateName: "u4-shared", shared: true, getDefaultState: () => ({ v: 0 }) });
  const AGENT = addAgent({
    agentName: "u4-agent",
    completion: "u4-completion",
    prompt: "",
    states: ["u4-own", "u4-shared"],
  });
  const SWARM = addSwarm({ swarmName: "u4-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_A = `a-${randomString()}`;
  const CLIENT_B = `b-${randomString()}`;
  const sessionA = session(CLIENT_A, SWARM);
  const sessionB = session(CLIENT_B, SWARM);

  await Promise.all([
    State.setState(() => ({ v: 1 }), { clientId: CLIENT_A, agentName: AGENT, stateName: "u4-own" }),
    State.setState(() => ({ v: 2 }), { clientId: CLIENT_B, agentName: AGENT, stateName: "u4-own" }),
  ]);
  await SharedState.setState(() => ({ v: 42 }), "u4-shared");

  const ownA = await State.getState({ clientId: CLIENT_A, agentName: AGENT, stateName: "u4-own" });
  const ownB = await State.getState({ clientId: CLIENT_B, agentName: AGENT, stateName: "u4-own" });
  const sharedA = await State.getState({ clientId: CLIENT_A, agentName: AGENT, stateName: "u4-shared" });
  const sharedB = await State.getState({ clientId: CLIENT_B, agentName: AGENT, stateName: "u4-shared" });
  await sessionA.dispose();
  await sessionB.dispose();

  const ok = ownA.v === 1 && ownB.v === 2 && sharedA.v === 42 && sharedB.v === 42;
  if (ok) {
    pass();
    return;
  }
  fail(`ownA=${JSON.stringify(ownA)} ownB=${JSON.stringify(ownB)} sharedA=${JSON.stringify(sharedA)} sharedB=${JSON.stringify(sharedB)}`);
});

test("Will isolate client storage while sharing shared storage", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "u5-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addEmbedding({
    embeddingName: "u5-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: "u5-own",
    embedding: "u5-embedding",
    createIndex: (item) => item.text,
  });
  addStorage({
    storageName: "u5-shared",
    embedding: "u5-embedding",
    shared: true,
    createIndex: (item) => item.text,
  });
  const AGENT = addAgent({
    agentName: "u5-agent",
    completion: "u5-completion",
    prompt: "",
    storages: ["u5-own", "u5-shared"],
  });
  const SWARM = addSwarm({ swarmName: "u5-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_A = `a-${randomString()}`;
  const CLIENT_B = `b-${randomString()}`;
  const sessionA = session(CLIENT_A, SWARM);
  const sessionB = session(CLIENT_B, SWARM);

  await Storage.upsert({ clientId: CLIENT_A, agentName: AGENT, storageName: "u5-own", item: { id: 1, text: "from-a" } });
  await SharedStorage.upsert({ id: 7, text: "common" }, "u5-shared");

  const ownA = await Storage.list({ clientId: CLIENT_A, agentName: AGENT, storageName: "u5-own" });
  const ownB = await Storage.list({ clientId: CLIENT_B, agentName: AGENT, storageName: "u5-own" });
  const sharedB = await SharedStorage.list("u5-shared");
  await sessionA.dispose();
  await sessionB.dispose();

  const ok = ownA.length === 1 && ownB.length === 0 && sharedB.length === 1 && sharedB[0].id === 7;
  if (ok) {
    pass();
    return;
  }
  fail(`ownA=${JSON.stringify(ownA)} ownB=${JSON.stringify(ownB)} sharedB=${JSON.stringify(sharedB)}`);
});

test("Will apply policy ban only to the banned client", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "u6-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  const POLICY = addPolicy({
    policyName: "u6-policy",
    persist: false,
    banMessage: "BLOCKED",
    validateInput: async () => true,
  });
  const AGENT = addAgent({ agentName: "u6-agent", completion: "u6-completion", prompt: "" });
  const SWARM = addSwarm({
    swarmName: "u6-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    policies: [POLICY],
  });

  const CLIENT_A = `a-${randomString()}`;
  const CLIENT_B = `b-${randomString()}`;
  const sessionA = session(CLIENT_A, SWARM);
  const sessionB = session(CLIENT_B, SWARM);

  await Policy.banClient({ clientId: CLIENT_A, swarmName: SWARM, policyName: POLICY });
  const [resultA, resultB] = await Promise.all([
    sessionA.complete("hi"),
    sessionB.complete("hi"),
  ]);
  await sessionA.dispose();
  await sessionB.dispose();

  const ok = resultA === "BLOCKED" && resultB === "echo:hi";
  if (ok) {
    pass();
    return;
  }
  fail(`resultA=${resultA} resultB=${resultB}`);
});

test("Will keep one client alive when another disposes mid-flight", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "u7-completion",
    getCompletion: async ({ agentName, clientId, messages }) => {
      await sleep(150);
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${clientId}:${last.content}`, role: "assistant" };
    },
  });
  const AGENT = addAgent({ agentName: "u7-agent", completion: "u7-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "u7-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_A = `a-${randomString()}`;
  const CLIENT_B = `b-${randomString()}`;
  const sessionA = session(CLIENT_A, SWARM);
  const sessionB = session(CLIENT_B, SWARM);

  const slowB = sessionB.complete("slow");
  await sleep(30);
  await sessionA.dispose();
  const resultB = await slowB;
  await sessionB.dispose();

  const ok = resultB === `echo:${CLIENT_B}:slow`;
  if (ok) {
    pass();
    return;
  }
  fail(`resultB=${resultB}`);
});

