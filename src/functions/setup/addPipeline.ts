/**
 * @module addPipeline
 * Provides a function to register a pipeline schema with validation and logging.
*/

import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import { IPipelineSchema } from "../../model/Pipeline.model";

/**
 * @constant {string} METHOD_NAME
 * Method name for the addPipeline operation.
 * @private
*/
const METHOD_NAME = "function.setup.addPipeline";

/**
 * Function implementation
*/
const addPipelineInternal = beginContext((pipelineSchema: IPipelineSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      pipelineSchema,
    });

  swarm.pipelineValidationService.addPipeline(
    pipelineSchema.pipelineName,
    pipelineSchema
  );
  swarm.pipelineSchemaService.register(
    pipelineSchema.pipelineName,
    pipelineSchema
  );

  return pipelineSchema.pipelineName;
});

/**
 * Registers a pipeline schema, validates it, and adds it to the pipeline schema service.
 *
 * @param pipelineSchema Partial pipeline schema with updates to be applied to the existing pipeline configuration.
 * @template Payload - Type extending object for the pipeline payload.
*/
export function addPipeline<Payload extends object = any>(
  pipelineSchema: IPipelineSchema<Payload>
) {
  return addPipelineInternal(pipelineSchema);
}
