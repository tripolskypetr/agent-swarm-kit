import { IBusEvent } from "src/model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { IPolicy, IPolicyParams } from "../interfaces/Policy.interface";
import { SessionId } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";

const BAN_NEED_FETCH = Symbol("ban-need-fetch");

export class ClientPolicy implements IPolicy {
  _banSet: Set<SessionId> | typeof BAN_NEED_FETCH = BAN_NEED_FETCH;

  constructor(readonly params: IPolicyParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientPolicy policyName=${this.params.policyName} CTOR`,
        {
          params,
        }
      );
    if (this.params.callbacks?.onInit) {
      this.params.callbacks.onInit(params.policyName);
    }
  }

  async getBanMessage(
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientPolicy policyName=${this.params.policyName} getBanMessage`,
        {
          clientId,
          swarmName,
        }
      );
    if (!this.params.getBanMessage) {
      return this.params.banMessage;
    }
    let banMessage: string | null = null;
    if (
      (banMessage = await this.params.getBanMessage(
        clientId,
        this.params.policyName,
        swarmName
      ))
    ) {
      return banMessage;
    }
    return this.params.banMessage;
  }

  async validateInput(
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientPolicy policyName=${this.params.policyName} validateInput`,
        {
          incoming,
          clientId,
          swarmName,
        }
      );
    if (this.params.callbacks?.onValidateInput) {
      this.params.callbacks.onValidateInput(
        incoming,
        clientId,
        swarmName,
        this.params.policyName
      );
    }
    await this.params.bus.emit<IBusEvent>(clientId, {
      type: "validate-input",
      source: "policy-bus",
      input: {
        incoming,
      },
      output: {},
      context: {
        policyName: this.params.policyName,
        swarmName,
      },
      clientId,
    });
    if (this._banSet === BAN_NEED_FETCH) {
      this._banSet = new Set(
        await this.params.getBannedClients(this.params.policyName, swarmName)
      );
    }
    if (this._banSet.has(clientId)) {
      return false;
    }
    if (!this.params.validateInput) {
      return true;
    }
    if (
      await this.params.validateInput(
        incoming,
        clientId,
        this.params.policyName,
        swarmName
      )
    ) {
      return true;
    }
    await this.banClient(clientId, swarmName);
    return false;
  }

  async validateOutput(
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientPolicy policyName=${this.params.policyName} validateOutput`,
        {
          clientId,
          swarmName,
          outgoing,
        }
      );
    if (this.params.callbacks?.onValidateOutput) {
      this.params.callbacks.onValidateOutput(
        outgoing,
        clientId,
        swarmName,
        this.params.policyName
      );
    }
    await this.params.bus.emit<IBusEvent>(clientId, {
      type: "validate-output",
      source: "policy-bus",
      input: {
        outgoing,
      },
      output: {},
      context: {
        policyName: this.params.policyName,
        swarmName,
      },
      clientId,
    });
    if (this._banSet === BAN_NEED_FETCH) {
      this._banSet = new Set(
        await this.params.getBannedClients(this.params.policyName, swarmName)
      );
    }
    if (this._banSet.has(clientId)) {
      return false;
    }
    if (!this.params.validateOutput) {
      return true;
    }
    if (
      await this.params.validateOutput(
        outgoing,
        clientId,
        this.params.policyName,
        swarmName
      )
    ) {
      return true;
    }
    await this.banClient(clientId, swarmName);
    return false;
  }

  async banClient(clientId: SessionId, swarmName: SwarmName): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientPolicy policyName=${this.params.policyName} banClient`,
        {
          clientId,
          swarmName,
        }
      );
    if (this.params.callbacks?.onBanClient) {
      this.params.callbacks.onBanClient(
        clientId,
        swarmName,
        this.params.policyName
      );
    }
    await this.params.bus.emit<IBusEvent>(clientId, {
      type: "ban-client",
      source: "policy-bus",
      input: {},
      output: {},
      context: {
        policyName: this.params.policyName,
        swarmName,
      },
      clientId,
    });
    if (this._banSet === BAN_NEED_FETCH) {
      this._banSet = new Set(
        await this.params.getBannedClients(this.params.policyName, swarmName)
      );
    }
    if (this._banSet.has(clientId)) {
      return;
    }
    this._banSet = new Set(this._banSet).add(clientId);
    if (this.params.setBannedClients) {
      await this.params.setBannedClients(
        [...this._banSet],
        this.params.policyName,
        swarmName
      );
    }
  }

  async unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientPolicy policyName=${this.params.policyName} unbanClient`,
        {
          clientId,
          swarmName,
        }
      );
    if (this.params.callbacks?.onUnbanClient) {
      this.params.callbacks.onUnbanClient(
        clientId,
        swarmName,
        this.params.policyName
      );
    }
    await this.params.bus.emit<IBusEvent>(clientId, {
      type: "unban-client",
      source: "policy-bus",
      input: {},
      output: {},
      context: {
        policyName: this.params.policyName,
        swarmName,
      },
      clientId,
    });
    if (this._banSet === BAN_NEED_FETCH) {
      this._banSet = new Set(
        await this.params.getBannedClients(this.params.policyName, swarmName)
      );
    }
    if (!this._banSet.has(clientId)) {
      return;
    }
    {
      const banSet = new Set(this._banSet);
      banSet.delete(clientId);
      this._banSet = banSet;
    }
    if (this.params.setBannedClients) {
      await this.params.setBannedClients(
        [...this._banSet],
        this.params.policyName,
        swarmName
      );
    }
  }
}

export default ClientPolicy;
