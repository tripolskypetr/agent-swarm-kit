/**
 * @module SharedComputePublicService
 * @description Provides a public interface for interacting with shared compute services, wrapping operations in a method context.
 */

import { inject } from "../../core/di";
import { SharedComputeConnectionService } from "../connection/SharedComputeConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IComputeData, ComputeName } from "../../../interfaces/Compute.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { StateName } from "../../../interfaces/State.interface";

/**
 * @interface ISharedComputeConnectionService
 * @description Extends SharedComputeConnectionService for type compatibility.
 */
interface ISharedComputeConnectionService extends SharedComputeConnectionService {}

/**
 * @type InternalKeys
 * @description Defines keys to be excluded from the public interface.
 */
type InternalKeys = keyof {
  getComputeRef: never;
  getSharedComputeRef: never;
};

/**
 * @type TSharedComputeConnectionService
 * @description Type for the shared compute public service, excluding internal keys.
 */
type TSharedComputeConnectionService = {
  [key in Exclude<keyof ISharedComputeConnectionService, InternalKeys>]: unknown;
};

/**
 * @class SharedComputePublicService
 * @template T - Type extending IComputeData.
 * @implements {TSharedComputeConnectionService}
 * @description Public service for managing shared compute operations with context-aware execution.
 */
export class SharedComputePublicService<T extends IComputeData = IComputeData>
  implements TSharedComputeConnectionService
{
  /**
   * @property {LoggerService} loggerService
   * @description Injected logger service for logging operations.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @property {SharedComputeConnectionService} sharedComputeConnectionService
   * @description Injected shared compute connection service for compute operations.
   * @private
   */
  private readonly sharedComputeConnectionService =
    inject<SharedComputeConnectionService>(TYPES.sharedComputeConnectionService);

  /**
   * @method getComputeData
   * @description Retrieves computed data for a shared compute within a method context.
   * @param {string} methodName - Name of the method for context.
   * @param {ComputeName} computeName - Name of the shared compute.
   * @returns {Promise<T>} The computed data.
   * @async
   */
  public getComputeData = async (
    methodName: string,
    computeName: ComputeName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputePublicService getComputeData`, {
        methodName,
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedComputeConnectionService.getComputeData();
      },
      {
        methodName,
        computeName,
        clientId: "",
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * @method calculate
   * @description Triggers a recalculation for the shared compute instance within a method context.
   * @param {StateName} stateName - The name of the state that changed.
   * @param {string} methodName - Name of the method for context.
   * @param {ComputeName} computeName - Name of the shared compute.
   * @returns {Promise<void>}
   * @async
   */
  public calculate = async (
    stateName: StateName,
    methodName: string,
    computeName: ComputeName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputePublicService calculate`, {
        stateName,
        methodName,
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedComputeConnectionService.calculate(stateName);
      },
      {
        methodName,
        clientId: "",
        computeName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };

  /**
   * @method update
   * @description Forces an update of the shared compute instance within a method context.
   * @param {string} methodName - Name of the method for context.
   * @param {ComputeName} computeName - Name of the shared compute.
   * @returns {Promise<void>}
   * @async
   */
  public update = async (
    methodName: string,
    computeName: ComputeName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputePublicService update`, {
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedComputeConnectionService.update();
      },
      {
        methodName,
        clientId: "",
        computeName,
        policyName: "",
        agentName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        mcpName: "",
      }
    );
  };
}

/**
 * @export
 * @default SharedComputePublicService
 * @description Exports the SharedComputePublicService class as the default export.
 */
export default SharedComputePublicService;
