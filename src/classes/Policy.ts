import { not } from "functools-kit";
import { GLOBAL_CONFIG } from "src/config/params";
import IPolicy, { PolicyName } from "src/interfaces/Policy.interface";
import { SessionId } from "src/interfaces/Session.interface";
import { SwarmName } from "src/interfaces/Swarm.interface";
import swarm from "src/lib";

const METHOD_NAME_BAN_CLIENT = "PolicyUtils.banClient";
const METHOD_NAME_UNBAN_CLIENT = "PolicyUtils.unbanClient";

export class NoopPolicy implements IPolicy {
  constructor(readonly swarmName: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopPolicy CTOR swarmName=${swarmName}`);
  }
  getBanMessage() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy getBanMessage swarmName=${this.swarmName}`
      );
    return Promise.resolve(GLOBAL_CONFIG.CC_BANHAMMER_PLACEHOLDER);
  }
  validateInput() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy validateInput swarmName=${this.swarmName}`
      );
    return Promise.resolve(true);
  }
  validateOutput() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy validateOutput swarmName=${this.swarmName}`
      );
    return Promise.resolve(true);
  }
  banClient() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy banClient swarmName=${this.swarmName}`
      );
    return Promise.resolve();
  }
  unbanClient() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopPolicy unbanClient swarmName=${this.swarmName}`
      );
    return Promise.resolve();
  }
}

export class MergePolicy implements IPolicy {
  private _targetPolicy: IPolicy | null = null;

  constructor(
    private readonly policies: IPolicy[],
    private readonly swarmName: SwarmName
  ) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`MergePolicy CTOR swarmName=${swarmName}`, {
        policies,
      });
  }

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
export class PolicyUtils {
  public banClient = async (payload: {
    clientId: string;
    swarmName: SwarmName;
    policyName: PolicyName;
  }) => {
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

  public unbanClient = async (payload: {
    clientId: string;
    swarmName: SwarmName;
    policyName: PolicyName;
  }) => {
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

export const Policy = new PolicyUtils();

export default Policy;
