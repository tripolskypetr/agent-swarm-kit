import { addStorage } from "agent-swarm-kit";
import { readFile } from "fs/promises";
import { StorageName } from "../enum/StorageName";
import { EmbeddingName } from "../enum/EmbeddingName";
import { PhoneModel } from "../../model/Phone.model";

addStorage<PhoneModel>({
  docDescription: "This storage, named PhoneStorage, operates within the repl-phone-seller project to hold a shared collection of phone data loaded from a JSON file in a REPL terminal environment, indexing items by title and description using NomicEmbedding to support searches via SearchPhoneTool and SearchPhoneByDiagonalTool.",
  createIndex: ({ title, description }) => ({
    title,
    description,
  }),
  shared: true,
  embedding: EmbeddingName.NomicEmbedding,
  storageName: StorageName.PhoneStorage,
  getDefaultData: async () => {
    const phoneBuffer = await readFile("./data/phones.json");
    const phoneString = phoneBuffer.toString();
    return JSON.parse(phoneString)
  },
});
