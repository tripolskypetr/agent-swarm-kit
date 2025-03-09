import { inject } from "../../core/di";
import { PolicyConnectionService } from "../connection/PolicyConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import { PolicyName } from "src/interfaces/Policy.interface";
import { SwarmName } from "src/interfaces/Swarm.interface";

interface IPolicyConnectionService extends PolicyConnectionService {}

type InternalKeys = keyof {
  getPolicy: never;
};

type TPolicyConnectionService = {
  [key in Exclude<keyof IPolicyConnectionService, InternalKeys>]: unknown;
};

/**
 * Service for handling public policy operations.
 */
export class PolicyPublicService implements TPolicyConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly policyConnectionService = inject<PolicyConnectionService>(
    TYPES.policyConnectionService
  );

  public getBanMessage = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService getBanMessage", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.getBanMessage(
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
      }
    );
  };

  public validateInput = async (
    incoming: string,
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService validateInput", {
        incoming,
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.validateInput(
          incoming,
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
      }
    );
  };

  public validateOutput = async (
    outgoing: string,
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService validateOutput", {
        outgoing,
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.validateOutput(
          outgoing,
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
      }
    );
  };

  public banClient = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService banClient", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.banClient(
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
      }
    );
  };

  public unbanClient = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService unbanClient", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.unbanClient(
          clientId,
          swarmName
        );
      },
      {
        methodName,
        clientId,
        agentName: "",
        swarmName,
        policyName,
        storageName: "",
        stateName: "",
      }
    );
  };
}

export default PolicyPublicService;
