import { IEmbeddingSchema } from "../../interfaces/Embedding.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addEmbedding";

/**
 * Function implementation
 */
const addEmbeddingInternal = beginContext(
  (embeddingSchema: IEmbeddingSchema) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        embeddingSchema,
      });

    // Register the embedding in the validation and schema services
    swarm.embeddingValidationService.addEmbedding(
      embeddingSchema.embeddingName,
      embeddingSchema
    );
    swarm.embeddingSchemaService.register(
      embeddingSchema.embeddingName,
      embeddingSchema
    );

    // Return the embedding's name as confirmation of registration
    return embeddingSchema.embeddingName;
  }
);

/**
 * Adds a new embedding engine to the embedding registry for use within the swarm system.
 *
 * This function registers a new embedding engine, enabling the swarm to utilize it for tasks such as vector generation or similarity comparisons.
 * Only embeddings registered through this function are recognized by the swarm. The execution is wrapped in `beginContext` to ensure it runs
 * outside of existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled
 * and returns the embedding's name upon successful registration.
 *
 * @param {IEmbeddingSchema} embeddingSchema - The schema defining the embedding engine's properties, including its name (`embeddingName`) and configuration details.
 * @returns {string} The name of the newly added embedding (`embeddingSchema.embeddingName`), confirming its registration.
 * @throws {Error} If the embedding schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate embedding name).
 * @example
 * const embeddingSchema = { embeddingName: "TextEmbedder", model: "bert-base" };
 * const embeddingName = addEmbedding(embeddingSchema);
 * console.log(embeddingName); // Outputs "TextEmbedder"
 */
export function addEmbedding(embeddingSchema: IEmbeddingSchema) {
  return addEmbeddingInternal(embeddingSchema);
}
