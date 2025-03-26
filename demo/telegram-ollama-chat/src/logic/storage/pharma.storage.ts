import { addStorage } from "agent-swarm-kit";
import { readFile } from "fs/promises";
import { OLLAMA_EMBEDDING } from "../embedding/ollama.embedding";
import { str } from "functools-kit";

interface IProductDto {
  id: number;
  description: string;
}

export const PHARMA_STORAGE = addStorage<IProductDto>({
  docDescription: "This storage, named pharma_storage, operates within the telegram-ollama-chat project to hold a shared collection of pharma product data loaded from a JSON file, indexed by description using OLLAMA_EMBEDDING to support product searches for the AI pharma seller across Telegram, REPL, or webview interfaces.",
  storageName: "pharma_storage",
  embedding: OLLAMA_EMBEDDING,
  shared: true,
  createIndex: ({ description }) => description,
  getDefaultData: async () => {
    const data = await readFile("./data/products.json");
    return JSON.parse(data.toString());
  },
});
