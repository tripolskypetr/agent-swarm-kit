import { test } from "worker-testbed";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BUILD_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "build",
  "index.mjs"
);

const SCRIPT = `
import {
  addAgent, addCompletion, addEmbedding, addState, addStorage, addSwarm,
  changeToAgent, getAgentName, session, setConfig, State, Storage,
} from ${JSON.stringify(BUILD_PATH)};

const PHASE = process.argv[2];
setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: true });

const seenContexts = {};
const mkCompletion = (name) => addCompletion({
  completionName: name,
  getCompletion: async ({ agentName, clientId, messages }) => {
    seenContexts[name + ":" + clientId] = messages.map((m) => m.role + ":" + m.content);
    const [last] = messages.slice(-1);
    return { agentName, content: "echo:" + last.content, role: "assistant" };
  },
});

const CA = mkCompletion("comp-a");
const CB = mkCompletion("comp-b");

addEmbedding({ embeddingName: "emb", createEmbedding: async (t) => [t.length],
  calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0) });
addStorage({ storageName: "orders", embedding: "emb", createIndex: (i) => i.text, persist: true });
addState({ stateName: "conv-state", getDefaultState: () => ({ v: "default" }), persist: true });

const A1 = addAgent({ agentName: "a1", completion: CA, prompt: "", storages: ["orders"], states: ["conv-state"] });
const A2 = addAgent({ agentName: "a2", completion: CA, prompt: "" });
const B1 = addAgent({ agentName: "b1", completion: CB, prompt: "", storages: ["orders"], states: ["conv-state"] });
const B2 = addAgent({ agentName: "b2", completion: CB, prompt: "" });

const SWARM_A = addSwarm({ swarmName: "swarm-a", agentList: [A1, A2], defaultAgent: A1, persist: true });
const SWARM_B = addSwarm({ swarmName: "swarm-b", agentList: [B1, B2], defaultAgent: B1, persist: true });

const C1 = "client-one";
const C2 = "client-two";

if (PHASE === "write") {
  const s1 = session(C1, SWARM_A);
  await s1.complete("secret-alpha");
  await Storage.upsert({ clientId: C1, agentName: A1, storageName: "orders", item: { id: 1, text: "from-swarm-a" } });
  await State.setState(() => ({ v: "written-in-a" }), { clientId: C1, agentName: A1, stateName: "conv-state" });
  await changeToAgent(A2, C1);

  const s2 = session(C2, SWARM_B);
  await s2.complete("beta-question");
  await changeToAgent(B2, C2);

  console.log("WRITE_OK");
  process.exit(0); // simulated crash: no dispose
}

if (PHASE === "read") {
  const s1 = session(C1, SWARM_A);
  const activeC1 = await getAgentName(C1);
  await s1.dispose();

  const s2 = session(C2, SWARM_B);
  const activeC2 = await getAgentName(C2);
  await s2.dispose();

  const s1b = session(C1, SWARM_B);
  const activeC1b = await getAgentName(C1);
  await s1b.complete("hello-from-b");
  const ctx = seenContexts["comp-b:client-one"] ?? [];
  const historyShared = ctx.some((m) => m.includes("secret-alpha"));
  const storageInB = await Storage.list({ clientId: C1, agentName: B1, storageName: "orders" });
  const stateInB = await State.getState({ clientId: C1, agentName: B1, stateName: "conv-state" });
  await s1b.dispose();

  const s2b = session(C2, SWARM_B);
  const c2Storage = await Storage.list({ clientId: C2, agentName: B1, storageName: "orders" });
  await s2b.dispose();

  console.log(JSON.stringify({
    activeC1, activeC2, activeC1b, historyShared,
    storageInB, stateInB, c2Storage,
  }));
  process.exit(0);
}
process.exit(1);
`;

const runCrashScenario = () => {
  const workDir = mkdtempSync(join(tmpdir(), "swarm-crash-"));
  const scriptPath = join(workDir, "scenario.mjs");
  writeFileSync(scriptPath, SCRIPT);
  try {
    const writeOut = execFileSync(process.execPath, [scriptPath, "write"], {
      cwd: workDir,
      encoding: "utf-8",
      timeout: 30_000,
    });
    if (!writeOut.includes("WRITE_OK")) {
      throw new Error(`write phase failed: ${writeOut}`);
    }
    const readOut = execFileSync(process.execPath, [scriptPath, "read"], {
      cwd: workDir,
      encoding: "utf-8",
      timeout: 30_000,
    });
    const jsonLine = readOut
      .split("\n")
      .find((line) => line.startsWith("{"));
    return JSON.parse(jsonLine);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
};

test("Will recover per-swarm per-client scopes after hard crash", async ({ pass, fail }) => {
  const result = runCrashScenario();

  const ok =
    result.activeC1 === "a2" && // client-one restored inside swarm-a
    result.activeC2 === "b2" && // client-two restored inside swarm-b
    result.activeC1b === "b1" && // same client in ANOTHER swarm starts from default
    Array.isArray(result.c2Storage) &&
    result.c2Storage.length === 0; // client-two never sees client-one data

  if (ok) {
    pass();
    return;
  }
  fail(JSON.stringify(result));
});

test("Will share client-scoped history, storage and state across swarms by contract", async ({ pass, fail }) => {
  const result = runCrashScenario();

  // Contract pin: history/storage/state buckets are keyed by clientId (+schema
  // name) WITHOUT swarm separation — reusing one clientId across swarms shares
  // the dialog history, storage items and state between them, identical to the
  // in-memory behavior. Different clientIds stay fully isolated.
  const ok =
    result.historyShared === true &&
    result.storageInB.length === 1 &&
    result.storageInB[0].text === "from-swarm-a" &&
    result.stateInB.v === "written-in-a";

  if (ok) {
    pass();
    return;
  }
  fail(JSON.stringify(result));
});
