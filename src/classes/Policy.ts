import { not } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import IPolicy, { PolicyName } from "../interfaces/Policy.interface";
import { SessionId } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";
import swarm from "../lib";
import beginContext from "../utils/beginContext";

/** @private Constant for logging the banClient method in PolicyUtils */
const METHOD_NAME_BAN_CLIENT = "PolicyUtils.banClient";

/** @private Constant for logging the unbanClient method in PolicyUtils */
const METHOD_NAME_UNBAN_CLIENT = "PolicyUtils.unbanClient";

/** @private Constant for logging the hasBan method in PolicyUtils */
const METHOD_NAME_HAS_BAN = "PolicyUtils.hasBan";

/**
 * A no-op implementation of the IPolicy interface, performing no actual policy enforcement.
 * All methods return default or resolved values without side effects.
 * @implements {IPolicy}
 */
export class NoopPolicy implements IPolicy {
  /**
   * Creates a new NoopPolicy instance.
   * @param {string} swarmName - The name of the swarm this policy applies to.
   */
  constructor(readonly swarmName: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopPolicy CTOR swarmName=${swarmName}`);
  }

  /**
   * Checks if a client is banned. Always returns false as this is a no-op policy.
   * @param {SessionId} [_clientId] - The client ID (unused in this implementation).
   * @param {SwarmName} [_swarmName] - The swarm name (unused in this implementation).
   * @returns {Promise<boolean>} A promise resolving to false, indicating no ban.
   */
  public hasBan(_clientId?: SessionId, _swarmName?: SwarmName): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy hasBan swarmName=${this.swarmName}`
      );
    return Promise.resolve(false);
  }

  /**
   * Retrieves the ban message. Returns a placeholder as no bans are enforced.
   * @param {SessionId} [_clientId] - The client ID (unused in this implementation).
   * @param {SwarmName} [_swarmName] - The swarm name (unused in this implementation).
   * @returns {Promise<string>} A promise resolving to the configured ban placeholder message.
   */
  public getBanMessage(_clientId?: SessionId, _swarmName?: SwarmName): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy getBanMessage swarmName=${this.swarmName}`
      );
    return Promise.resolve(GLOBAL_CONFIG.CC_BANHAMMER_PLACEHOLDER);
  }

  /**
   * Validates incoming data. Always returns true as this is a no-op policy.
   * @param {string} [_incoming] - The incoming data (unused in this implementation).
   * @param {SessionId} [_clientId] - The client ID (unused in this implementation).
   * @param {SwarmName} [_swarmName] - The swarm name (unused in this implementation).
   * @returns {Promise<boolean>} A promise resolving to true, indicating valid input.
   */
  public validateInput(
    _incoming?: string,
    _clientId?: SessionId,
    _swarmName?: SwarmName
  ): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy validateInput swarmName=${this.swarmName}`
      );
    return Promise.resolve(true);
  }

  /**
   * Validates outgoing data. Always returns true as this is a no-op policy.
   * @param {string} [_outgoing] - The outgoing data (unused in this implementation).
   * @param {SessionId} [_clientId] - The client ID (unused in this implementation).
   * @param {SwarmName} [_swarmName] - The swarm name (unused in this implementation).
   * @returns {Promise<boolean>} A promise resolving to true, indicating valid output.
   */
  public validateOutput(
    _outgoing?: string,
    _clientId?: SessionId,
    _swarmName?: SwarmName
  ): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy validateOutput swarmName=${this.swarmName}`
      );
    return Promise.resolve(true);
  }

  /**
   * Bans a client. No-op implementation, does nothing.
   * @param {SessionId} [_clientId] - The client ID (unused in this implementation).
   * @param {SwarmName} [_swarmName] - The swarm name (unused in this implementation).
   * @returns {Promise<void>} A promise that resolves immediately with no effect.
   */
  public banClient(_clientId?: SessionId, _swarmName?: SwarmName): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy banClient swarmName=${this.swarmName}`
      );
    return Promise.resolve();
  }

  /**
   * Unbans a client. No-op implementation, does nothing.
   * @param {SessionId} [_clientId] - The client ID (unused in this implementation).
   * @param {SwarmName} [_swarmName] - The swarm name (unused in this implementation).
   * @returns {Promise<void>} A promise that resolves immediately with no effect.
   */
  public unbanClient(_clientId?: SessionId, _swarmName?: SwarmName): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy unbanClient swarmName=${this.swarmName}`
      );
    return Promise.resolve();
  }
}

/**
 * Merges multiple policies into a single policy, enforcing the first failing policy's rules.
 * If any policy bans a client or fails validation, that policy's behavior takes precedence.
 * @implements {IPolicy}
 */
export class MergePolicy implements IPolicy {
  /** @private Tracks the policy that triggered a ban or validation failure */
  private _targetPolicy: IPolicy | null = null;

  /**
   * Creates a new MergePolicy instance combining multiple policies.
   * @param {IPolicy[]} policies - An array of policies to merge.
   * @param {SwarmName} swarmName - The name of the swarm this policy applies to.
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
   * Checks if a client is banned by any of the merged policies.
   * Returns true if any policy reports a ban.
   * @param {SessionId} clientId - The client ID to check.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<boolean>} A promise resolving to true if the client is banned, false otherwise.
   */
  public async hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`MergePolicy hasBan swarmName=${swarmName}`, {
        clientId,
      });
    for (const policy of this.policies) {
      if (await policy.hasBan(clientId, swarmName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Retrieves the ban message from the most recently triggered policy, or a default if none.
   * Clears the target policy after retrieval.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<string>} A promise resolving to the ban message.
   */
  public async getBanMessage(
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
   * Validates incoming data against all merged policies.
   * Fails if any policy rejects the input, storing the failing policy as the target.
   * @param {string} incoming - The incoming data to validate.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<boolean>} A promise resolving to true if all policies pass, false if any fail.
   */
  public async validateInput(
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
   * Validates outgoing data against all merged policies.
   * Fails if any policy rejects the output, storing the failing policy as the target.
   * @param {string} outgoing - The outgoing data to validate.
   * @param {SessionId} clientId - The client ID.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<boolean>} A promise resolving to true if all policies pass, false if any fail.
   */
  public async validateOutput(
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
   * Bans a client using the most recently triggered policy, or the first policy if none triggered.
   * @param {SessionId} clientId - The client ID to ban.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the ban is applied.
   */
  public async banClient(clientId: SessionId, swarmName: SwarmName): Promise<void> {
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
   * Unbans a client using the most recently triggered policy, or the first policy if none triggered.
   * @param {SessionId} clientId - The client ID to unban.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the unban is applied.
   */
  public async unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void> {
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
 * Utility class providing methods to manage client bans within a swarm policy context.
 * All methods validate inputs and execute within a context for logging and tracking.
 */
export class PolicyUtils {
  /**
   * Bans a client under a specific policy within a swarm.
   * Validates the client, swarm, and policy before delegating to the policy service.
   * @param {Object} payload - The payload containing ban details.
   * @param {string} payload.clientId - The client ID to ban.
   * @param {SwarmName} payload.swarmName - The name of the swarm.
   * @param {PolicyName} payload.policyName - The name of the policy to enforce the ban.
   * @returns {Promise<void>} A promise that resolves when the ban is applied.
   * @throws {Error} If validation fails or the policy service encounters an error.
   */
  public banClient = beginContext(
    async (payload: {
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
    }
  );

  /**
   * Unbans a client under a specific policy within a swarm.
   * Validates the client, swarm, and policy before delegating to the policy service.
   * @param {Object} payload - The payload containing unban details.
   * @param {string} payload.clientId - The client ID to unban.
   * @param {SwarmName} payload.swarmName - The name of the swarm.
   * @param {PolicyName} payload.policyName - The name of the policy to lift the ban from.
   * @returns {Promise<void>} A promise that resolves when the unban is applied.
   * @throws {Error} If validation fails or the policy service encounters an error.
   */
  public unbanClient = beginContext(
    async (payload: {
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
    }
  );

  /**
   * Checks if a client is banned under a specific policy within a swarm.
   * Validates the client, swarm, and policy before querying the policy service.
   * @param {Object} payload - The payload containing ban check details.
   * @param {string} payload.clientId - The client ID to check.
   * @param {SwarmName} payload.swarmName - The name of the swarm.
   * @param {PolicyName} payload.policyName - The name of the policy to check against.
   * @returns {Promise<boolean>} A promise resolving to true if the client is banned, false otherwise.
   * @throws {Error} If validation fails or the policy service encounters an error.
   */
  public hasBan = beginContext(
    async (payload: {
      clientId: string;
      swarmName: SwarmName;
      policyName: PolicyName;
    }): Promise<boolean> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_HAS_BAN, payload);
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_HAS_BAN
      );
      swarm.swarmValidationService.validate(
        payload.swarmName,
        METHOD_NAME_HAS_BAN
      );
      swarm.policyValidationService.validate(
        payload.policyName,
        METHOD_NAME_HAS_BAN
      );
      return await swarm.policyPublicService.hasBan(
        payload.swarmName,
        METHOD_NAME_HAS_BAN,
        payload.clientId,
        payload.policyName
      );
    }
  );
}

/**
 * Singleton instance of PolicyUtils for managing client bans and policy enforcement.
 * @type {PolicyUtils}
 */
export const Policy = new PolicyUtils();

export default Policy;
