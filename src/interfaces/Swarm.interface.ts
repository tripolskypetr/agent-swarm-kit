import { AgentName, IAgent } from "../interfaces/Agent.interface";
import { ILogger } from "../interfaces/Logger.interface";
import { IBus } from "./Bus.interface";
import { PolicyName } from "./Policy.interface";
import { ExecutionMode } from "./Session.interface";

/**
 * Interface representing callbacks for session-related events within a swarm.
 * Provides hooks for connection, execution, and emission events.
 */
export interface ISwarmSessionCallbacks {
  /**
   * Optional callback triggered when a client connects to the swarm.
   * Useful for logging or initialization tasks.
   * @param {string} clientId - The unique ID of the client connecting.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   */
  onConnect?: (clientId: string, swarmName: SwarmName) => void;

  /**
   * Optional callback triggered when a command is executed within the swarm.
   * @param {string} clientId - The unique ID of the client executing the command.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {string} content - The content of the command to execute.
   * @param {ExecutionMode} mode - The source of execution ("tool" or "user").
   */
  onExecute?: (
    clientId: string,
    swarmName: SwarmName,
    content: string,
    mode: ExecutionMode
  ) => void;

  /**
   * Optional callback triggered when a stateless completion run is executed.
   * @param {string} clientId - The unique ID of the client initiating the run.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {string} content - The content to process statelessly.
   */
  onRun?: (clientId: string, swarmName: SwarmName, content: string) => void;

  /**
   * Optional callback triggered when a message is emitted from the swarm.
   * @param {string} clientId - The unique ID of the client associated with the emission.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {string} message - The message content being emitted.
   */
  onEmit?: (clientId: string, swarmName: SwarmName, message: string) => void;

  /**
   * Optional callback triggered when a session is initialized within the swarm.
   * @param {string} clientId - The unique ID of the client associated with the session.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   */
  onInit?: (clientId: string, swarmName: SwarmName) => void;

  /**
   * Optional callback triggered when a session is disconnected or disposed of.
   * Note: "disponnected" in original comment corrected to "disconnected".
   * @param {string} clientId - The unique ID of the client associated with the session.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   */
  onDispose?: (clientId: string, swarmName: SwarmName) => void;
}

/**
 * Interface representing lifecycle callbacks for an initialized swarm.
 * Extends session callbacks with agent-specific navigation events.
 * @extends {ISwarmSessionCallbacks}
 */
export interface ISwarmCallbacks extends ISwarmSessionCallbacks {
  /**
   * Callback triggered when the active agent changes within the swarm.
   * Useful for navigation tracking or state updates.
   * @param {string} clientId - The unique ID of the client associated with the change.
   * @param {AgentName} agentName - The name of the new active agent.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the agent change is processed.
   */
  onAgentChanged: (
    clientId: string,
    agentName: AgentName,
    swarmName: SwarmName
  ) => Promise<void>;
}

/**
 * Interface representing the parameters required to initialize a swarm.
 * Extends the swarm schema (excluding certain fields) with runtime dependencies.
 * @extends {Omit<ISwarmSchema, "agentList" | "onAgentChanged">}
 */
export interface ISwarmParams
  extends Omit<
    ISwarmSchema,
    keyof {
      agentList: never;
      onAgentChanged: never;
    }
  > {
  /** The unique identifier of the client initializing the swarm. */
  clientId: string;

  /** The logger instance for recording swarm-related activity and errors. */
  logger: ILogger;

  /** The bus instance for event communication within the swarm. */
  bus: IBus;

  /** A map of agent names to their corresponding agent instances for runtime access. */
  agentMap: Record<AgentName, IAgent>;
}

/**
 * Interface representing the schema for defining a swarm.
 * Configures the swarm's behavior, navigation, and agent management.
 */
export interface ISwarmSchema {
  /** Optional flag to enable serialization of navigation stack and active agent state to persistent storage (e.g., hard drive). */
  persist?: boolean;

  /** Optional description for documentation purposes, aiding in swarm usage understanding. */
  docDescription?: string;

  /** Optional array of policy names defining banhammer or access control rules for the swarm. */
  policies?: PolicyName[];

  /**
   * Optional function to retrieve the initial navigation stack after swarm initialization.
   * @param {string} clientId - The unique ID of the client requesting the stack.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<AgentName[]> | AgentName[]} The navigation stack, synchronously or asynchronously.
   */
  getNavigationStack?: (
    clientId: string,
    swarmName: SwarmName
  ) => Promise<AgentName[]> | AgentName[];

  /**
   * Optional function to persist the navigation stack after a change.
   * @param {string} clientId - The unique ID of the client updating the stack.
   * @param {AgentName[]} navigationStack - The updated navigation stack.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the stack is persisted.
   * @throws {Error} If persistence fails (e.g., due to storage issues).
   */
  setNavigationStack?: (
    clientId: string,
    navigationStack: AgentName[],
    swarmName: SwarmName
  ) => Promise<void>;

