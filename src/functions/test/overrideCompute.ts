import { IComputeSchema } from "../../interfaces/Compute.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideCompute";

type TComputeSchema = {
  computeName: IComputeSchema["computeName"];
} & Partial<IComputeSchema>;

export const overrideCompute = beginContext((computeSchema: TComputeSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      computeSchema,
    });

  return swarm.computeSchemaService.override(computeSchema.computeName, computeSchema);
});
