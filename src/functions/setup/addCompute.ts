/**
 * @module addCompute
 * @description Provides a function to register a compute schema with validation and logging.
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
 * @template T - Type extending IComputeData.
 * @param {IComputeSchema<T>} computeSchema - The compute schema to register.
 * @returns {string} The name of the registered compute.
 */
export function addCompute<T extends IComputeData = any>(computeSchema: IComputeSchema<T>) {
  return addComputeInternal(computeSchema);
}
