import { addEmbedding } from "agent-swarm-kit";
import { tidy, mul, norm, sum, tensor1d, div } from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";
import { EmbeddingName } from "../enum/EmbeddingName";
import { Ollama } from "ollama";

/*
  createEmbedding: async (text) => {
    const output = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
      encoding_format: "float",
    });
    const [{ embedding }] = output.data;
    return embedding;
  },
*/

const ollama = new Ollama();

addEmbedding({
  embeddingName: EmbeddingName.NomicEmbedding,
  calculateSimilarity: async (a, b) => {
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
