import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import { IPipelineSchema } from "../../model/Pipeline.model";

const METHOD_NAME = "function.setup.addPipeline";

export const addPipeline = beginContext((pipelineSchema: IPipelineSchema) => {
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
}) as <Payload extends object = any>(
  pipelineSchema: IPipelineSchema<Payload>
) => string;
