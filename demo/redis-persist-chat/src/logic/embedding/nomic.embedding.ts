import { addEmbedding } from "agent-swarm-kit";
import { Ollama } from "ollama";
import { tidy, mul, norm, sum, tensor1d, div } from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";
import { EmbeddingName } from "../../enum/EmbeddingName";

const ollama = new Ollama();

addEmbedding({
  embeddingName: EmbeddingName.NomicEmbedding,
  calculateSimilarity: async (a, b) => {
    const tensorA = tensor1d(a);
    const tensorB = tensor1d(b);
    const dotProduct = sum(mul(tensorA, tensorB));
    const normA = norm(tensorA);
    const normB = norm(tensorB);
    const normProduct = mul(normA, normB);
    const cosineTensor = div(dotProduct, normProduct);
    const [similarity] = await cosineTensor.data();
    {
      tensorA.dispose();
      tensorB.dispose();
      dotProduct.dispose();
      normA.dispose();
      normB.dispose();
      normProduct.dispose();
      cosineTensor.dispose();
    }
    return similarity;
  },
  createEmbedding: async (text) => {
    const { embedding } = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: text,
    });
    return embedding;
  },
});
