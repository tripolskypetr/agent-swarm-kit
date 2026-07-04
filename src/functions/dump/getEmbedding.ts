import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { EmbeddingName } from "../../interfaces/Embedding.interface";

const METHOD_NAME = "function.dump.getEmbedding";

/**
 * Retrieves an embedding schema by its name from the swarm's embedding schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getEmbedding
 * @param {EmbeddingName} embeddingName - The name of the embedding.
*/
export function getEmbedding(embeddingName: EmbeddingName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      embeddingName,
    });
  return swarm.embeddingSchemaService.get(embeddingName);
}

/**
 * Backward-compatible alias for {@link getEmbedding}.
 * @deprecated Use `getEmbedding` instead; kept to preserve the public API of earlier releases.
*/
export const getEmbeding = getEmbedding;
