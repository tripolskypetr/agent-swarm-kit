import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { IPolicy, IPolicyParams } from "../interfaces/Policy.interface";
import { SessionId } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";

const BAN_NEED_FETCH = Symbol("ban-need-fetch");

/**
 * Class representing a client policy in the swarm system, implementing the IPolicy interface.
 * Manages client bans, input/output validation, and restrictions, with lazy-loaded ban lists and event emission via BusService.
 * Integrates with PolicyConnectionService (policy instantiation), SwarmConnectionService (swarm-level restrictions via SwarmSchemaService’s policies),
 * ClientAgent (message validation), and BusService (event emission).
 * Supports auto-banning on validation failure and customizable ban messages, ensuring swarm security and compliance.
*/
export class ClientPolicy implements IPolicy {
  /**
   * Set of banned client IDs or a symbol indicating the ban list needs to be fetched.
   * Initialized as BAN_NEED_FETCH, lazily populated via params.getBannedClients on first use in hasBan, validateInput, etc.
   * Updated by banClient and unbanClient, persisted if params.setBannedClients is provided.
   */
  _banSet: Set<SessionId> | typeof BAN_NEED_FETCH = BAN_NEED_FETCH;

  /**
   * Constructs a ClientPolicy instance with the provided parameters.
   * Invokes the onInit callback if defined and logs construction if debugging is enabled.
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
   * Checks if a client is banned for a specific swarm, lazily fetching the ban list if not already loaded.
   * Used by SwarmConnectionService to enforce swarm-level restrictions defined in SwarmSchemaService’s policies.
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
   * Retrieves the ban message for a client, using a custom getBanMessage function if provided or falling back to params.banMessage.
   * Supports ClientAgent by providing ban feedback when validation fails, enhancing user experience.
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
   * Validates an incoming message from a client, checking ban status and applying custom validation if provided.
   * Auto-bans the client via banClient if validation fails and params.autoBan is true, emitting events via BusService.
   * Used by ClientAgent to filter incoming messages before processing, ensuring policy compliance.
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
   * Validates an outgoing message to a client, checking ban status and applying custom validation if provided.
   * Auto-bans the client via banClient if validation fails and params.autoBan is true, emitting events via BusService.
   * Used by ClientAgent to ensure outgoing messages comply with swarm policies before emission.
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
   * Bans a client, adding them to the ban set and persisting the change if params.setBannedClients is provided.
   * Emits a ban event via BusService and invokes the onBanClient callback, supporting SwarmConnectionService’s access control.
   * Skips if the client is already banned to avoid redundant updates.
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
   * Unbans a client, removing them from the ban set and persisting the change if params.setBannedClients is provided.
   * Emits an unban event via BusService and invokes the onUnbanClient callback, supporting dynamic policy adjustments.
   * Skips if the client is not banned to avoid redundant updates.
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

/**
 * Default export of the ClientPolicy class.
 * Provides the primary implementation of the IPolicy interface for managing client policies in the swarm system,
 * integrating with PolicyConnectionService, SwarmConnectionService, ClientAgent, and BusService,
 * with lazy-loaded ban lists, validation, and event-driven ban management.
*/
export default ClientPolicy;
