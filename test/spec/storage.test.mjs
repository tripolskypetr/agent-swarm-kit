import { test } from "tape";

import {
  addEmbedding,
  addStorage,
  Storage,
} from "../../build/index.mjs";

import { randomString } from "functools-kit";

test("Will keep separate storages for different connections", async ({ pass, fail }) => {

  const TEST_EMBEDDING = addEmbedding({
    embeddingName: "test_embedding",
    calculateSimilarity: () => 1.0,
    createEmbedding: () => [],
  });

  const TEST_STORAGE = addStorage({
    embedding: TEST_EMBEDDING,
    createIndex: ({ foo }) => foo,
  });

  const CLIENT_ID1 = randomString();
  const CLIENT_ID2 = randomString();

  Storage.upsert({ id: "test", foo: "bar" }, CLIENT_ID1, TEST_STORAGE);
  Storage.upsert({ id: "test", foo: "baz" }, CLIENT_ID2, TEST_STORAGE);

  const [{ foo: test1 }] = await Storage.list(CLIENT_ID1, TEST_STORAGE);
  const [{ foo: test2 }] = await Storage.list(CLIENT_ID2, TEST_STORAGE);

  if (test1 !== "bar") {
    fail("CLIENT1 is broken")
  }

  if (test2 !== "baz") {
    fail("CLIENT2 is broken")
  }

  pass();
});
