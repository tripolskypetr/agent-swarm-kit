import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import IPolicy, { PolicyName } from "../../../interfaces/Policy.interface";
import { memoize } from "functools-kit";
import ClientPolicy from "../../../client/ClientPolicy";
import { TMethodContextService } from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import BusService from "../base/BusService";
import PolicySchemaService from "../schema/PolicySchemaService";
import { SessionId } from "../../../interfaces/Session.interface";
import { SwarmName } from "../../../interfaces/Swarm.interface";

/**
 * Service for managing policy connections.
 * @implements {IPolicy}
 */
export class PolicyConnectionService implements IPolicy {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );
  private readonly policySchemaService = inject<PolicySchemaService>(
    TYPES.policySchemaService
  );

  /**
   * Retrieves a policy based on the policy name.
   * @param {PolicyName} policyName - The name of the policy.
   * @returns {ClientPolicy} The client policy.
   */
  public getPolicy = memoize(
    ([policyName]) => `${policyName}`,
    (policyName: PolicyName) => {
      const schema = this.policySchemaService.get(policyName);
      return new ClientPolicy({
        policyName,
        bus: this.busService,
        logger: this.loggerService,
        ...schema,
      });
    }
  );

  /**
   * Retrieves the ban message for a client in a swarm.
   * @param {SessionId} clientId - The ID of the client.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<string>} The ban message.
   */
  public getBanMessage = async (
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<string> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService getBanMessage`, {
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).getBanMessage(clientId, swarmName);
  };

  /**
   * Validates the input for a client in a swarm.
   * @param {string} incoming - The incoming input.
   * @param {SessionId} clientId - The ID of the client.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<boolean>} Whether the input is valid.
   */
  public validateInput = async (
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService validateInput`, {
        incoming,
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).validateInput(incoming, clientId, swarmName);
  };

  /**
   * Validates the output for a client in a swarm.
   * @param {string} outgoing - The outgoing output.
   * @param {SessionId} clientId - The ID of the client.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<boolean>} Whether the output is valid.
   */
  public validateOutput = async (
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService validateOutput`, {
        outgoing,
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).validateOutput(outgoing, clientId, swarmName);
  };

  /**
   * Bans a client from a swarm.
   * @param {SessionId} clientId - The ID of the client.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>}
   */
  public banClient = async (
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService banClient`, {
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).banClient(clientId, swarmName);
  };

  /**
   * Unbans a client from a swarm.
   * @param {SessionId} clientId - The ID of the client.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>}
   */
  public unbanClient = async (
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`policyConnectionService unbanClient`, {
        clientId,
        swarmName,
      });
    return await this.getPolicy(
      this.methodContextService.context.policyName
    ).unbanClient(clientId, swarmName);
  };
}

export default PolicyConnectionService;
