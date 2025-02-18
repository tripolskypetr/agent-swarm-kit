import { randomString, join } from "functools-kit";
import {
  addCompletion,
  addSwarm,
  setConfig,
  addAgent,
  Storage,
  addEmbedding,
  addStorage,
  session,
  swarm,
} from "agent-swarm-kit";
import { Ollama } from "ollama";
import { readFileSync } from "fs";
import { setBackend } from "@tensorflow/tfjs-core";
import { log } from 'pinolog';
import { tidy, mul, norm, sum, tensor1d, div } from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";

const ollama = new Ollama();

setBackend("wasm");

swarm.loggerService.setLogger({
  log: log,
  debug: log,
});

const TOTAL_TESTS = 100;

const TOOL_CALL_PROTOCOL = `For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{"name": <function-name>, "arguments": <args-json-object>}
</tool_call>
`;

setConfig({
  CC_AGENT_SYSTEM_PROMPT: [TOOL_CALL_PROTOCOL],
  CC_STORAGE_SEARCH_POOL: 10,
});

const NEMOTRON_COMPLETION = addCompletion({
  completionName: "nemotron_completion",
  getCompletion: async ({ agentName, messages, mode, tools }) => {
    const commonMessages = messages
      .filter(({ tool_calls }) => !tool_calls)
      .map((message) => ({
        content: message.content,
        role: message.role === "tool" ? "system" : message.role,
      }));

    const toolMessages = tools?.map(({ function: f }) => ({
      mode: "tool",
      agentName,
      role: "system",
      content: `You can call the next tool: ${JSON.stringify(f)}`,
    }));

    const response = await ollama.chat({
      model: "nemotron-mini:4b",
      keep_alive: "1h",
      messages: join(commonMessages, toolMessages),
    });
    return {
      ...response.message,
      mode,
      agentName,
    };
  },
});

const NOMIC_EMBEDDING = addEmbedding({
  embeddingName: "nomic_embedding",
  calculateSimilarity: (a, b) => {
    return tidy(() => {
      const tensorA = tensor1d(a);
      const tensorB = tensor1d(b);
      const dotProduct = sum(mul(tensorA, tensorB));
      const normA = norm(tensorA);
      const normB = norm(tensorB);
      const cosineData = div(dotProduct, mul(normA, normB)).dataSync();
      const cosineSimilarity = cosineData[0];
      return cosineSimilarity;
    });
  },
  createEmbedding: async (text) => {
    const { embedding } = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: text,
    });
    return embedding;
  },
});

const TEST_STORAGE = addStorage({
  createIndex: ({ description }) => description,
  embedding: NOMIC_EMBEDDING,
  storageName: "test_storage",
  getData: () => {
    const data = readFileSync("./data.json").toString();
    return JSON.parse(data).slice(0, 100);
  },
});

const TEST_AGENT = addAgent({
  agentName: "test_agent",
  completion: NEMOTRON_COMPLETION,
  prompt: "Test agent",
  storages: [TEST_STORAGE],
  callbacks: {
    onResurrect: log,
  },
});

const TEST_SWARM = addSwarm({
  swarmName: "test_swarm",
  agentList: [TEST_AGENT],
  defaultAgent: TEST_AGENT,
});

{
  const clientId = randomString();
  session(clientId, TEST_SWARM);

  for (let i = 0; i !== 100; i++) {
    console.log(`Iter ${i + 1}`);

    if (i === TOTAL_TESTS - 1) {
      console.time("vector-search");
      await Storage.take(" reduce pain, fever", 1, clientId, TEST_AGENT, TEST_STORAGE)
      console.timeEnd("vector-search");
      continue;
    }

    await Storage.take(" reduce pain, fever", 1, clientId, TEST_AGENT, TEST_STORAGE)
  }

}