  /**
   * Optional function to fetch the active agent upon swarm initialization.
   * @param {string} clientId - The unique ID of the client requesting the agent.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @param {AgentName} defaultAgent - The default agent name to fall back to if no active agent is set.
   * @returns {Promise<AgentName> | AgentName} The name of the active agent, synchronously or asynchronously.
   */
  getActiveAgent?: (
    clientId: string,
    swarmName: SwarmName,
    defaultAgent: AgentName
  ) => Promise<AgentName> | AgentName;

  /**
   * Optional function to update the active agent after navigation changes.
   * @param {string} clientId - The unique ID of the client updating the agent.
   * @param {AgentName} agentName - The name of the new active agent.
   * @param {SwarmName} swarmName - The unique name of the swarm.
   * @returns {Promise<void> | void} A promise that resolves when the agent is updated, or void if synchronous.
   * @throws {Error} If the update fails (e.g., due to persistence issues).
   */
  setActiveAgent?: (
    clientId: string,
    agentName: AgentName,
    swarmName: SwarmName
  ) => Promise<void> | void;

  /** The default agent name to use when no active agent is specified. */
  defaultAgent: AgentName;

  /** The unique name of the swarm within the system. */
  swarmName: string;

  /** The list of agent names available within the swarm. */
  agentList: string[];

  /** Optional partial set of lifecycle callbacks for the swarm, allowing customization of events. */
  callbacks?: Partial<ISwarmCallbacks>;
}

/**
 * Interface representing a swarm of agents.
 * Provides methods for navigation, agent management, and output handling.
 */
export interface ISwarm {
  /**
   * Removes and returns the most recent agent from the navigation stack, or falls back to the default agent.
   * @returns {Promise<AgentName>} A promise resolving to the agent name popped from the stack or the default agent.
   * @throws {Error} If navigation retrieval fails (e.g., due to persistence issues).
   */
  navigationPop(): Promise<AgentName>;

  /**
   * Cancels the current output operation, resulting in an empty string from waitForOutput.
   * @returns {Promise<void>} A promise that resolves when the output is canceled.
   * @throws {Error} If cancellation fails (e.g., due to internal errors).
   */
  cancelOutput(): Promise<void>;

  /**
   * Waits for and retrieves the output from the swarm’s active agent.
   * @returns {Promise<string>} A promise resolving to the output string from the swarm.
   * @throws {Error} If no output is available or waiting times out.
   */
  waitForOutput(): Promise<string>;

  /**
   * Retrieves the name of the currently active agent in the swarm.
   * @returns {Promise<AgentName>} A promise resolving to the name of the active agent.
   * @throws {Error} If the active agent cannot be determined (e.g., due to persistence issues).
   */
  getAgentName(): Promise<AgentName>;

  /**
   * Retrieves the instance of the currently active agent in the swarm.
   * @returns {Promise<IAgent>} A promise resolving to the active agent instance.
   * @throws {Error} If the agent instance cannot be retrieved (e.g., due to invalid agent name).
   */
  getAgent(): Promise<IAgent>;

  /**
   * Registers or updates an agent reference in the swarm’s agent map.
   * @param {AgentName} agentName - The name of the agent to register.
   * @param {IAgent} agent - The agent instance to associate with the name.
   * @returns {Promise<void>} A promise that resolves when the agent reference is set.
   * @throws {Error} If registration fails (e.g., due to invalid agent or internal errors).
   */
  setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;

  /**
   * Sets the active agent in the swarm by name, updating navigation if applicable.
   * @param {AgentName} agentName - The name of the agent to set as active.
   * @returns {Promise<void>} A promise that resolves when the active agent is updated.
   * @throws {Error} If setting the agent fails (e.g., due to persistence issues or invalid name).
   */
  setAgentName(agentName: AgentName): Promise<void>;

  /**
   * Emits a message to the session's communication channel.
   * @param {string} message - The message content to emit.
   * @returns {Promise<void>} A promise that resolves when the message is successfully emitted.
   * @throws {Error} If the emission fails due to connection issues or invalid message format.
   */
  emit(message: string): Promise<void>;

  /**
   * Returns the current busy state of the swarm.
   * Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
   * Supports debugging and flow control in client applications.
   * @returns {Promise<boolean>} True if the swarm is busy, false otherwise.
   */
  getCheckBusy(): Promise<boolean>;
}

/**
 * Type representing the unique name of a swarm within the system.
 * @typedef {string} SwarmName
 */
export type SwarmName = string;

/**
 * Default export of the ISwarm interface.
 * Represents the primary swarm management interface for the module.
 * @type {ISwarm}
 */
export default ISwarm;
