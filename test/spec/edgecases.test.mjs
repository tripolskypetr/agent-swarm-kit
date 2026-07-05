import { test } from "worker-testbed";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  addAgent,
  addCompletion,
  addState,
  addSwarm,
  addTool,
  commitToolOutput,
  executeForce,
  session,
  setConfig,
  State,
} from "../../build/index.mjs";
import { randomString, sleep } from "functools-kit";

const HANG = Symbol("hang");
const raceHang = (p, ms = 8000) => Promise.race([p, sleep(ms).then(() => HANG)]);

test("Will run no tools when maxToolCalls is zero", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  const executed = [];

  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      if (last.content === "start") {
        return {
          agentName,
          content: "no-tools-answer",
          role: "assistant",
          tool_calls: [
            { function: { name: "e_tool", arguments: { t: "a" } } },
            { function: { name: "e_tool", arguments: { t: "b" } } },
            { function: { name: "e_tool", arguments: { t: "c" } } },
          ],
        };
      }
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addTool({
    toolName: "e_tool",
    validate: () => true,
    type: "function",
    function: { name: "e_tool", description: "", parameters: { type: "object", properties: {}, required: [] } },
    call: async ({ toolId, clientId, agentName, params, isLast }) => {
      executed.push(params.t);
      await commitToolOutput(toolId, "x", clientId, agentName);
      if (isLast) await executeForce("finish", clientId);
    },
  });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    tools: ["e_tool"],
    maxToolCalls: 0,
  });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const chatSession = session(randomString(), TEST_SWARM);
  const result = await raceHang(chatSession.complete("start"));
  await raceHang(chatSession.dispose());

  if (executed.length === 0 && result === "no-tools-answer") {
    pass();
    return;
  }
  fail(`executed=${JSON.stringify(executed)} result=${String(result)}`);
});

test("Will keep zero prior messages when keepMessages is zero", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });
  let windowSnapshot = null;

  let turn = 0;
  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      turn += 1;
      if (turn === 3) {
        windowSnapshot = messages.filter((m) => m.role !== "system").map((m) => m.content);
      }
      const [last] = messages.slice(-1) ?? [{ content: "none" }];
      return { agentName, content: `echo:${last?.content ?? "none"}`, role: "assistant" };
    },
  });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    keepMessages: 0,
  });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const chatSession = session(randomString(), TEST_SWARM);
  await raceHang(chatSession.complete("turn1"));
  await raceHang(chatSession.complete("turn2"));
  await raceHang(chatSession.complete("turn3"));
  await raceHang(chatSession.dispose());

  // keepMessages=0 is a zero-width window: the model sees no common (user/
  // assistant) messages at all, not even the current turn's own message.
  if (Array.isArray(windowSnapshot) && windowSnapshot.length === 0) {
    pass();
    return;
  }
  fail(`window=${JSON.stringify(windowSnapshot)}`);
});

test("Will serve reentrant getState inside setState without deadlock", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  addCompletion({
    completionName: "mock-completion",
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });
  addState({ stateName: "test-state", getDefaultState: () => ({ v: 10 }) });
  const TEST_AGENT = addAgent({
    agentName: "test-agent",
    completion: "mock-completion",
    prompt: "",
    states: ["test-state"],
  });
  const TEST_SWARM = addSwarm({ swarmName: "test-swarm", agentList: [TEST_AGENT], defaultAgent: TEST_AGENT });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, TEST_SWARM);
  const context = { clientId: CLIENT_ID, agentName: TEST_AGENT, stateName: "test-state" };

  const nested = await raceHang(
    State.setState(async (prev) => {
      const inner = await State.getState(context);
      return { v: prev.v + inner.v };
    }, context)
  );

  // Fire-and-forget writes must still be observed in order by a following read.
  State.setState(() => ({ v: 100 }), context);
  State.setState((p) => ({ v: p.v + 1 }), context);
  State.setState((p) => ({ v: p.v + 1 }), context);
  const ordered = await raceHang(State.getState(context));
  await raceHang(chatSession.dispose());

  if (nested !== HANG && nested.v === 20 && ordered !== HANG && ordered.v === 102) {
    pass();
    return;
  }
  fail(`nested=${JSON.stringify(nested)} ordered=${JSON.stringify(ordered)}`);
});

test("Will contain persistence writes inside dump dir for traversal client ids", async ({ pass, fail }) => {
  const buildPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "build",
    "index.mjs"
  );
  const workDir = mkdtempSync(join(tmpdir(), "swarm-traversal-"));
  const escapeTarget = join(workDir, "ESCAPED.json");
  const scriptPath = join(workDir, "scenario.mjs");
  const script = `
import { addAgent, addCompletion, addState, addSwarm, session, setConfig, State } from ${JSON.stringify(buildPath)};
setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: true });
addState({ stateName: "st", getDefaultState: () => ({ v: 0 }), persist: true });
addCompletion({ completionName: "c", getCompletion: async ({ agentName, messages }) => {
  const [l] = messages.slice(-1); return { agentName, content: "echo:" + l.content, role: "assistant" }; }});
const A = addAgent({ agentName: "a", completion: "c", prompt: "", states: ["st"] });
const S = addSwarm({ swarmName: "s", agentList: [A], defaultAgent: A, persist: true });
const evil = "../../ESCAPED";
const cs = session(evil, S);
await State.setState(() => ({ v: 99 }), { clientId: evil, agentName: A, stateName: "st" });
await cs.dispose();
console.log("DONE");
process.exit(0);
`;
  writeFileSync(scriptPath, script);
  try {
    const out = execFileSync(process.execPath, [scriptPath], {
      cwd: workDir,
      encoding: "utf-8",
      timeout: 30_000,
    });
    const escaped = existsSync(escapeTarget);
    if (out.includes("DONE") && !escaped) {
      pass();
      return;
    }
    fail(`escaped=${escaped} out=${out}`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});
