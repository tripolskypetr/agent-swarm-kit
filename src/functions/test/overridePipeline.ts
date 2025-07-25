/**
 * @module overridePipeline
 * @description Provides a function to override an existing pipeline schema with partial updates.
 */

import { IPipelineSchema } from "../../model/Pipeline.model";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

/**
 * @constant {string} METHOD_NAME
 * @description Method name for the overridePipeline operation.
 * @private
 */
const METHOD_NAME = "function.test.overridePipeline";

/**
 * @type TPipelineSchema
 * @description Type for partial pipeline schema updates, requiring pipelineName and allowing other IPipelineSchema properties.
 */
type TPipelineSchema = {
  pipelineName: IPipelineSchema["pipelineName"];
} & Partial<IPipelineSchema>;

/**
 * Function implementation
 */
const overridePipelineInternal = beginContext(
  (publicPipelineSchema: TPipelineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        pipelineSchema: publicPipelineSchema,
      });

    const pipelineSchema = removeUndefined(publicPipelineSchema);

    return swarm.pipelineSchemaService.override(
      pipelineSchema.pipelineName,
      pipelineSchema
    );
  }
);

/**
 * Overrides an existing pipeline schema with provided partial updates.
 * @template Payload - Type extending object for the pipeline payload.
 * @param {IPipelineSchema<Payload>} pipelineSchema - The partial pipeline schema with updates.
 * @returns {IPipelineSchema<Payload>} The updated pipeline schema.
 */
export function overridePipeline<Payload extends object = any>(
  pipelineSchema: IPipelineSchema<Payload>
): IPipelineSchema<Payload> {
  return overridePipelineInternal(pipelineSchema);
}
