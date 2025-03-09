import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import IPolicy, { PolicyName } from "../../../interfaces/Policy.interface";
import { IModelMessage } from "../../../model/ModelMessage.model";
import { memoize } from "functools-kit";
import ClientPolicy from "../../../client/ClientPolicy";
import { TMethodContextService } from "../context/MethodContextService";
import SessionValidationService from "../validation/SessionValidationService";
import { GLOBAL_CONFIG } from "../../../config/params";
import BusService from "../base/BusService";
import PolicySchemaService from "../schema/PolicySchemaService";
import { SessionId } from "src/interfaces/Session.interface";
import { SwarmName } from "src/interfaces/Swarm.interface";

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
