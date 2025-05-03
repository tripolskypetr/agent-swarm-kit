import { inject } from "../../core/di";
import { SharedComputeConnectionService } from "../connection/SharedComputeConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IComputeData, ComputeName } from "../../../interfaces/Compute.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { StateName } from "../../../interfaces/State.interface";

interface ISharedComputeConnectionService extends SharedComputeConnectionService {}

type InternalKeys = keyof {
  getComputeRef: never;
  getSharedComputeRef: never;
};

type TSharedComputeConnectionService = {
  [key in Exclude<keyof ISharedComputeConnectionService, InternalKeys>]: unknown;
};

export class SharedComputePublicService<T extends IComputeData = IComputeData>
  implements TSharedComputeConnectionService
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly sharedComputeConnectionService =
    inject<SharedComputeConnectionService>(TYPES.sharedComputeConnectionService);


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

  public update = async (
    methodName: string,
    clientId: string,
    computeName: ComputeName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputePublicService update`, {
        clientId,
        computeName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.sharedComputeConnectionService.update(clientId, computeName);
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

export default SharedComputePublicService;