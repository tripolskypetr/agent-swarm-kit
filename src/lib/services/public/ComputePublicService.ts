/**
 * Provides a public interface for interacting with compute services, wrapping operations in a method context.
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
 * Extends ComputeConnectionService for type compatibility.
*/
interface IComputeConnectionService extends ComputeConnectionService {}

/**
 * Defines keys to be excluded from the public interface.
*/
type InternalKeys = keyof {
  getComputeRef: never;
  getSharedComputeRef: never;
};

/**
 * Type for the public compute service, excluding internal keys.
*/
type TComputeConnectionService = {
  [key in Exclude<keyof IComputeConnectionService, InternalKeys>]: unknown;
};

/**
 * Public service for managing compute operations with context-aware execution.
*/
export class ComputePublicService<T extends IComputeData = IComputeData>
  implements TComputeConnectionService
{
  /**
   * Injected logger service for logging operations.
   **/
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Injected compute connection service for compute operations.
   **/
  private readonly computeConnectionService = inject<ComputeConnectionService>(
    TYPES.computeConnectionService
  );

  /**
   * Retrieves computed data within a method context.
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
   * Triggers a recalculation for the compute instance within a method context.
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
   * Forces an update of the compute instance within a method context.
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
   * Cleans up the compute instance within a method context.
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
 * * Exports the ComputePublicService class as the default export.
*/
export default ComputePublicService;
