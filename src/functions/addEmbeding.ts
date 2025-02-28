import { IEmbeddingSchema } from "../interfaces/Embedding.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

const METHOD_NAME = "function.addEmbedding";

/**
 * Adds a new embedding to the embedding registry. The swarm takes only those embeddings which was registered
 *
 * @param {IEmbeddingSchema} embeddingSchema - The schema of the embedding to be added.
 * @returns {string} The name of the added embedding.
 */
export const addEmbedding = (embeddingSchema: IEmbeddingSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
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
