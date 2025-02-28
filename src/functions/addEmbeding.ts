import { IEmbeddingSchema } from "../interfaces/Embedding.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Adds a new embedding to the embedding registry. The swarm takes only those embeddings which was registered
 *
 * @param {IEmbeddingSchema} embeddingSchema - The schema of the embedding to be added.
 * @returns {string} The name of the added embedding.
 */
export const addEmbedding = (embeddingSchema: IEmbeddingSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log("function addEmbedding", {
      embeddingSchema,
    });
  swarm.embeddingValidationService.addEmbedding(
    embeddingSchema.embeddingName,
    embeddingSchema
  );
  swarm.embeddingSchemaService.register(
    embeddingSchema.embeddingName,
    embeddingSchema
  );
  return embeddingSchema.embeddingName;
};
