/**
 * @module overrideCompute
 * @description Provides a function to override an existing compute schema with partial updates.
 */

import { IComputeSchema } from "../../interfaces/Compute.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/**
 * @constant {string} METHOD_NAME
 * @description Method name for the overrideCompute operation.
 * @private
 */
const METHOD_NAME = "function.test.overrideCompute";

/**
 * @type TComputeSchema
 * @description Type for partial compute schema updates, requiring computeName and allowing other IComputeSchema properties.
 */
type TComputeSchema = {
  computeName: IComputeSchema["computeName"];
} & Partial<IComputeSchema>;

/**
 * Function implementation
 */
const overrideComputeInternal = beginContext((computeSchema: TComputeSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      computeSchema,
    });

  return swarm.computeSchemaService.override(computeSchema.computeName, computeSchema);
});

/**
 * Overrides an existing compute schema with provided partial updates.
 * @param {TComputeSchema} computeSchema - The partial compute schema with updates.
 * @returns {IComputeSchema} The updated compute schema.
 */
export function overrideCompute(computeSchema: TComputeSchema) {
  return overrideComputeInternal(computeSchema)
}
