import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  cancelOutput,
  commitToolOutput,
  emit,
  executeForce,
  listenAgentEvent,
  session,
  setConfig,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (p, ms = 8000) => Promise.race([p, sleep(ms).then(() => HANG)]);

const trackUnhandled = () => {
  const unhandled = [];
  process.on("unhandledRejection", (reason) => {
    unhandled.push(String(reason?.message ?? reason));
  });
  return unhandled;
};

const addEcho = (name) => addCompletion({
  completionName: name,
  getCompletion: async ({ agentName, messages }) => {
    const [last] = messages.slice(-1);
    return { agentName, content: `echo:${last.content}`, role: "assistant" };
  },
});

test("Will reject without hang when transform hook throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const C = addEcho("h1-completion");
  const AGENT = addAgent({
    agentName: "h1-agent", completion: C, prompt: "",
    transform: (text) => { throw new Error("transform exploded"); },
  });
  const SWARM = addSwarm({ swarmName: "h1-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cs = session(randomString(), SWARM);
  let out;
  try { out = await raceHang(cs.complete("hi")); } catch (e) { out = `THREW:${e.message.slice(0,30)}`; }
  await raceHang(cs.dispose());
  await sleep(100);
  const ok =
    (String(out).startsWith("THREW:transform exploded")) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`out=${String(out)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will reject without hang when map hook throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const C = addEcho("h2-completion");
  const AGENT = addAgent({
    agentName: "h2-agent", completion: C, prompt: "",
    map: () => { throw new Error("map exploded"); },
  });
  const SWARM = addSwarm({ swarmName: "h2-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cs = session(randomString(), SWARM);
  let out;
  try { out = await raceHang(cs.complete("hi")); } catch (e) { out = `THREW:${e.message.slice(0,30)}`; }
  await raceHang(cs.dispose());
  await sleep(100);
  const ok =
    (String(out).startsWith("THREW:map exploded")) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`out=${String(out)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will reject without hang when mapToolCalls hook throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addCompletion({
    completionName: "h3-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return { agentName, content: "", role: "assistant",
          tool_calls: [{ function: { name: "h3_tool", arguments: {} } }] };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "h3_tool", validate: () => true, type: "function",
    function: { name: "h3_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "out", clientId, agentName);
      await executeForce("finish", clientId);
    },
  });
  const AGENT = addAgent({
    agentName: "h3-agent", completion: "h3-completion", prompt: "", tools: ["h3_tool"],
    mapToolCalls: () => { throw new Error("mapToolCalls exploded"); },
  });
  const SWARM = addSwarm({ swarmName: "h3-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cs = session(randomString(), SWARM);
  let out;
  try { out = await raceHang(cs.complete("start"), 6000); } catch (e) { out = `THREW:${e.message.slice(0,30)}`; }
  await raceHang(cs.dispose());
  await sleep(100);
  const ok =
    (String(out).startsWith("THREW:mapToolCalls exploded")) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`out=${String(out)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will keep flow when completion onComplete throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addCompletion({
    completionName: "h4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
    callbacks: { onComplete: () => { throw new Error("onComplete exploded"); } },
  });
  const AGENT = addAgent({ agentName: "h4-agent", completion: "h4-completion", prompt: "" });
  const SWARM = addSwarm({ swarmName: "h4-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cs = session(randomString(), SWARM);
  let out;
  try { out = await raceHang(cs.complete("hi")); } catch (e) { out = `THREW:${e.message.slice(0,30)}`; }
  await raceHang(cs.dispose());
  await sleep(100);
  const ok =
    (out === "echo:hi") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`out=${String(out)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will keep flow when agent schema callbacks throw", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const C = addEcho("h5-completion");
  const AGENT = addAgent({
    agentName: "h5-agent", completion: C, prompt: "",
    callbacks: {
      onInit: () => { throw new Error("onInit exploded"); },
      onExecute: () => { throw new Error("onExecute exploded"); },
      onOutput: () => { throw new Error("onOutput exploded"); },
      onDispose: () => { throw new Error("onDispose exploded"); },
    },
  });
  const SWARM = addSwarm({ swarmName: "h5-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cs = session(randomString(), SWARM);
  let out;
  try { out = await raceHang(cs.complete("hi")); } catch (e) { out = `THREW:${e.message.slice(0,30)}`; }
  await raceHang(cs.dispose());
  await sleep(100);
  const ok =
    (out === "echo:hi") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`out=${String(out)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will keep flow when bus event listener throws", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const C = addEcho("h6-completion");
  const AGENT = addAgent({ agentName: "h6-agent", completion: C, prompt: "" });
  const SWARM = addSwarm({ swarmName: "h6-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cid = randomString();
  const cs = session(cid, SWARM);
  const un = listenAgentEvent(cid, () => { throw new Error("listener exploded"); });
  let out;
  try { out = await raceHang(cs.complete("hi")); } catch (e) { out = `THREW:${e.message.slice(0,30)}`; }
  un();
  await raceHang(cs.dispose());
  await sleep(100);
  const ok =
    (out === "echo:hi") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`out=${String(out)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will not poison next exchange after emit during tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addCompletion({
    completionName: "h7-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "with-tool") {
        return { agentName, content: "", role: "assistant",
          tool_calls: [{ function: { name: "h7_tool", arguments: {} } }] };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "h7_tool", validate: () => true, type: "function",
    function: { name: "h7_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "out", clientId, agentName);
      await sleep(300);
      await executeForce("late-finish", clientId);
    },
  });
  const AGENT = addAgent({ agentName: "h7-agent", completion: "h7-completion", prompt: "", tools: ["h7_tool"] });
  const SWARM = addSwarm({ swarmName: "h7-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cid = randomString();
  const cs = session(cid, SWARM);
  const first = cs.complete("with-tool");
  await sleep(100);
  await emit("hijacked", cid, AGENT);
  const r1 = await raceHang(first);
  await sleep(500); // let the late executeForce finish before next message
  const r2 = await raceHang(cs.complete("next-question"), 6000);
  await cs.dispose();
  await sleep(100);
  const ok =
    (r1 === "hijacked" && r2 === "echo:next-question") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`r1=${String(r1)} r2=${String(r2)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

test("Will not poison next exchange after cancelOutput during tool", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addCompletion({
    completionName: "h8-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "with-tool") {
        return { agentName, content: "", role: "assistant",
          tool_calls: [{ function: { name: "h8_tool", arguments: {} } }] };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "h8_tool", validate: () => true, type: "function",
    function: { name: "h8_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName }) => {
      await commitToolOutput(toolId, "out", clientId, agentName);
      await sleep(300);
      await executeForce("late-finish", clientId);
    },
  });
  const AGENT = addAgent({ agentName: "h8-agent", completion: "h8-completion", prompt: "", tools: ["h8_tool"] });
  const SWARM = addSwarm({ swarmName: "h8-swarm", agentList: [AGENT], defaultAgent: AGENT });
  const cid = randomString();
  const cs = session(cid, SWARM);
  const first = cs.complete("with-tool");
  await sleep(100);
  await cancelOutput(cid, AGENT);
  const r1 = await raceHang(first);
  await sleep(500);
  const r2 = await raceHang(cs.complete("next-question"), 6000);
  await cs.dispose();
  await sleep(100);
  const ok =
    (r1 === "" && r2 === "echo:next-question") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`r1=${String(r1)} r2=${String(r2)}` + ` unhandled=${JSON.stringify(unhandled)}`);
});

