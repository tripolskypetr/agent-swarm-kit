import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { PipelineName } from "../../model/Pipeline.model";

const METHOD_NAME = "function.dump.getPipeline";

/**
 * Retrieves a pipeline schema by its name from the swarm's pipeline schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getPipeline
 * @param {PipelineName} pipelineName - The name of the pipeline.
*/
export function getPipeline(pipelineName: PipelineName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      pipelineName,
    });
  return swarm.pipelineSchemaService.get(pipelineName);
}
