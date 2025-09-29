/**
 *  * Provides a public interface for interacting with shared compute services, wrapping operations in a method context.
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
 *  * Extends SharedComputeConnectionService for type compatibility.
 */
interface ISharedComputeConnectionService extends SharedComputeConnectionService {}

/**
 *  * Defines keys to be excluded from the public interface.
 */
type InternalKeys = keyof {
  getComputeRef: never;
  getSharedComputeRef: never;
};

/**
 *  * Type for the shared compute public service, excluding internal keys.
 */
type TSharedComputeConnectionService = {
  [key in Exclude<keyof ISharedComputeConnectionService, InternalKeys>]: unknown;
};

/**
 *  *  *  * Public service for managing shared compute operations with context-aware execution.
 */
export class SharedComputePublicService<T extends IComputeData = IComputeData>
  implements TSharedComputeConnectionService
{
  /**
   *    * Injected logger service for logging operations.
   * */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   *    * Injected shared compute connection service for compute operations.
   * */
  private readonly sharedComputeConnectionService =
    inject<SharedComputeConnectionService>(TYPES.sharedComputeConnectionService);

  /**
   *    * Retrieves computed data for a shared compute within a method context.
   *    *    *    * */
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
   *    * Triggers a recalculation for the shared compute instance within a method context.
   *    *    *    *    * */
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
   *    * Forces an update of the shared compute instance within a method context.
   *    *    *    * */
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
 * *  * Exports the SharedComputePublicService class as the default export.
 */
export default SharedComputePublicService;
