import { addStorage } from "agent-swarm-kit";

import { readFile } from "fs/promises";
import { OLLAMA_EMBEDDING } from "../embedding/ollama.embedding";
import { str } from "functools-kit";

interface IProductDto {
  id: number;
  description: string;
}

export const PHARMA_STORAGE = addStorage<IProductDto>({
  storageName: "pharma_storage",
  embedding: OLLAMA_EMBEDDING,
  shared: true,
  createIndex: ({ description }) => description,
  getData: async () => {
    const data = await readFile("./data/products.json");
    return JSON.parse(data.toString());
  },
});
