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
   */
  constructor(readonly swarmName: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopPolicy CTOR swarmName=${swarmName}`);
  }

  /**
   * Checks if a client is banned. Always returns false as this is a no-op policy.
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
 */
export const Policy = new PolicyUtils();

export default Policy;
