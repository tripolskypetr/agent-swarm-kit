import { queued } from "functools-kit";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { IPolicy, IPolicyParams } from "../interfaces/Policy.interface";
import { SessionId } from "../interfaces/Session.interface";
import { SwarmName } from "../interfaces/Swarm.interface";

/**
 * Class representing a client policy in the swarm system, implementing the IPolicy interface.
 * Manages client bans, input/output validation, and restrictions, with lazy-loaded ban lists and event emission via BusService.
 * Integrates with PolicyConnectionService (policy instantiation), SwarmConnectionService (swarm-level restrictions via SwarmSchemaService’s policies),
 * ClientAgent (message validation), and BusService (event emission).
 * Supports auto-banning on validation failure and customizable ban messages, ensuring swarm security and compliance.
*/
export class ClientPolicy implements IPolicy {
  /**
   * Ban sets keyed by swarm name, lazily populated via params.getBannedClients.
   * A ClientPolicy instance is memoized per policyName and shared by every swarm
   * that lists the policy, while bans are persisted per (policy, swarm) — a
   * single shared set would leak bans of one swarm into another and persist
   * the mixed set into the wrong store.
   */
  _banSetBySwarm = new Map<SwarmName, Set<SessionId>>();

  /**
   * Returns the ban set of the given swarm, fetching it on first access.
   * Re-checks the map after the await: a ban committed through _banQueue while
   * the fetch was in flight must not be overwritten by the stale fetch result.
   */
  private async _getBanSet(swarmName: SwarmName): Promise<Set<SessionId>> {
    const existing = this._banSetBySwarm.get(swarmName);
    if (existing) {
      return existing;
    }
    const fetched = new Set(
      await this.params.getBannedClients(this.params.policyName, swarmName)
    );
    if (!this._banSetBySwarm.has(swarmName)) {
      this._banSetBySwarm.set(swarmName, fetched);
    }
    return this._banSetBySwarm.get(swarmName)!;
  }

  /**
   * Serializes the read-modify-write of _banSet shared by banClient/unbanClient.
   * Without it two concurrent bans of different clients both read the same ban
   * set, each adds only its own client, and the later setBannedClients overwrites
   * the earlier one — one ban is silently lost in memory and in the persisted
   * store. queued() runs the mutations one at a time so each observes the result
   * of the previous one.
   *
   * The wrapped function must never reject: queued() chains every call on the
   * previous promise, so a rejection inside the queue (e.g. a throwing
   * setBannedClients adapter) would reject every already-queued ban/unban with
   * this foreign error WITHOUT running it — a concurrent ban of another client
   * would be silently lost. Errors are boxed here and rethrown by the caller
   * outside the queue.
   */
  private _banQueue = queued(async (fn: () => Promise<void>) => {
    try {
      await fn();
      return null;
    } catch (error) {
      return { error };
    }
  }) as (fn: () => Promise<void>) => Promise<null | { error: unknown }>;

  /**
   * Runs a ban-set mutation through _banQueue, rethrowing its boxed error
   * outside the queue so only the failing caller observes it.
   */
  private async _runBanQueue(fn: () => Promise<void>): Promise<void> {
    const result = await this._banQueue(fn);
    if (result) {
      throw result.error;
    }
  }

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
    const banSet = await this._getBanSet(swarmName);
    return banSet.has(clientId);
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
    const banSet = await this._getBanSet(swarmName);
    if (banSet.has(clientId)) {
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
    const banSet = await this._getBanSet(swarmName);
    if (banSet.has(clientId)) {
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
    await this._runBanQueue(async () => {
      const banSet = await this._getBanSet(swarmName);
      if (banSet.has(clientId)) {
        // Already banned: skip the mutation AND the notifications, matching
        // the documented "skips if already banned" contract — otherwise every
        // redundant ban re-fires onBanClient and the bus event.
        return;
      }
      this._banSetBySwarm.set(swarmName, new Set(banSet).add(clientId));
      if (this.params.setBannedClients) {
        await this.params.setBannedClients(
          [...this._banSetBySwarm.get(swarmName)!],
          this.params.policyName,
          swarmName
        );
      }
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
    });
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
    await this._runBanQueue(async () => {
      const banSet = await this._getBanSet(swarmName);
      if (!banSet.has(clientId)) {
        // Not banned: skip the mutation and the notifications, matching the
        // documented "skips if not banned" contract.
        return;
      }
      {
        const nextBanSet = new Set(banSet);
        nextBanSet.delete(clientId);
        this._banSetBySwarm.set(swarmName, nextBanSet);
      }
      if (this.params.setBannedClients) {
        await this.params.setBannedClients(
          [...this._banSetBySwarm.get(swarmName)!],
          this.params.policyName,
          swarmName
        );
      }
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
    });
  }
}

/**
 * Default export of the ClientPolicy class.
 * Provides the primary implementation of the IPolicy interface for managing client policies in the swarm system,
 * integrating with PolicyConnectionService, SwarmConnectionService, ClientAgent, and BusService,
 * with lazy-loaded ban lists, validation, and event-driven ban management.
*/
export default ClientPolicy;
