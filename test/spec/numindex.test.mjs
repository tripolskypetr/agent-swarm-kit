import { test } from "worker-testbed";

import {
  addAgent,
  addCompletion,
  addEmbedding,
  addStorage,
  addSwarm,
  fork,
  hasSession,
  session,
  setConfig,
  Storage,
} from "../../build/index.mjs";
import { randomString } from "functools-kit";

const addEcho = (name) =>
  addCompletion({
    completionName: name,
    getCompletion: async ({ agentName, messages }) => {
      const [last] = messages.slice(-1);
      return { agentName, content: `echo:${last.content}`, role: "assistant" };
    },
  });

const makeStorageSwarm = (suffix) => {
  const COMPLETION = addEcho(`${suffix}-completion`);
  addEmbedding({
    embeddingName: `${suffix}-embedding`,
    createEmbedding: async (t) => [t.length],
    calculateSimilarity: async (a, b) => (a[0] === b[0] ? 1 : 0),
  });
  addStorage({
    storageName: `${suffix}-storage`,
    embedding: `${suffix}-embedding`,
    createIndex: (i) => i.text,
  });
  const AGENT = addAgent({
    agentName: `${suffix}-agent`,
    completion: COMPLETION,
    prompt: "",
    storages: [`${suffix}-storage`],
  });
  return addSwarm({
    swarmName: `${suffix}-swarm`,
    agentList: [AGENT],
    defaultAgent: AGENT,
  });
};

test("Will skip surviving ids in numeric index after remove", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const SWARM = makeStorageSwarm("n1");
  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: "n1-agent", storageName: "n1-storage" };

  await Storage.upsert({ ...base, item: { id: 1, text: "one" } });
  await Storage.upsert({ ...base, item: { id: 2, text: "two" } });
  await Storage.upsert({ ...base, item: { id: 3, text: "three" } });
  await Storage.remove({ ...base, itemId: 1 });
  const nextIndex = await Storage.createNumericIndex(base);
  await Storage.upsert({ ...base, item: { id: nextIndex, text: "new-item" } });
  const items = await Storage.list(base);
  await chatSession.dispose();

  const ids = items.map((i) => i.id).sort();
  const three = items.find((i) => i.id === 3);
  const ok =
    nextIndex === 4 && items.length === 3 && three?.text === "three" && ids.join(",") === "2,3,4";

  if (ok) {
    pass();
    return;
  }
  fail(`nextIndex=${nextIndex} items=${JSON.stringify(items.map((i) => [i.id, i.text]))}`);
});

test("Will ignore non-numeric ids in numeric index", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const SWARM = makeStorageSwarm("n2");
  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: "n2-agent", storageName: "n2-storage" };

  await Storage.upsert({ ...base, item: { id: "uuid-like", text: "alpha" } });
  await Storage.upsert({ ...base, item: { id: 5, text: "beta" } });
  const nextIndex = await Storage.createNumericIndex(base);
  await chatSession.dispose();

  const ok =
    nextIndex === 6;

  if (ok) {
    pass();
    return;
  }
  fail(`nextIndex=${nextIndex}`);
});

test("Will start numeric index from one on empty storage", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const SWARM = makeStorageSwarm("n3");
  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  const base = { clientId: CLIENT_ID, agentName: "n3-agent", storageName: "n3-storage" };
  const nextIndex = await Storage.createNumericIndex(base);
  await chatSession.dispose();

  const ok =
    nextIndex === 1;

  if (ok) {
    pass();
    return;
  }
  fail(`nextIndex=${nextIndex}`);
});

test("Will route fork error to onError and clean up session", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("f1-completion");
  const AGENT = addAgent({ agentName: "f1-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "f1-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  let capturedError = "";
  const result = await fork(
    async () => {
      throw new Error("fork boom");
    },
    {
      clientId: CLIENT_ID,
      swarmName: SWARM,
      onError: (error) => {
        capturedError = error.message;
      },
    }
  );

  const ok =
    result === null && capturedError === "fork boom" && hasSession(CLIENT_ID) === false;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)} error=${capturedError} hasSession=${hasSession(CLIENT_ID)}`);
});

test("Will return fork value and clean up session", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("f2-completion");
  const AGENT = addAgent({ agentName: "f2-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "f2-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const result = await fork(
    async (clientId, agentName) => `ran:${clientId === CLIENT_ID}:${agentName}`,
    { clientId: CLIENT_ID, swarmName: SWARM }
  );

  const ok =
    result === `ran:true:f2-agent` && hasSession(CLIENT_ID) === false;

  if (ok) {
    pass();
    return;
  }
  fail(`result=${JSON.stringify(result)} hasSession=${hasSession(CLIENT_ID)}`);
});

test("Will reject fork with live duplicate clientId", async ({ pass, fail }) => {
  setConfig({ CC_PERSIST_ENABLED_BY_DEFAULT: false });

  const COMPLETION = addEcho("f3-completion");
  const AGENT = addAgent({ agentName: "f3-agent", completion: COMPLETION, prompt: "" });
  const SWARM = addSwarm({ swarmName: "f3-swarm", agentList: [AGENT], defaultAgent: AGENT });

  const CLIENT_ID = randomString();
  const chatSession = session(CLIENT_ID, SWARM);
  let duplicateError = "";
  try {
    await fork(async () => "never", { clientId: CLIENT_ID, swarmName: SWARM });
  } catch (error) {
    duplicateError = error.message;
  }
  await chatSession.dispose();

  const ok =
    duplicateError.includes("already exists");

  if (ok) {
    pass();
    return;
  }
  fail(`error=${duplicateError}`);
});

