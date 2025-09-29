/**
 * @module ComputeUtils
 * Utility class for compute operations, providing methods to update and retrieve compute data with validation and context management.
 */

import { GLOBAL_CONFIG } from "../config/params";
import { ComputeName, IComputeData } from "../interfaces/Compute.interface";
import swarm from "../lib";
import beginContext from "../utils/beginContext";

/**
 * @constant {string} METHOD_NAME_UPDATE
 * Method name for the update operation.
 * @private
 */
const METHOD_NAME_UPDATE = "ComputeUtils.update";

/**
 * @constant {string} METHOD_NAME_GET_COMPUTE_DATA
 * Method name for the getComputeData operation.
 * @private
 */
const METHOD_NAME_GET_COMPUTE_DATA = "ComputeUtils.getComputeData";

/**
 * @class ComputeUtils
 * Provides utility methods for interacting with compute services, including validation and context handling.
 */
export class ComputeUtils {
  /**
   * @method update
   * Updates a compute instance with validation and context management.
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
   * Retrieves compute data with validation and context management.
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
  ) as <T extends IComputeData = any>(clientId: string, computeName: ComputeName) => Promise<T>;
}

/**
 * @constant {ComputeUtils} Compute
 * Singleton instance of ComputeUtils.
 */
export const Compute = new ComputeUtils();

/**
 * @export
 * @default Compute
 * Exports the Compute singleton as the default export.
 */
export default Compute;
