/**
 * @module ComputePublicService
 * @description Provides a public interface for interacting with compute services, wrapping operations in a method context.
 */

import { inject } from "../../core/di";
import { ComputeConnectionService } from "../connection/ComputeConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IComputeData, ComputeName } from "../../../interfaces/Compute.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { StateName } from "../../../interfaces/State.interface";

/**
 * @interface IComputeConnectionService
 * @description Extends ComputeConnectionService for type compatibility.
 */
interface IComputeConnectionService extends ComputeConnectionService {}

/**
 * @type InternalKeys
 * @description Defines keys to be excluded from the public interface.
 */
type InternalKeys = keyof {
  getComputeRef: never;
  getSharedComputeRef: never;
};

/**
 * @type TComputeConnectionService
 * @description Type for the public compute service, excluding internal keys.
 */
type TComputeConnectionService = {
  [key in Exclude<keyof IComputeConnectionService, InternalKeys>]: unknown;
};

/**
 * @class ComputePublicService
 * @template T - Type extending IComputeData.
 * @implements {TComputeConnectionService}
 * @description Public service for managing compute operations with context-aware execution.
 */
export class ComputePublicService<T extends IComputeData = IComputeData>
  implements TComputeConnectionService
{
  /**
   * @property {LoggerService} loggerService
   * @description Injected logger service for logging operations.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @property {ComputeConnectionService} computeConnectionService
   * @description Injected compute connection service for compute operations.
   * @private
   */
  private readonly computeConnectionService = inject<ComputeConnectionService>(
    TYPES.computeConnectionService
  );

  /**
   * @method getComputeData
   * @description Retrieves computed data within a method context.
   * @param {string} methodName - Name of the method for context.
   * @param {string} clientId - Client identifier.
   * @param {ComputeName} computeName - Name of the compute.
   * @returns {Promise<T>} The computed data.
   * @async
   */
  public getComputeData = async (
    methodName: string,
    clientId: string,
    computeName: ComputeName
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computePublicService getComputeData`, {
        methodName,
        clientId,
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.computeConnectionService.getComputeData();
      },
      {
        methodName,
        clientId,
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
   * @method calculate
   * @description Triggers a recalculation for the compute instance within a method context.
   * @param {StateName} stateName - The name of the state that changed.
   * @param {string} methodName - Name of the method for context.
   * @param {string} clientId - Client identifier.
   * @param {ComputeName} computeName - Name of the compute.
   * @returns {Promise<void>}
   * @async
   */
  public calculate = async (
    stateName: StateName,
    methodName: string,
    clientId: string,
    computeName: ComputeName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computePublicService calculate`, {
        stateName,
        methodName,
        clientId,
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.computeConnectionService.calculate(stateName);
      },
      {
        methodName,
        clientId,
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
   * @description Forces an update of the compute instance within a method context.
   * @param {string} methodName - Name of the method for context.
   * @param {string} clientId - Client identifier.
   * @param {ComputeName} computeName - Name of the compute.
   * @returns {Promise<void>}
   * @async
   */
  public update = async (
    methodName: string,
    clientId: string,
    computeName: ComputeName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computePublicService update`, {
        clientId,
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.computeConnectionService.update();
      },
      {
        methodName,
        clientId,
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
   * @method dispose
   * @description Cleans up the compute instance within a method context.
   * @param {string} methodName - Name of the method for context.
   * @param {string} clientId - Client identifier.
   * @param {ComputeName} computeName - Name of the compute.
   * @returns {Promise<void>}
   * @async
   */
  public dispose = async (
    methodName: string,
    clientId: string,
    computeName: ComputeName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("computePublicService dispose", {
        methodName,
        clientId,
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.computeConnectionService.dispose();
      },
      {
        methodName,
        clientId,
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
 * @default ComputePublicService
 * @description Exports the ComputePublicService class as the default export.
 */
export default ComputePublicService;
