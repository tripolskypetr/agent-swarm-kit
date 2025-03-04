import { test } from "worker-testbed";

import {
  addEmbedding,
  addStorage,
  addAgent,
  addCompletion,
  Storage,
} from "../../build/index.mjs";

import { randomString } from "functools-kit";

test("Will keep separate storages for different connections", async ({
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

  const TEST_EMBEDDING = addEmbedding({
    embeddingName: "test_embedding",
    calculateSimilarity: () => 1.0,
    createEmbedding: () => [],
  });

  const TEST_STORAGE = addStorage({
    storageName: "test_storage",
    embedding: TEST_EMBEDDING,
    createIndex: ({ foo }) => foo,
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "You are a mock agent which will return Hello world",
    storages: [TEST_STORAGE],
  });

  const CLIENT_ID1 = randomString();
  const CLIENT_ID2 = randomString();

  Storage.upsert({
    agentName: TEST_AGENT,
    clientId: CLIENT_ID1,
    item: { id: "test", foo: "bar" },
    storageName: TEST_STORAGE,
  });
  Storage.upsert({
    agentName: TEST_AGENT,
    clientId: CLIENT_ID2,
    item: { id: "test", foo: "baz" },
    storageName: TEST_STORAGE
  });

  const [{ foo: test1 }] = await Storage.list({
    agentName: TEST_AGENT,
    clientId: CLIENT_ID1,
    storageName: TEST_STORAGE
  });
  const [{ foo: test2 }] = await Storage.list({
    agentName: TEST_AGENT,
    clientId: CLIENT_ID2,
    storageName: TEST_STORAGE
  });

  if (test1 !== "bar") {
    fail("CLIENT1 is broken");
  }

  if (test2 !== "baz") {
    fail("CLIENT2 is broken");
  }

  pass();
});


test("Will raise an exception if storage is not declared in agent", async ({
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

  const TEST_EMBEDDING = addEmbedding({
    embeddingName: "test_embedding",
    calculateSimilarity: () => 1.0,
    createEmbedding: () => [],
  });

  const TEST_STORAGE = addStorage({
    storageName: "test_storage",
    embedding: TEST_EMBEDDING,
    createIndex: ({ foo }) => foo,
  });

  const TEST_AGENT = addAgent({
    agentName: "test_agent",
    completion: TEST_COMPLETION,
    prompt: "You are a mock agent which will return Hello world",
  });

  const CLIENT_ID = randomString();

  try {
    await Storage.upsert({
      agentName: TEST_AGENT,
      clientId: CLIENT_ID,
      item: { id: "test", foo: "bar" },
      storageName: TEST_STORAGE
    });
    fail();
  } catch {
    pass();
  }
});
