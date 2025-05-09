import { IPipelineSchema } from "../../model/Pipeline.model";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overridePipeline";

type TPipelineSchema = {
  pipelineName: IPipelineSchema["pipelineName"];
} & Partial<IPipelineSchema>;

export const overridePipeline = beginContext(
  (pipelineSchema: TPipelineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        pipelineSchema,
      });

    return swarm.pipelineSchemaService.override(
      pipelineSchema.pipelineName,
      pipelineSchema
    );
  }
) as <Payload extends object = any>(
  pipelineSchema: IPipelineSchema<Payload>
) => IPipelineSchema<Payload>;
