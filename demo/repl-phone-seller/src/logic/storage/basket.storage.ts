import { addStorage } from "agent-swarm-kit";
import { StorageName } from "../enum/StorageName";
import { EmbeddingName } from "../enum/EmbeddingName";
import { BasketModel } from "../../model/Basket.model";

addStorage<BasketModel>({
  docDescription: "This storage, named BasketStorage, functions within the repl-phone-seller project to maintain a user’s phone cart in a REPL terminal environment, indexing items by title using NomicEmbedding to facilitate efficient storage and retrieval of phones added via the AddToBacketTool.",
  createIndex: ({ title }) => `${title}`,
  embedding: EmbeddingName.NomicEmbedding,
  storageName: StorageName.BasketStorage,
});
