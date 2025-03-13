import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";
import { SessionId } from "./Session.interface";
import { SwarmName } from "./Swarm.interface";

/**
 * Interface for policy callbacks.
 */
export interface IPolicyCallbacks {
  /**
   * Called when the policy is initialized.
   * @param policyName - The name of the policy.
   */
  onInit?: (policyName: PolicyName) => void;

  /**
   * Called to validate the input.
   * @param incoming - The incoming message.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @param policyName - The name of the policy.
   */
  onValidateInput?: (
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;

  /**
   * Called to validate the output.
   * @param outgoing - The outgoing message.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @param policyName - The name of the policy.
   */
  onValidateOutput?: (
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;

  /**
   * Called when a client is banned.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @param policyName - The name of the policy.
   */
  onBanClient?: (
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;

  /**
   * Called when a client is unbanned.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @param policyName - The name of the policy.
   */
  onUnbanClient?: (
    clientId: SessionId,
    swarmName: SwarmName,
    policyName: PolicyName
  ) => void;
}

/**
 * Interface for a policy.
 */
export interface IPolicy {

  /**
   * Check if got banhammer flag
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   */
  hasBan(clientId: SessionId, swarmName: SwarmName): Promise<boolean>;

  /**
   * Gets the ban message for a client.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves to the ban message.
   */
  getBanMessage(clientId: SessionId, swarmName: SwarmName): Promise<string>;

  /**
   * Validates the input.
   * @param incoming - The incoming message.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves to a boolean indicating whether the input is valid.
   */
  validateInput(
    incoming: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;

  /**
   * Validates the output.
   * @param outgoing - The outgoing message.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves to a boolean indicating whether the output is valid.
   */
  validateOutput(
    outgoing: string,
    clientId: SessionId,
    swarmName: SwarmName
  ): Promise<boolean>;

  /**
   * Bans a client.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves when the client is banned.
   */
  banClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;

  /**
   * Unbans a client.
   * @param clientId - The session ID of the client.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves when the client is unbanned.
   */
  unbanClient(clientId: SessionId, swarmName: SwarmName): Promise<void>;
}

/**
 * Interface for a policy schema.
 */
export interface IPolicySchema {
  /** The description for documentation */
  docDescription?: string;

  /** The name of the policy */
  policyName: PolicyName;

  /** The message to display when a client is banned */
  banMessage?: string;

  /** Ban immediately after failed validation */
  autoBan?: boolean;

  /**
   * Gets the ban message for a client.
   * @param clientId - The session ID of the client.
   * @param policyName - The name of the policy.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves to the ban message or null.
   */
  getBanMessage?: (
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<string | null> | string | null;

  /**
   * Gets the list of banned clients.
   * @param policyName - The name of the policy.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves to an array of session IDs.
   */
  getBannedClients: (
    policyName: PolicyName,
    swarmName: SwarmName
  ) => SessionId[] | Promise<SessionId[]>;

  /**
   * Sets the list of banned clients.
   * @param clientIds - An array of session IDs.
   * @param policyName - The name of the policy.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves when the clients are banned.
   */
  setBannedClients?: (
    clientIds: SessionId[],
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<void> | void;

  /**
   * Validates the input.
   * @param incoming - The incoming message.
   * @param clientId - The session ID of the client.
   * @param policyName - The name of the policy.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves to a boolean indicating whether the input is valid.
   */
  validateInput?: (
    incoming: string,
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<boolean> | boolean;

  /**
   * Validates the output.
   * @param outgoing - The outgoing message.
   * @param clientId - The session ID of the client.
   * @param policyName - The name of the policy.
   * @param swarmName - The name of the swarm.
   * @returns A promise that resolves to a boolean indicating whether the output is valid.
   */
  validateOutput?: (
    outgoing: string,
    clientId: SessionId,
    policyName: PolicyName,
    swarmName: SwarmName
  ) => Promise<boolean> | boolean;

  /** The callbacks for the policy */
  callbacks?: IPolicyCallbacks;
}

/**
 * Interface for policy parameters.
 */
export interface IPolicyParams extends IPolicySchema, IPolicyCallbacks {
  /** The logger instance. */
  logger: ILogger;

  /** The bus instance. */
  bus: IBus;
}

/** Type alias for policy name */
export type PolicyName = string;

export default IPolicy;
