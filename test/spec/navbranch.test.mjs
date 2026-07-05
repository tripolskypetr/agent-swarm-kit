import { test } from "worker-testbed";

import {
  addAgent,
  addAgentNavigation,
  addCompletion,
  addSwarm,
  addTool,
  changeToAgent,
  commitToolOutput,
  executeForce,
  getAgentName,
  getNavigationRoute,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (p, ms = 8000) => Promise.race([p, sleep(ms).then(() => HANG)]);

// Builds a fresh mesh of four agents, each carrying navigation tools to every
// other. Routing is driven by an if-branching mock keyed on (agentName, text).
// `p` prefixes all names so each worker test stays independent.
const buildMesh = (p) => {
  const names = [`${p}-hub`, `${p}-alpha`, `${p}-beta`, `${p}-gamma`];
  const routeTable = {
    [`${p}-hub`]: {
      "to-alpha": `${p}-nav-alpha`,
      "to-beta": `${p}-nav-beta`,
      "to-gamma": `${p}-nav-gamma`,
    },
    [`${p}-alpha`]: { "hop-beta": `${p}-nav-beta` },
    [`${p}-beta`]: { "hop-gamma": `${p}-nav-gamma` },
    [`${p}-gamma`]: { "back-hub": `${p}-nav-hub` },
  };

  const completion = addCompletion({
    completionName: `${p}-completion`,
    getCompletion: async ({ agentName, messages }) => {
      const text = (messages[messages.length - 1] ?? { content: "" }).content;
      const table = routeTable[agentName] ?? {};
      if (table[text]) {
        return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: table[text], arguments: {} } }] };
      }
      return { agentName, content: `${agentName}:${text}`, role: "assistant" };
    },
  });

  const navTools = {
    [`${p}-nav-hub`]: `${p}-hub`,
    [`${p}-nav-alpha`]: `${p}-alpha`,
    [`${p}-nav-beta`]: `${p}-beta`,
    [`${p}-nav-gamma`]: `${p}-gamma`,
  };
  for (const [toolName, target] of Object.entries(navTools)) {
    addAgentNavigation({ toolName, description: `go ${target}`, navigateTo: target });
  }
  const allNavTools = Object.keys(navTools);
  for (const name of names) {
    addAgent({
      agentName: name,
      completion,
      prompt: `You are ${name}`,
      tools: allNavTools,
      dependsOn: names.filter((n) => n !== name),
    });
  }
  const swarm = addSwarm({ swarmName: `${p}-swarm`, agentList: names, defaultAgent: `${p}-hub` });
  return { swarm, names };
};

test("Will branch to different agents from one hub by input", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { swarm } = buildMesh("b1");

  const cases = [
    ["to-alpha", "b1-alpha"],
    ["to-beta", "b1-beta"],
    ["to-gamma", "b1-gamma"],
  ];
  const results = [];
  for (const [input, expected] of cases) {
    const CLIENT_ID = randomString();
    const cs = session(CLIENT_ID, swarm);
    const answer = await raceHang(cs.complete(input));
    const active = await getAgentName(CLIENT_ID);
    await cs.dispose();
    results.push(active === expected && answer === `${expected}:${input}`);
  }

  if (results.every(Boolean)) {
    pass();
    return;
  }
  fail(`results=${JSON.stringify(results)}`);
});

test("Will follow chained hops across messages around the mesh", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { swarm } = buildMesh("b2");

  const CLIENT_ID = randomString();
  const cs = session(CLIENT_ID, swarm);
  await raceHang(cs.complete("to-alpha"));
  const a1 = await getAgentName(CLIENT_ID);
  await raceHang(cs.complete("hop-beta"));
  const a2 = await getAgentName(CLIENT_ID);
  await raceHang(cs.complete("hop-gamma"));
  const a3 = await getAgentName(CLIENT_ID);
  await raceHang(cs.complete("back-hub"));
  const a4 = await getAgentName(CLIENT_ID);
  await cs.dispose();

  if (a1 === "b2-alpha" && a2 === "b2-beta" && a3 === "b2-gamma" && a4 === "b2-hub") {
    pass();
    return;
  }
  fail(`a1=${a1} a2=${a2} a3=${a3} a4=${a4}`);
});

test("Will take different branches on re-entry to the hub", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { swarm } = buildMesh("b3");

  const CLIENT_ID = randomString();
  const cs = session(CLIENT_ID, swarm);
  await raceHang(cs.complete("to-alpha"));
  const first = await getAgentName(CLIENT_ID);
  await changeToAgent("b3-hub", CLIENT_ID);
  await raceHang(cs.complete("to-gamma"));
  const second = await getAgentName(CLIENT_ID);
  await changeToAgent("b3-hub", CLIENT_ID);
  await raceHang(cs.complete("to-beta"));
  const third = await getAgentName(CLIENT_ID);
  await cs.dispose();

  if (first === "b3-alpha" && second === "b3-gamma" && third === "b3-beta") {
    pass();
    return;
  }
  fail(`first=${first} second=${second} third=${third}`);
});

