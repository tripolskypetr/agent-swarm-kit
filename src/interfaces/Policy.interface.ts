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
   */
  onInit?: (policyName: PolicyName) => void;

  /**
   * Optional callback triggered to validate incoming messages.
   * Useful for logging or monitoring input validation.
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
   */
  onBanClient?: (
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;

  /**
   * Optional callback triggered when a client is unbanned.
   * Useful for logging or triggering unban-related actions.
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
   * @throws {Error} If the ban status check fails (e.g., due to storage issues).
   */
  hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;

  /**
   * Retrieves the ban message for a banned client.
   * @throws {Error} If retrieving the ban message fails (e.g., due to missing configuration).
   */
  getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;

  /**
   * Validates an incoming message against the policy rules.
   * @throws {Error} If validation fails unexpectedly (e.g., due to internal errors).
   */
  validateInput(
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;

  /**
   * Validates an outgoing message against the policy rules.
   * @throws {Error} If validation fails unexpectedly (e.g., due to internal errors).
   */
  validateOutput(
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;

  /**
   * Bans a client under this policy, adding them to the banned list.
   * @throws {Error} If banning the client fails (e.g., due to persistence issues).
   */
  banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;

  /**
   * Unbans a client under this policy, removing them from the banned list.
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
   */
  getBanMessage?: (
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<string | null> | string | null;

  /**
   * Retrieves the list of currently banned clients under this policy.
   */
  getBannedClients?: (
    policyName: PolicyName,
    swarmName: SwarmName
  ) => SessionId[] | Promise<SessionId[]>;

  /**
   * Optional function to set the list of banned clients.
   * Overrides default ban list management if provided.
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
 * Used to identify and reference specific policy implementations.
 */
export type PolicyName = string;

/**
 * Default export of the IPolicy interface.
 * Represents the primary policy enforcement interface for the module.
 */
export default IPolicy;
