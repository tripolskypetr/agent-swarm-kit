/**
 * @module SharedComputeUtils
 * @description Utility class for shared compute operations, providing methods to update and retrieve shared compute data with validation and context management.
 */

import { GLOBAL_CONFIG } from "../config/params";
import { ComputeName, IComputeData } from "../interfaces/Compute.interface";
import swarm from "../lib";
import beginContext from "../utils/beginContext";

/**
 * @constant {string} METHOD_NAME_UPDATE
 * @description Method name for the update operation.
 * @private
 */
const METHOD_NAME_UPDATE = "SharedComputeUtils.update";

/**
 * @constant {string} METHOD_NAME_GET_COMPUTE_DATA
 * @description Method name for the getComputeData operation.
 * @private
 */
const METHOD_NAME_GET_COMPUTE_DATA = "SharedComputeUtils.getComputeData";

/**
 * @class SharedComputeUtils
 * @description Provides utility methods for interacting with shared compute services, including validation and context handling.
 */
export class SharedComputeUtils {
  /**
   * @method update
   * @description Updates a shared compute instance with validation and context management.
   * @param {ComputeName} computeName - Name of the shared compute.
   * @returns {Promise<void>} Resolves when the update is complete.
   * @async
   */
  public update = beginContext(
    async (computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_UPDATE, {
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_UPDATE);
      return await swarm.sharedComputePublicService.update(
        METHOD_NAME_UPDATE,
        computeName,
      );
    }
  ); 

  /**
   * @method getComputeData
   * @description Retrieves shared compute data with validation and context management.
   * @param {ComputeName} computeName - Name of the shared compute.
   * @returns {Promise<any>} The computed data.
   * @async
   */
  public getComputeData = beginContext(
    async (computeName: ComputeName) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_GET_COMPUTE_DATA, {
          computeName,
        });
      swarm.computeValidationService.validate(computeName, METHOD_NAME_GET_COMPUTE_DATA);
      return await swarm.sharedComputePublicService.getComputeData(
        METHOD_NAME_GET_COMPUTE_DATA,
        computeName,
      );
    }
  ) as <T extends IComputeData = any>(clientId: string, computeName: ComputeName) => Promise<T>;
}

/**
 * @constant {SharedComputeUtils} SharedCompute
 * @description Singleton instance of SharedComputeUtils.
 */
export const SharedCompute = new SharedComputeUtils();

/**
 * @export
 * @default SharedCompute
 * @description Exports the SharedCompute singleton as the default export.
 */
export default SharedCompute;
