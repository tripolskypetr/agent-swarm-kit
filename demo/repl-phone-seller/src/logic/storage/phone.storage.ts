import { addStorage } from "agent-swarm-kit";
import { readFile } from "fs/promises";
import { StorageName } from "../enum/StorageName";
import { EmbeddingName } from "../enum/EmbeddingName";
import { PhoneModel } from "../../model/Phone.model";

addStorage<PhoneModel>({
  createIndex: ({ title, description }) => `${title}, ${description}`,
  shared: true,
  embedding: EmbeddingName.NomicEmbedding,
  storageName: StorageName.PhoneStorage,
  getDefaultData: async () => {
    const phoneBuffer = await readFile("./data/phones.json");
    const phoneString = phoneBuffer.toString();
    return JSON.parse(phoneString)
  },
});
