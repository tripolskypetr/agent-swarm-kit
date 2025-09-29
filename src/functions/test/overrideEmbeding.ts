import { IEmbeddingSchema } from "../../interfaces/Embedding.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideEmbeding";

/**
 * Type representing a partial embedding schema with required embeddingName.
 * Used for overriding existing embedding configurations with selective updates.
 * Combines required embedding name with optional embedding properties.
 */
type TEmbeddingSchema = {
  embeddingName: IEmbeddingSchema["embeddingName"];
} & Partial<IEmbeddingSchema>;

/**
 * Function implementation
 */
const overrideEmbedingInternal = beginContext(
  (publicEmbeddingSchema: TEmbeddingSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        embeddingSchema: publicEmbeddingSchema,
      });

    const embeddingSchema = removeUndefined(publicEmbeddingSchema);

    return swarm.embeddingSchemaService.override(
      embeddingSchema.embeddingName,
      embeddingSchema
    );
  }
);

/**
 * Overrides an existing embedding schema in the swarm system with a new or partial schema.
 * This function updates the configuration of an embedding mechanism identified by its `embeddingName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 *
 * @param {TEmbeddingSchema} embeddingSchema - The schema definition for embedding.
 * @throws {Error} If the embedding schema service encounters an error during the override operation (e.g., invalid embeddingName or schema).
 *
 * @example
 * // Override an embedding’s schema with new properties
 * overrideEmbeding({
 *   embeddingName: "TextEmbedding",
 *   persist: true,
 *   callbacks: {
 *     onCreate: (text, embeddings) => console.log(`Created embedding for ${text}`),
 *   },
 * });
 * // Logs the operation (if enabled) and updates the embedding schema in the swarm.
 */
export function overrideEmbeding(embeddingSchema: TEmbeddingSchema) {
  return overrideEmbedingInternal(embeddingSchema);
}
