import { test } from "worker-testbed";

import {
  addAgent,
  addAgentNavigation,
  addCompletion,
  addSwarm,
  changeToAgent,
  changeToDefaultAgent,
  changeToPrevAgent,
  getAgentName,
  session,
  setConfig,
  PersistSwarm,
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
    return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
  },
});

const mkSwarm = (suffix) => {
  const C = addEcho(`${suffix}-completion`);
  const A = addAgent({ agentName: `${suffix}-a`, completion: C, prompt: "", dependsOn: [`${suffix}-b`, `${suffix}-c`] });
  const B = addAgent({ agentName: `${suffix}-b`, completion: C, prompt: "", dependsOn: [`${suffix}-a`, `${suffix}-c`] });
  const CC = addAgent({ agentName: `${suffix}-c`, completion: C, prompt: "", dependsOn: [`${suffix}-a`, `${suffix}-b`] });
  const S = addSwarm({ swarmName: `${suffix}-swarm`, agentList: [A, B, CC], defaultAgent: A });
  return { A, B, C: CC, S };
};

test("Will walk navigation stack back through prev agent calls", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const { A, B, C, S } = mkSwarm("n1");
  const cid = randomString();
  const cs = session(cid, S);
  await changeToAgent(B, cid);
  await changeToAgent(C, cid);
  const onC = await getAgentName(cid);
  await changeToPrevAgent(cid);
  const afterPop1 = await getAgentName(cid);
  await changeToPrevAgent(cid);
  const afterPop2 = await getAgentName(cid);
  await changeToPrevAgent(cid);
  const afterPop3 = await getAgentName(cid);
  await cs.dispose();
  await sleep(100);
  const ok = (onC === "n1-c" && afterPop1 === "n1-b" && afterPop2 === "n1-a" && afterPop3 === "n1-a") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`unexpected state; unhandled=${JSON.stringify(unhandled)}`);
});

test("Will allow legit re-navigation across separate messages", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const suffix = "n2";
  addCompletion({
    completionName: "n2-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "go" && agentName === "n2-a") {
        return { agentName, content: "", role: "assistant",
          tool_calls: [{ function: { name: "n2-nav-b", arguments: {} } }] };
      }
      if (last.content === "back" && agentName === "n2-b") {
        return { agentName, content: "", role: "assistant",
          tool_calls: [{ function: { name: "n2-nav-a", arguments: {} } }] };
      }
      return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
    },
  });
  const NB = addAgentNavigation({ toolName: "n2-nav-b", description: "", navigateTo: "n2-b" });
  const NA = addAgentNavigation({ toolName: "n2-nav-a", description: "", navigateTo: "n2-a" });
  const A = addAgent({ agentName: "n2-a", completion: "n2-completion", prompt: "", tools: [NB], dependsOn: ["n2-b"] });
  const B = addAgent({ agentName: "n2-b", completion: "n2-completion", prompt: "", tools: [NA], dependsOn: ["n2-a"] });
  const S = addSwarm({ swarmName: "n2-swarm", agentList: [A, B], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  const r1 = await raceHang(cs.complete("go"));      // A -> B
  const r2 = await raceHang(cs.complete("back"));    // B -> A (new message, must be allowed)
  const r3 = await raceHang(cs.complete("go"));      // A -> B again
  const active = await getAgentName(cid);
  await cs.dispose();
  await sleep(100);
  const ok = (r1 === "echo:n2-b:go" && r2 === "echo:n2-a:back" && r3 === "echo:n2-b:go" && active === "n2-b") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`unexpected state; unhandled=${JSON.stringify(unhandled)}`);
});

test("Will serialize parallel changeToAgent calls", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const { A, B, C, S } = mkSwarm("n3");
  const cid = randomString();
  const cs = session(cid, S);
  const [ok1, ok2] = await Promise.all([
    raceHang(changeToAgent(B, cid)),
    raceHang(changeToAgent(C, cid)),
  ]);
  const active = await getAgentName(cid);
  const after = await raceHang(cs.complete("ping"));
  await cs.dispose();
  await sleep(100);
  const ok = (ok1 === true && ok2 === true && (active === "n3-b" || active === "n3-c") && String(after).startsWith("echo:n3-")) && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`unexpected state; unhandled=${JSON.stringify(unhandled)}`);
});

