import { inject } from "../../core/di";
import { ComputeConnectionService } from "../connection/ComputeConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { IComputeData, ComputeName } from "../../../interfaces/Compute.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import { StateName } from "../../../interfaces/State.interface";

interface IComputeConnectionService extends ComputeConnectionService {}

type InternalKeys = keyof {
  getComputeRef: never;
  getSharedComputeRef: never;
};

type TComputeConnectionService = {
  [key in Exclude<keyof IComputeConnectionService, InternalKeys>]: unknown;
};

export class ComputePublicService<T extends IComputeData = IComputeData>
  implements TComputeConnectionService
{

  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly computeConnectionService = inject<ComputeConnectionService>(
    TYPES.computeConnectionService
  );

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
        return await this.computeConnectionService.update(clientId, computeName);
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

export default ComputePublicService;
