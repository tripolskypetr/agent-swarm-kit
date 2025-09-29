/**
 * @module addCompute
 * Provides a function to register a compute schema with validation and logging.
 */

import { IComputeData, IComputeSchema } from "../../interfaces/Compute.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/**
 * Function implementation
 */
const addComputeInternal = beginContext((computeSchema: IComputeSchema): string => {
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

/**
 * Registers a compute schema, validates it, and adds it to the compute schema service.
 *
 * @param computeSchema Partial compute schema with updates to be applied to the existing compute configuration.
 * @template T - Type extending IComputeData.
 */
export function addCompute<T extends IComputeData = any>(computeSchema: IComputeSchema<T>) {
  return addComputeInternal(computeSchema);
}