test("Will resolve pending output when agent changes mid-flight", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  addCompletion({
    completionName: "n4-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "slow") {
        await sleep(300);
      }
      return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
    },
  });
  const A = addAgent({ agentName: "n4-a", completion: "n4-completion", prompt: "", dependsOn: ["n4-b"] });
  const B = addAgent({ agentName: "n4-b", completion: "n4-completion", prompt: "", dependsOn: ["n4-a"] });
  const S = addSwarm({ swarmName: "n4-swarm", agentList: [A, B], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  const pending = cs.complete("slow");
  await sleep(50);
  await changeToAgent(B, cid);
  const r1 = await raceHang(pending);
  const r2 = await raceHang(cs.complete("next"));
  await cs.dispose();
  await sleep(100);
  const ok = (r1 === "" && r2 === "echo:n4-b:next") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`unexpected state; unhandled=${JSON.stringify(unhandled)}`);
});

test("Will navigate to default and then back through stack", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const { A, B, C, S } = mkSwarm("n5");
  const cid = randomString();
  const cs = session(cid, S);
  await changeToAgent(B, cid);
  await changeToAgent(C, cid);
  await changeToDefaultAgent(cid);
  const onDefault = await getAgentName(cid);
  await changeToPrevAgent(cid);
  const afterPrev = await getAgentName(cid);
  await cs.dispose();
  await sleep(100);
  const ok = (onDefault === "n5-a" && afterPrev === "n5-c") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`unexpected state; unhandled=${JSON.stringify(unhandled)}`);
});

test("Will navigate without dependsOn declaration", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const C = addEcho("n6-completion");
  const A = addAgent({ agentName: "n6-a", completion: C, prompt: "" }); // no dependsOn
  const B = addAgent({ agentName: "n6-b", completion: C, prompt: "" });
  const S = addSwarm({ swarmName: "n6-swarm", agentList: [A, B], defaultAgent: A });
  const cid = randomString();
  const cs = session(cid, S);
  const changed = await raceHang(changeToAgent(B, cid));
  const active = await getAgentName(cid);
  await cs.dispose();
  await sleep(100);
  const ok = (changed === true && active === "n6-b") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`unexpected state; unhandled=${JSON.stringify(unhandled)}`);
});

test("Will restore navigation stack from persist adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const unhandled = trackUnhandled();

  const stores = new Map();
  class MemPersist {
    constructor(entityName, baseDir) {
      this.key = `${baseDir}:${entityName}`;
      if (!stores.has(this.key)) stores.set(this.key, new Map());
      this.map = stores.get(this.key);
    }
    async waitForInit() {}
    async hasValue(id) { return this.map.has(id); }
    async readValue(id) { return this.map.get(id); }
    async writeValue(id, value) { this.map.set(id, value); }
  }
  PersistSwarm.usePersistActiveAgentAdapter(MemPersist);
  PersistSwarm.usePersistNavigationStackAdapter(MemPersist);

  const C = addEcho("n7-completion");
  const A = addAgent({ agentName: "n7-a", completion: C, prompt: "", dependsOn: ["n7-b", "n7-c"] });
  const B = addAgent({ agentName: "n7-b", completion: C, prompt: "", dependsOn: ["n7-a", "n7-c"] });
  const CC = addAgent({ agentName: "n7-c", completion: C, prompt: "", dependsOn: ["n7-a", "n7-b"] });
  const S = addSwarm({ swarmName: "n7-swarm", agentList: [A, B, CC], defaultAgent: A, persist: true });

  const cid = randomString();
  const s1 = session(cid, S);
  await changeToAgent(B, cid);
  await changeToAgent(CC, cid);
  await s1.dispose();

  const s2 = session(cid, S);
  const restored = await getAgentName(cid);
  await changeToPrevAgent(cid);
  const afterPrev = await getAgentName(cid);
  await s2.dispose();
  await sleep(100);
  const ok = (restored === "n7-c" && afterPrev === "n7-b") && unhandled.length === 0;

  if (ok) {
    pass();
    return;
  }
  fail(`unexpected state; unhandled=${JSON.stringify(unhandled)}`);
});

