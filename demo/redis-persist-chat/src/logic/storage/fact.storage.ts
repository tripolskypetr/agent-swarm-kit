import { addStorage } from "agent-swarm-kit";
import { EmbeddingName } from "../../enum/EmbeddingName";
import type { IFactSchema } from "../../model/FactSchema.model";
import { StorageName } from "../../enum/StorageName";

addStorage<IFactSchema>({
  docDescription: "This storage, named FactStorage, operates within the persist-redis-storage project to maintain a collection of fascinating facts with descriptions indexed by NomicEmbedding, persisting them in Redis alongside chat history and agent states, initialized with default entries like honey’s longevity and Venus’s rotation.",
  createIndex: ({ description }) => description,
  embedding: EmbeddingName.NomicEmbedding,
  storageName: StorageName.FactStorage,
  getDefaultData: () => [
    {
      id: 1,
      title: "Honey never spoils",
      description:
        "Archaeological findings have uncovered pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
    },
    {
      id: 2,
      title: "Octopuses have three hearts",
      description:
        "Two hearts pump blood through the gills, while the third pumps it through the rest of the body.",
    },
    {
      id: 3,
      title: "Bananas are berries",
      description:
        "Botanically speaking, bananas are berries while strawberries are not. Bananas develop from a single flower with one ovary and have seeds inside the flesh.",
    },
    {
      id: 4,
      title: "A day on Venus is longer than its year",
      description:
        "Venus takes 243 Earth days to rotate once on its axis but only 225 Earth days to orbit the Sun completely.",
    },
    {
      id: 5,
      title: "The Great Wall of China is not visible from space",
      description:
        "Contrary to popular belief, the Great Wall cannot be seen from space with the naked eye. This myth has been debunked by multiple astronauts.",
    },
  ],
});
