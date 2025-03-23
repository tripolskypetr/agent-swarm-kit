import { addEmbedding } from "agent-swarm-kit";
import { Ollama } from "ollama";
import { tidy, mul, norm, sum, tensor1d, div } from "@tensorflow/tfjs-core";

const ollama = new Ollama();

export const OLLAMA_EMBEDDING = addEmbedding({
  embeddingName: 'ollama_embedding',
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
