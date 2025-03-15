import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { IPolicy, IPolicyParams } from "../interfaces/Policy.interface";
import { SessionId } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";

const BAN_NEED_FETCH = Symbol("ban-need-fetch");

/**
 * Class representing a client policy for managing bans, input/output validation, and client restrictions.
 * @implements {IPolicy}
 */
export class ClientPolicy implements IPolicy {
  /**
   * Set of banned client IDs or a symbol indicating the ban list needs to be fetched.
   * Initialized as BAN_NEED_FETCH and lazily populated on first use.
   */
  _banSet: Set<SessionId> | typeof BAN_NEED_FETCH = BAN_NEED_FETCH;

  /**
   * Creates an instance of ClientPolicy.
   * Invokes the onInit callback if provided.
   * @param {IPolicyParams} params - The parameters for initializing the policy.
   */
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

  /**
   * Checks if a client is banned for a specific swarm.
   * Lazily fetches the ban list on the first call if not already loaded.
   * @param {SessionId} clientId - The ID of the client to check.
   * @param {SwarmName} swarmName - The name of the swarm to check against.
   * @returns {Promise<boolean>} True if the client is banned, false otherwise.
   */
  async hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientPolicy policyName=${this.params.policyName} hasBan`,
        {
          clientId,
          swarmName,
        }
      );
    if (this._banSet === BAN_NEED_FETCH) {
      this._banSet = new Set(
        await this.params.getBannedClients(this.params.policyName, swarmName)
      );
    }
    return this._banSet.has(clientId);
  }

  /**
   * Retrieves the ban message for a client.
   * Uses a custom getBanMessage function if provided, otherwise falls back to the default ban message.
   * @param {SessionId} clientId - The ID of the client to get the ban message for.
   * @param {SwarmName} swarmName - The name of the swarm to check against.
   * @returns {Promise<string>} The ban message for the client.
   */
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

  /**
   * Validates an incoming message from a client.
   * Checks if the client is banned and applies the custom validation function if provided.
   * Automatically bans the client if validation fails and autoBan is enabled.
   * @param {string} incoming - The incoming message to validate.
   * @param {SessionId} clientId - The ID of the client sending the message.
   * @param {SwarmName} swarmName - The name of the swarm to validate against.
   * @returns {Promise<boolean>} True if the input is valid and the client is not banned, false otherwise.
   */
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
    if (this.params.autoBan) {
      await this.banClient(clientId, swarmName);
    }
    return false;
  }

  /**
   * Validates an outgoing message to a client.
   * Checks if the client is banned and applies the custom validation function if provided.
   * Automatically bans the client if validation fails and autoBan is enabled.
   * @param {string} outgoing - The outgoing message to validate.
   * @param {SessionId} clientId - The ID of the client receiving the message.
   * @param {SwarmName} swarmName - The name of the swarm to validate against.
   * @returns {Promise<boolean>} True if the output is valid and the client is not banned, false otherwise.
   */
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
    if (this.params.autoBan) {
      await this.banClient(clientId, swarmName);
    }
    return false;
  }

  /**
   * Bans a client, adding them to the ban set and persisting the change if setBannedClients is provided.
   * Emits a ban event and invokes the onBanClient callback if defined.
   * @param {SessionId} clientId - The ID of the client to ban.
   * @param {SwarmName} swarmName - The name of the swarm to ban the client from.
   * @returns {Promise<void>}
   */
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

  /**
   * Unbans a client, removing them from the ban set and persisting the change if setBannedClients is provided.
   * Emits an unban event and invokes the onUnbanClient callback if defined.
   * @param {SessionId} clientId - The ID of the client to unban.
   * @param {SwarmName} swarmName - The name of the swarm to unban the client from.
   * @returns {Promise<void>}
   */
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