test("Will cascade nested navigations within one turn", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "b4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const t = (messages[messages.length - 1] ?? { content: "" }).content;
      if (agentName === "b4-hub" && t === "cascade") {
        return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "b4-nav-a", arguments: {} } }] };
      }
      if (agentName === "b4-a" && t === "cascade") {
        return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "b4-nav-b", arguments: {} } }] };
      }
      if (agentName === "b4-b" && t === "cascade") {
        return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "b4-nav-c", arguments: {} } }] };
      }
      return { agentName, content: `${agentName}:${t}`, role: "assistant" };
    },
  });
  addAgentNavigation({ toolName: "b4-nav-a", description: "", navigateTo: "b4-a" });
  addAgentNavigation({ toolName: "b4-nav-b", description: "", navigateTo: "b4-b" });
  addAgentNavigation({ toolName: "b4-nav-c", description: "", navigateTo: "b4-c" });
  const names = ["b4-hub", "b4-a", "b4-b", "b4-c"];
  for (const name of names) {
    addAgent({
      agentName: name,
      completion: "b4-completion",
      prompt: "",
      tools: ["b4-nav-a", "b4-nav-b", "b4-nav-c"],
      dependsOn: names.filter((n) => n !== name),
    });
  }
  const swarm = addSwarm({ swarmName: "b4-swarm", agentList: names, defaultAgent: "b4-hub" });

  const CLIENT_ID = randomString();
  const cs = session(CLIENT_ID, swarm);
  const answer = await raceHang(cs.complete("cascade"));
  const active = await getAgentName(CLIENT_ID);
  const route = [...getNavigationRoute(CLIENT_ID, swarm)];
  await cs.dispose();

  const ok =
    active === "b4-c" &&
    answer === "b4-c:cascade" &&
    route.includes("b4-a") &&
    route.includes("b4-b") &&
    route.includes("b4-c");

  if (ok) {
    pass();
    return;
  }
  fail(`active=${active} answer=${String(answer)} route=${JSON.stringify(route)}`);
});

test("Will route variadically from a tool decision", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addTool({
    toolName: "b5-smart-route",
    validate: () => true,
    type: "function",
    function: {
      name: "b5-smart-route",
      description: "Route based on priority",
      parameters: { type: "object", properties: { priority: { type: "string" } }, required: [] },
    },
    call: async ({ toolId, clientId, agentName, params }) => {
      const target = params.priority === "high" ? "b5-gamma" : "b5-alpha";
      await commitToolOutput(toolId, `routing to ${target}`, clientId, agentName);
      await changeToAgent(target, clientId);
      await executeForce("arrived", clientId);
    },
  });
  addCompletion({
    completionName: "b5-completion",
    getCompletion: async ({ agentName, messages }) => {
      const last = messages[messages.length - 1] ?? { content: "" };
      if (agentName === "b5-router" && last.content.startsWith("route:")) {
        const priority = last.content.slice("route:".length);
        return { agentName, content: "", role: "assistant", tool_calls: [{ function: { name: "b5-smart-route", arguments: { priority } } }] };
      }
      return { agentName, content: `${agentName}:${last.content}`, role: "assistant" };
    },
  });
  const ROUTER = addAgent({
    agentName: "b5-router",
    completion: "b5-completion",
    prompt: "",
    tools: ["b5-smart-route"],
    dependsOn: ["b5-alpha", "b5-gamma"],
  });
  const A = addAgent({ agentName: "b5-alpha", completion: "b5-completion", prompt: "" });
  const G = addAgent({ agentName: "b5-gamma", completion: "b5-completion", prompt: "" });
  const swarm = addSwarm({ swarmName: "b5-swarm", agentList: [ROUTER, A, G], defaultAgent: ROUTER });

  const highClient = randomString();
  const csHigh = session(highClient, swarm);
  await raceHang(csHigh.complete("route:high"));
  const highTarget = await getAgentName(highClient);
  await csHigh.dispose();

  const lowClient = randomString();
  const csLow = session(lowClient, swarm);
  await raceHang(csLow.complete("route:low"));
  const lowTarget = await getAgentName(lowClient);
  await csLow.dispose();

  if (highTarget === "b5-gamma" && lowTarget === "b5-alpha") {
    pass();
    return;
  }
  fail(`highTarget=${highTarget} lowTarget=${lowTarget}`);
});

test("Will fan out concurrent clients to distinct leaves", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const { swarm } = buildMesh("b6");

  const inputs = ["to-alpha", "to-beta", "to-gamma"];
  const expected = ["b6-alpha", "b6-beta", "b6-gamma"];
  const clients = inputs.map(() => randomString());
  const sessions = clients.map((c) => session(c, swarm));
  const answers = await Promise.all(sessions.map((s, i) => raceHang(s.complete(inputs[i]))));
  const actives = await Promise.all(clients.map((c) => getAgentName(c)));
  await Promise.all(sessions.map((s) => s.dispose()));

  const ok =
    actives.every((a, i) => a === expected[i]) &&
    answers.every((ans, i) => ans === `${expected[i]}:${inputs[i]}`);

  if (ok) {
    pass();
    return;
  }
  fail(`actives=${JSON.stringify(actives)} answers=${JSON.stringify(answers.map(String))}`);
});
