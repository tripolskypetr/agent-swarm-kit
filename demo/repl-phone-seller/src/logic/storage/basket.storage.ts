import { addStorage } from "agent-swarm-kit";
import { StorageName } from "../enum/StorageName";
import { EmbeddingName } from "../enum/EmbeddingName";
import { BasketModel } from "../../model/Basket.model";

addStorage<BasketModel>({
  createIndex: ({ title }) => `${title}`,
  embedding: EmbeddingName.NomicEmbedding,
  storageName: StorageName.BasketStorage,
});
