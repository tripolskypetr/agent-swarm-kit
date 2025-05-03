import { IComputeSchema } from "../../interfaces/Compute.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

export const addCompute = beginContext((computeSchema: IComputeSchema): string => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log("function.setup.addCompute", {
      computeSchema,
    });

  swarm.computeValidationService.addCompute(
    computeSchema.computeName,
    computeSchema
  );

  swarm.computeSchemaService.register(computeSchema.computeName, computeSchema);

  return computeSchema.computeName;
});
