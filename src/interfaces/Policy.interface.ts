import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";
import { SessionId } from "./Session.interface";
import { SwarmName } from "./Swarm.interface";

/**
 * Interface representing callbacks for policy lifecycle and validation events.
 * Provides hooks for initialization, validation, and ban actions.
 */
export interface IPolicyCallbacks {
  /**
   * Optional callback triggered when the policy is initialized.
   * Useful for setup or logging.
   * @param {PolicyName} policyName - The unique name of the policy.
   */
  onInit?: (policyName: PolicyName) => void;

  /**
   * Optional callback triggered to validate incoming messages.
   * Useful for logging or monitoring input validation.
   * @param {string} incoming - The incoming message to validate.
   * @param {SessionId} clientId - The unique session ID of the client sending the message.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {PolicyName} policyName - The unique name of the policy.
   */
  onValidateInput?: (
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;

  /**
   * Optional callback triggered to validate outgoing messages.
   * Useful for logging or monitoring output validation.
   * @param {string} outgoing - The outgoing message to validate.
   * @param {SessionId} clientId - The unique session ID of the client receiving the message.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {PolicyName} policyName - The unique name of the policy.
   */
  onValidateOutput?: (
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;

  /**
   * Optional callback triggered when a client is banned.
   * Useful for logging or triggering ban-related actions.
   * @param {SessionId} clientId - The unique session ID of the banned client.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {PolicyName} policyName - The unique name of the policy.
   */
  onBanClient?: (
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;

  /**
   * Optional callback triggered when a client is unbanned.
   * Useful for logging or triggering unban-related actions.
   * @param {SessionId} clientId - The unique session ID of the unbanned client.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {PolicyName} policyName - The unique name of the policy.
   */
  onUnbanClient?: (
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;
}

/**
 * Interface representing a policy enforcement mechanism.
 * Manages client bans and validates input/output messages within the swarm.
 */
export interface IPolicy {
  /**
   * Checks if a client is currently banned under this policy.
   * @param {SessionId} clientId - The unique session ID of the client to check.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<boolean>} A promise resolving to true if the client is banned, false otherwise.
   * @throws {Error} If the ban status check fails (e.g., due to storage issues).
   */
  hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;

  /**
   * Retrieves the ban message for a banned client.
   * @param {SessionId} clientId - The unique session ID of the banned client.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<string>} A promise resolving to the ban message for the client.
   * @throws {Error} If retrieving the ban message fails (e.g., due to missing configuration).
   */
  getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;

  /**
   * Validates an incoming message against the policy rules.
   * @param {string} incoming - The incoming message to validate.
   * @param {SessionId} clientId - The unique session ID of the client sending the message.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<boolean>} A promise resolving to true if the input is valid, false otherwise.
   * @throws {Error} If validation fails unexpectedly (e.g., due to internal errors).
   */
  validateInput(
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;

  /**
   * Validates an outgoing message against the policy rules.
   * @param {string} outgoing - The outgoing message to validate.
   * @param {SessionId} clientId - The unique session ID of the client receiving the message.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<boolean>} A promise resolving to true if the output is valid, false otherwise.
   * @throws {Error} If validation fails unexpectedly (e.g., due to internal errors).
   */
  validateOutput(
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;

  /**
   * Bans a client under this policy, adding them to the banned list.
   * @param {SessionId} clientId - The unique session ID of the client to ban.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the client is banned.
   * @throws {Error} If banning the client fails (e.g., due to persistence issues).
   */
  banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;

  /**
   * Unbans a client under this policy, removing them from the banned list.
   * @param {SessionId} clientId - The unique session ID of the client to unban.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the client is unbanned.
   * @throws {Error} If unbanning the client fails (e.g., due to persistence issues).
   */
  unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
}

/**
 * Interface representing the schema for configuring a policy.
 * Defines how policies enforce rules and manage bans within the swarm.
 */
export interface IPolicySchema {
  /** Optional flag to enable serialization of banned clients to persistent storage (e.g., hard drive). */
  persist?: boolean;

  /** Optional description for documentation purposes, aiding in policy usage understanding. */
  docDescription?: string;

  /** The unique name of the policy within the swarm. */
  policyName: PolicyName;

  /** Optional default message to display when a client is banned, overridden by getBanMessage if provided. */
  banMessage?: string;

  /** Optional flag to automatically ban a client immediately after failed validation. */
  autoBan?: boolean;

  /**
   * Optional function to retrieve a custom ban message for a client.
   * Overrides the default banMessage if provided.
   * @param {SessionId} clientId - The unique session ID of the banned client.
   * @param {PolicyName} policyName - The unique name of the policy.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<string | null> | string | null} The ban message or null, synchronously or asynchronously.
   */
  getBanMessage?: (
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<string | null> | string | null;

  /**
   * Retrieves the list of currently banned clients under this policy.
   * @param {PolicyName} policyName - The unique name of the policy.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {SessionId[] | Promise<SessionId[]>} An array of banned session IDs, synchronously or asynchronously.
   */
  getBannedClients?: (
    policyName: PolicyName,
    swarmName: SwarmName
  ) => SessionId[] | Promise<SessionId[]>;

  /**
   * Optional function to set the list of banned clients.
   * Overrides default ban list management if provided.
   * @param {SessionId[]} clientIds - An array of session IDs to ban.
   * @param {PolicyName} policyName - The unique name of the policy.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<void> | void} A promise that resolves when the ban list is updated, or void if synchronous.
   * @throws {Error} If updating the ban list fails (e.g., due to persistence issues).
   */
  setBannedClients?: (
    clientIds: SessionId[],
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<void> | void;

  /**
   * Optional function to validate incoming messages against custom policy rules.
   * Overrides default validation if provided.
   * @param {string} incoming - The incoming message to validate.
   * @param {SessionId} clientId - The unique session ID of the client sending the message.
   * @param {PolicyName} policyName - The unique name of the policy.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<boolean> | boolean} True if the input is valid, false otherwise, synchronously or asynchronously.
   */
  validateInput?: (
    incoming: string,
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<boolean> | boolean;

  /**
   * Optional function to validate outgoing messages against custom policy rules.
   * Overrides default validation if provided.
   * @param {string} outgoing - The outgoing message to validate.
   * @param {SessionId} clientId - The unique session ID of the client receiving the message.
   * @param {PolicyName} policyName - The unique name of the policy.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<boolean> | boolean} True if the output is valid, false otherwise, synchronously or asynchronously.
   */
  validateOutput?: (
    outgoing: string,
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<boolean> | boolean;

  /** Optional set of callbacks for policy events, allowing customization of validation and ban actions. */
  callbacks?: IPolicyCallbacks;
}

/**
 * Interface representing the parameters required to initialize a policy.
 * Extends the policy schema with runtime dependencies and full callback support.
 * @extends {IPolicySchema}
 * @extends {IPolicyCallbacks}
 */
export interface IPolicyParams extends IPolicySchema, IPolicyCallbacks {
  /** The logger instance for recording policy-related activity and errors. */
  logger: ILogger;

  /** The bus instance for event communication within the swarm. */
  bus: IBus;
}

/**
 * Type representing the unique name of a policy within the swarm.
 * @typedef {string} PolicyName
 */
export type PolicyName = string;

/**
 * Default export of the IPolicy interface.
 * Represents the primary policy enforcement interface for the module.
 * @type {IPolicy}
 */
export default IPolicy;
