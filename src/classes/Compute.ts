/**
 * @module ComputeUtils
 * @description Utility class for compute operations, providing methods to update and retrieve compute data with validation and context management.
 */

import { GLOBAL_CONFIG } from "../config/params";
import { ComputeName } from "../interfaces/Compute.interface";
import swarm from "../lib";
import beginContext from "../utils/beginContext";

/**
 * @constant {string} METHOD_NAME_UPDATE
 * @description Method name for the update operation.
 * @private
 */
const METHOD_NAME_UPDATE = "ComputeUtils.update";

/**
 * @constant {string} METHOD_NAME_GET_COMPUTE_DATA
 * @description Method name for the getComputeData operation.
 * @private
 */
const METHOD_NAME_GET_COMPUTE_DATA = "ComputeUtils.getComputeData";

/**
 * @class ComputeUtils
 * @description Provides utility methods for interacting with compute services, including validation and context handling.
 */
export class ComputeUtils {
  /**
   * @method update
   * @description Updates a compute instance with validation and context management.
   * @param {string} clientId - Client identifier.
   * @param {ComputeName} computeName - Name of the compute.
   * @returns {Promise<void>} Resolves when the update is complete.
   * @async
   */
  public update = beginContext(
    async (clientId: string, computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_UPDATE, {
          clientId,
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_UPDATE);
      return await swarm.computePublicService.update(
        METHOD_NAME_UPDATE,
        clientId,
        computeName,
      );
    }
  ); 

  /**
   * @method getComputeData
   * @description Retrieves compute data with validation and context management.
   * @param {string} clientId - Client identifier.
   * @param {ComputeName} computeName - Name of the compute.
   * @returns {Promise<any>} The computed data.
   * @async
   */
  public getComputeData = beginContext(
    async (clientId: string, computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_GET_COMPUTE_DATA, {
          clientId,
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_GET_COMPUTE_DATA);
      return await swarm.computePublicService.getComputeData(
        METHOD_NAME_GET_COMPUTE_DATA,
        clientId,
        computeName,
      );
    }
  );
}

/**
 * @constant {ComputeUtils} Compute
 * @description Singleton instance of ComputeUtils.
 */
export const Compute = new ComputeUtils();

/**
 * @export
 * @default Compute
 * @description Exports the Compute singleton as the default export.
 */
export default Compute;
