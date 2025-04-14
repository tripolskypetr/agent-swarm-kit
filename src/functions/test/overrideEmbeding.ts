import { IEmbeddingSchema } from "../../interfaces/Embedding.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideEmbeding";

type TEmbeddingSchema = {
  embeddingName: IEmbeddingSchema["embeddingName"];
} & Partial<IEmbeddingSchema>;

export const overrideEmbeding = beginContext(
  (embeddingSchema: TEmbeddingSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        embeddingSchema,
      });

    return swarm.embeddingSchemaService.override(
      embeddingSchema.embeddingName,
      embeddingSchema
    );
  }
);
