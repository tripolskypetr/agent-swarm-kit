import { not } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import IPolicy, { PolicyName } from "../interfaces/Policy.interface";
import { SessionId } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";

const METHOD_NAME_BAN_CLIENT = "PolicyUtils.banClient";
const METHOD_NAME_UNBAN_CLIENT = "PolicyUtils.unbanClient";

/**
 * NoopPolicy class implements the IPolicy interface with no-op methods.
 */
export class NoopPolicy implements IPolicy {
  /**
   * Constructs a NoopPolicy instance.
   * @param {string} swarmName - The name of the swarm.
   */
  constructor(readonly swarmName: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopPolicy CTOR swarmName=${swarmName}`);
  }

  /**
   * Gets the ban message.
   * @returns {Promise<string>} The ban message.
   */
  getBanMessage(): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy getBanMessage swarmName=${this.swarmName}`
      );
    return Promise.resolve(GLOBAL_CONFIG.CC_BANHAMMER_PLACEHOLDER);
  }

  /**
   * Validates the input.
   * @returns {Promise<boolean>} True if the input is valid, otherwise false.
   */
  validateInput(): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy validateInput swarmName=${this.swarmName}`
      );
    return Promise.resolve(true);
  }

  /**
   * Validates the output.
   * @returns {Promise<boolean>} True if the output is valid, otherwise false.
   */
  validateOutput(): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy validateOutput swarmName=${this.swarmName}`
      );
    return Promise.resolve(true);
  }

  /**
   * Bans a client.
   * @returns {Promise<void>}
   */
  banClient(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy banClient swarmName=${this.swarmName}`
      );
    return Promise.resolve();
  }

  /**
   * Unbans a client.
   * @returns {Promise<void>}
   */
  unbanClient(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy unbanClient swarmName=${this.swarmName}`
      );
    return Promise.resolve();
  }
}

/**
 * MergePolicy class implements the IPolicy interface and merges multiple policies.
 */
export class MergePolicy implements IPolicy {
  private _targetPolicy: IPolicy | null = null;

  /**
   * Constructs a MergePolicy instance.
   * @param {IPolicy[]} policies - The policies to merge.
   * @param {SwarmName} swarmName - The name of the swarm.
   */
  constructor(
    private readonly policies: IPolicy[],
    private readonly swarmName: SwarmName
  ) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`MergePolicy CTOR swarmName=${swarmName}`, {
        policies,
      });
  }

  /**
   * Gets the ban message.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<string>} The ban message.
   */
  async getBanMessage(
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergePolicy getBanMessage swarmName=${swarmName}`,
        {
          clientId,
        }
      );
    if (this._targetPolicy) {
      const policy = this._targetPolicy;
      this._targetPolicy = null;
      return await policy.getBanMessage(clientId, swarmName);
    }
    return GLOBAL_CONFIG.CC_BANHAMMER_PLACEHOLDER;
  }

  /**
   * Validates the input.
   * @param {string} incoming - The incoming data.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<boolean>} True if the input is valid, otherwise false.
   */
  async validateInput(
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergePolicy validateInput swarmName=${swarmName}`,
        {
          clientId,
        }
      );
    for (const policy of this.policies) {
      if (await not(policy.validateInput(incoming, clientId, swarmName))) {
        this._targetPolicy = policy;
        return false;
      }
    }
    this._targetPolicy = null;
    return true;
  }

  /**
   * Validates the output.
   * @param {string} outgoing - The outgoing data.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<boolean>} True if the output is valid, otherwise false.
   */
  async validateOutput(
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergePolicy validateOutput swarmName=${swarmName}`,
        {
          clientId,
        }
      );
    for (const policy of this.policies) {
      if (await not(policy.validateOutput(outgoing, clientId, swarmName))) {
        this._targetPolicy = policy;
        return false;
      }
    }
    this._targetPolicy = null;
    return true;
  }

  /**
   * Bans a client.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>}
   */
  async banClient(clientId: SessionId, swarmName: SwarmName): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergePolicy banClient swarmName=${swarmName}`,
        {
          clientId,
        }
      );
    if (this._targetPolicy) {
      await this._targetPolicy.banClient(clientId, swarmName);
      return;
    }
    const [policy = null] = this.policies;
    if (policy) {
      await policy.banClient(clientId, swarmName);
    }
  }

  /**
   * Unbans a client.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>}
   */
  async unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergePolicy unbanClient swarmName=${swarmName}`,
        {
          clientId,
        }
      );
    if (this._targetPolicy) {
      await this._targetPolicy.unbanClient(clientId, swarmName);
      return;
    }
    const [policy = null] = this.policies;
    if (policy) {
      await policy.unbanClient(clientId, swarmName);
    }
  }
}

/**
 * PolicyUtils class provides utility methods for banning and unbanning clients.
 */
export class PolicyUtils {
  /**
   * Bans a client.
   * @param {Object} payload - The payload containing clientId, swarmName, and policyName.
   * @param {string} payload.clientId - The client ID.
   * @param {SwarmName} payload.swarmName - The name of the swarm.
   * @param {PolicyName} payload.policyName - The name of the policy.
   * @returns {Promise<void>}
   */
  public banClient = async (payload: {
    clientId: string;
    swarmName: SwarmName;
    policyName: PolicyName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_BAN_CLIENT, payload);
    swarm.sessionValidationService.validate(
      payload.clientId,
      METHOD_NAME_BAN_CLIENT
    );
    swarm.swarmValidationService.validate(
      payload.swarmName,
      METHOD_NAME_BAN_CLIENT
    );
    swarm.policyValidationService.validate(
      payload.policyName,
      METHOD_NAME_BAN_CLIENT
    );
    return await swarm.policyPublicService.banClient(
      payload.swarmName,
      METHOD_NAME_BAN_CLIENT,
      payload.clientId,
      payload.policyName
    );
  };

  /**
   * Unbans a client.
   * @param {Object} payload - The payload containing clientId, swarmName, and policyName.
   * @param {string} payload.clientId - The client ID.
   * @param {SwarmName} payload.swarmName - The name of the swarm.
   * @param {PolicyName} payload.policyName - The name of the policy.
   * @returns {Promise<void>}
   */
  public unbanClient = async (payload: {
    clientId: string;
    swarmName: SwarmName;
    policyName: PolicyName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_UNBAN_CLIENT, payload);
    swarm.sessionValidationService.validate(
      payload.clientId,
      METHOD_NAME_UNBAN_CLIENT
    );
    swarm.swarmValidationService.validate(
      payload.swarmName,
      METHOD_NAME_UNBAN_CLIENT
    );
    swarm.policyValidationService.validate(
      payload.policyName,
      METHOD_NAME_UNBAN_CLIENT
    );
    return await swarm.policyPublicService.unbanClient(
      payload.swarmName,
      METHOD_NAME_UNBAN_CLIENT,
      payload.clientId,
      payload.policyName
    );
  };
}

/**
 * An instance of PolicyUtils.
 * @type {PolicyUtils}
 */
export const Policy = new PolicyUtils();

export default Policy;
