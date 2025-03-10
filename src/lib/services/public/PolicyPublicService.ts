import { inject } from "../../core/di";
import { PolicyConnectionService } from "../connection/PolicyConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import { PolicyName } from "../../../interfaces/Policy.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";

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

  /**
   * Check if has ban message
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} methodName - The name of the method.
   * @param {string} clientId - The ID of the client.
   * @param {PolicyName} policyName - The name of the policy.
   * @returns {Promise<boolean>}
   */
  public hasBan = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("policyPublicService hasBan", {
        methodName,
        clientId,
        swarmName,
        policyName,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.policyConnectionService.hasBan(clientId, swarmName);
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

  /**
   * Retrieves the ban message for a client in a specific swarm.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} methodName - The name of the method.
   * @param {string} clientId - The ID of the client.
   * @param {PolicyName} policyName - The name of the policy.
   * @returns {Promise<string>} The ban message.
   */
  public getBanMessage = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<string> => {
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

  /**
   * Validates the input for a specific policy.
   * @param {string} incoming - The incoming data to validate.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} methodName - The name of the method.
   * @param {string} clientId - The ID of the client.
   * @param {PolicyName} policyName - The name of the policy.
   * @returns {Promise<boolean>} The result of the validation.
   */
  public validateInput = async (
    incoming: string,
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<boolean> => {
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

  /**
   * Validates the output for a specific policy.
   * @param {string} outgoing - The outgoing data to validate.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} methodName - The name of the method.
   * @param {string} clientId - The ID of the client.
   * @param {PolicyName} policyName - The name of the policy.
   * @returns {Promise<boolean>} The result of the validation.
   */
  public validateOutput = async (
    outgoing: string,
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<boolean> => {
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

  /**
   * Bans a client from a specific swarm.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} methodName - The name of the method.
   * @param {string} clientId - The ID of the client.
   * @param {PolicyName} policyName - The name of the policy.
   * @returns {Promise<void>}
   */
  public banClient = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<void> => {
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

  /**
   * Unbans a client from a specific swarm.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} methodName - The name of the method.
   * @param {string} clientId - The ID of the client.
   * @param {PolicyName} policyName - The name of the policy.
   * @returns {Promise<void>}
   */
  public unbanClient = async (
    swarmName: SwarmName,
    methodName: string,
    clientId: string,
    policyName: PolicyName
  ): Promise<void> => {
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
