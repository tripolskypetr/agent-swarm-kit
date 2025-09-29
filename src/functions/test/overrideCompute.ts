/**
 * @module overrideCompute
 * Provides a function to override an existing compute schema with partial updates.
 */

import { IComputeData, IComputeSchema } from "../../interfaces/Compute.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

/**
 * @constant {string} METHOD_NAME
 * Method name for the overrideCompute operation.
 * @private
 */
const METHOD_NAME = "function.test.overrideCompute";

/**
 * Type representing a partial compute schema with required computeName.
 * Used for overriding existing compute configurations with selective updates.
 */
type TComputeSchema<T extends IComputeData = any> = {
  computeName: IComputeSchema<T>["computeName"];
} & Partial<IComputeSchema<T>>;

/**
 * Function implementation
 */
const overrideComputeInternal = beginContext((publicComputeSchema: TComputeSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      computeSchema: publicComputeSchema,
    });

  const computeSchema = removeUndefined(publicComputeSchema);

  return swarm.computeSchemaService.override(computeSchema.computeName, computeSchema);
});

/**
 * Overrides an existing compute schema with provided partial updates.
 */
export function overrideCompute<T extends IComputeData = any>(computeSchema: TComputeSchema<T>) {
  return overrideComputeInternal(computeSchema)
}
