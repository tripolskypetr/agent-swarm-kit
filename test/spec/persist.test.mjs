import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addEmbedding,
  addPolicy,
  addStorage,
  addSwarm,
  changeToAgent,
  getAgentName,
  markOffline,
  markOnline,
  session,
  setConfig,
  Policy,
  Schema,
  Storage,
  PersistSwarm,
  PersistStorage,
  PersistPolicy,
  PersistMemory,
  PersistAlive,
  PersistEmbedding,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

const memStores = new Map();
class MemPersist {
  constructor(entityName, baseDir) {
    this.key = `${baseDir}:${entityName}`;
    if (!memStores.has(this.key)) {
      memStores.set(this.key, new Map());
    }
    this.map = memStores.get(this.key);
  }
  async waitForInit() {}
  async hasValue(id) {
    return this.map.has(id);
  }
  async readValue(id) {
    return this.map.get(id);
  }
  async writeValue(id, value) {
    this.map.set(id, value);
  }
}

const addEcho = (name) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${agentName}:${last.content}`, role: "assistant" };
    },
  });

test("Will restore active agent through custom PersistSwarm adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  PersistSwarm.usePersistActiveAgentAdapter(MemPersist);
  PersistSwarm.usePersistNavigationStackAdapter(MemPersist);

  const COMPLETION = addEcho("p1-completion");
  const A = addAgent({ agentName: "p1-a", completion: COMPLETION, prompt: "" });
  const B = addAgent({ agentName: "p1-b", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "p1-swarm",
    agentList: [A, B],
    defaultAgent: A,
    persist: true,
  });

  const CLIENT_ID = randomString();
  const first = session(CLIENT_ID, SWARM);
  await changeToAgent(B, CLIENT_ID);
  await first.dispose();

  const second = session(CLIENT_ID, SWARM);
  const restored = await getAgentName(CLIENT_ID);
  await second.dispose();

  const stackStore = memStores.get("./dump/agent/swarm/navigation_stack/:p1-swarm");
  const ok =
    restored === B && stackStore?.get(CLIENT_ID)?.agentStack?.length >= 1;

  if (ok) {
    pass();
    return;
  }
  fail(`restored=${restored} stack=${JSON.stringify(stackStore?.get(CLIENT_ID))}`);
});

test("Will restore storage items through custom PersistStorage adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  PersistStorage.usePersistStorageAdapter(MemPersist);

  const COMPLETION = addEcho("p2-completion");
  addEmbedding({
    embeddingName: "p2-embedding",
    createEmbedding: async (text) => [text.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: "p2-storage",
    embedding: "p2-embedding",
    createIndex: (item) => item.text,
    persist: true,
  });
  const AGENT = addAgent({
    agentName: "p2-agent",
    completion: COMPLETION,
    prompt: "",
    storages: ["p2-storage"],
  });
  const SWARM = addSwarm({ swarmName: "p2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const base = { clientId: CLIENT_ID, agentName: AGENT, storageName: "p2-storage" };

  const first = session(CLIENT_ID, SWARM);
  await Storage.upsert({ ...base, item: { id: 1, text: "aa" } });
  await first.dispose();

  const second = session(CLIENT_ID, SWARM);
  const items = await Storage.list(base);
  await second.dispose();

  const ok =
    items.length === 1 && items[0].id === 1;

  if (ok) {
    pass();
    return;
  }
  fail(`items=${JSON.stringify(items)}`);
});

test("Will store policy bans through custom PersistPolicy adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  PersistPolicy.usePersistPolicyAdapter(MemPersist);

  const COMPLETION = addEcho("p3-completion");
  const POLICY = addPolicy({
    policyName: "p3-policy",
    persist: true,
    banMessage: "BLOCKED",
    validateInput: async () => true,
  });
  const AGENT = addAgent({ agentName: "p3-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "p3-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    policies: [POLICY],
  });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const target = { clientId: CLIENT_ID, swarmName: SWARM, policyName: POLICY };
  await Policy.banClient(target);
  const banned = await Policy.hasBan(target);
  await chatSession.dispose();

  const policyStore = memStores.get("./dump/agent/policy/:p3-swarm");
  const storedBans = policyStore?.get(POLICY)?.bannedClients ?? [];
  const ok =
    banned === true && storedBans.includes(CLIENT_ID);

  if (ok) {
    pass();
    return;
  }
  fail(`banned=${banned} stored=${JSON.stringify([...(policyStore ?? new Map())])}`);
});

test("Will store session memory through custom PersistMemory adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  PersistMemory.usePersistMemoryAdapter(MemPersist);
  PersistSwarm.usePersistActiveAgentAdapter(MemPersist);
  PersistSwarm.usePersistNavigationStackAdapter(MemPersist);
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: true });

  const COMPLETION = addEcho("p4-completion");
  const AGENT = addAgent({ agentName: "p4-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "p4-swarm", agentList: [AGENT], defaultAgent: AGENT, persist: false });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  await Schema.writeSessionMemory(CLIENT_ID, { note: "kept" });
  const value = await Schema.readSessionMemory(CLIENT_ID);
  await chatSession.dispose();

  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const memStore = memStores.get(`./dump/agent/memory/:${CLIENT_ID}`);
  const ok =
    value?.note === "kept" && memStore?.get(CLIENT_ID)?.data?.note === "kept";

  if (ok) {
    pass();
    return;
  }
  fail(`value=${JSON.stringify(value)} store=${JSON.stringify(memStore && [...memStore])}`);
});

test("Will track online state through custom PersistAlive adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  PersistAlive.usePersistAliveAdapter(MemPersist);
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: true });

  const COMPLETION = addEcho("p5-completion");
  const AGENT = addAgent({ agentName: "p5-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({
    swarmName: "p5-swarm",
    agentList: [AGENT],
    defaultAgent: AGENT,
    persist: false,
  });

  const CLIENT_ID = randomString();
  await markOnline(CLIENT_ID, SWARM);
  const aliveStore = memStores.get(`./dump/agent/alive/:${SWARM}`);
  const onlineAfterMark = aliveStore?.get(CLIENT_ID)?.online;
  await markOffline(CLIENT_ID, SWARM);
  const onlineAfterOffline = aliveStore?.get(CLIENT_ID)?.online;

  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const ok =
    onlineAfterMark === true && onlineAfterOffline === false;

  if (ok) {
    pass();
    return;
  }
  fail(`mark=${onlineAfterMark} offline=${onlineAfterOffline} stores=${JSON.stringify([...memStores.keys()])}`);
});

test("Will cache embeddings through custom PersistEmbedding adapter", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  PersistEmbedding.usePersistEmbeddingAdapter(MemPersist);

  const created = [];
  const COMPLETION = addEcho("p6-completion");
  addEmbedding({
    embeddingName: "p6-embedding",
    persist: true,
    createEmbedding: async (text) => {
      created.push(text);
      return [text.length];
    },
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: "p6-storage",
    embedding: "p6-embedding",
    createIndex: (item) => item.text,
    persist: true,
  });
  const AGENT = addAgent({
    agentName: "p6-agent",
    completion: COMPLETION,
    prompt: "",
    storages: ["p6-storage"],
  });
  const SWARM = addSwarm({ swarmName: "p6-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const base = { clientId: CLIENT_ID, agentName: AGENT, storageName: "p6-storage" };
  const chatSession = session(CLIENT_ID, SWARM);
  await Storage.upsert({ ...base, item: { id: 1, text: "aa" } });
  await Storage.take({ ...base, search: "aa", total: 5, score: 0.5 });
  const createdAfterFirst = created.length;
  await Storage.take({ ...base, search: "aa", total: 5, score: 0.5 });
  await chatSession.dispose();

  const embedStore = [...memStores.entries()].find(([key]) => key.includes("p6-embedding"))?.[1];
  const ok =
    createdAfterFirst >= 1 && created.length === createdAfterFirst && embedStore && embedStore.size >= 1;

  if (ok) {
    pass();
    return;
  }
  fail(`created=${JSON.stringify(created)} stores=${JSON.stringify([...memStores.keys()])}`);
});

