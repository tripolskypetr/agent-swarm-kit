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
   */
  onConnect?: (clientId: string, swarmName: SwarmName) => void;

  /**
   * Optional callback triggered when a command is executed within the swarm.
   */
  onExecute?: (
    clientId: string,
    swarmName: SwarmName,
    content: string,
    mode: ExecutionMode
  ) => void;

  /**
   * Optional callback triggered when a stateless completion run is executed.
   */
  onRun?: (clientId: string, swarmName: SwarmName, content: string) => void;

  /**
   * Optional callback triggered when a message is emitted from the swarm.
   */
  onEmit?: (clientId: string, swarmName: SwarmName, message: string) => void;

  /**
   * Optional callback triggered when a session is initialized within the swarm.
   */
  onInit?: (clientId: string, swarmName: SwarmName) => void;

  /**
   * Optional callback triggered when a session is disconnected or disposed of.
   * Note: "disponnected" in original comment corrected to "disconnected".
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
  /** The unique identifier of the client initializing the swarm.*/
  clientId: string;

  /** The logger instance for recording swarm-related activity and errors.*/
  logger: ILogger;

  /** The bus instance for event communication within the swarm.*/
  bus: IBus;

  /** A map of agent names to their corresponding agent instances for runtime access.*/
  agentMap: Record<AgentName, IAgent>;
}

/**
 * Interface representing the schema for defining a swarm.
 * Configures the swarm's behavior, navigation, and agent management.
*/
export interface ISwarmSchema {
  /** Optional flag to enable serialization of navigation stack and active agent state to persistent storage (e.g., hard drive).*/
  persist?: boolean;

  /** Optional description for documentation purposes, aiding in swarm usage understanding.*/
  docDescription?: string;

  /** Optional array of policy names defining banhammer or access control rules for the swarm.*/
  policies?: PolicyName[];

  /**
   * Optional function to retrieve the initial navigation stack after swarm initialization.
   */
  getNavigationStack?: (
    clientId: string,
    swarmName: SwarmName
  ) => Promise<AgentName[]> | AgentName[];

  /**
   * Optional function to persist the navigation stack after a change.
   * @throws {Error} If persistence fails (e.g., due to storage issues).
   */
  setNavigationStack?: (
    clientId: string,
    navigationStack: AgentName[],
    swarmName: SwarmName
  ) => Promise<void>;

  /**
   * Optional function to fetch the active agent upon swarm initialization.
   */
  getActiveAgent?: (
    clientId: string,
    swarmName: SwarmName,
    defaultAgent: AgentName
  ) => Promise<AgentName> | AgentName;

  /**
   * Optional function to update the active agent after navigation changes.
   * @throws {Error} If the update fails (e.g., due to persistence issues).
   */
  setActiveAgent?: (
    clientId: string,
    agentName: AgentName,
    swarmName: SwarmName
  ) => Promise<void> | void;

  /** The default agent name to use when no active agent is specified.*/
  defaultAgent: AgentName;

  /** The unique name of the swarm within the system.*/
  swarmName: string;

  /** The list of agent names available within the swarm.*/
  agentList: string[];

  /** Optional partial set of lifecycle callbacks for the swarm, allowing customization of events.*/
  callbacks?: Partial<ISwarmCallbacks>;
}

/**
 * Interface representing a swarm of agents.
 * Provides methods for navigation, agent management, and output handling.
*/
export interface ISwarm {
  /**
   * Removes and returns the most recent agent from the navigation stack, or falls back to the default agent.
   * @throws {Error} If navigation retrieval fails (e.g., due to persistence issues).
   */
  navigationPop(): Promise<AgentName>;

  /**
   * Cancels the current output operation, resulting in an empty string from waitForOutput.
   * @throws {Error} If cancellation fails (e.g., due to internal errors).
   */
  cancelOutput(): Promise<void>;

  /**
   * Waits for and retrieves the output from the swarm’s active agent.
   * @throws {Error} If no output is available or waiting times out.
   */
  waitForOutput(): Promise<string>;

  /**
   * Retrieves the name of the currently active agent in the swarm.
   * @throws {Error} If the active agent cannot be determined (e.g., due to persistence issues).
   */
  getAgentName(): Promise<AgentName>;

  /**
   * Retrieves the instance of the currently active agent in the swarm.
   * @throws {Error} If the agent instance cannot be retrieved (e.g., due to invalid agent name).
   */
  getAgent(): Promise<IAgent>;

  /**
   * Registers or updates an agent reference in the swarm’s agent map.
   * @throws {Error} If registration fails (e.g., due to invalid agent or internal errors).
   */
  setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;

  /**
   * Sets the active agent in the swarm by name, updating navigation if applicable.
   * @throws {Error} If setting the agent fails (e.g., due to persistence issues or invalid name).
   */
  setAgentName(agentName: AgentName): Promise<void>;

  /**
   * Emits a message to the session's communication channel.
   * @throws {Error} If the emission fails due to connection issues or invalid message format.
   */
  emit(message: string): Promise<void>;

  /**
   * Returns the current busy state of the swarm.
   * Used to check if the swarm is currently processing an operation (e.g., waiting for output or switching agents).
   * Supports debugging and flow control in client applications.
   */
  getCheckBusy(): Promise<boolean>;

  /**
   * Sets the busy state of the swarm.
   * This method is used to indicate whether the swarm is currently processing an operation.
   * It helps manage flow control and debugging by signaling when the swarm is occupied.
   * @throws {Error} If setting the busy state fails (e.g., due to internal errors).
   */
  setBusy(isBusy: boolean): void;
}

/**
 * Type representing the unique name of a swarm within the system.
 * Used to identify and reference specific swarm instances.
*/
export type SwarmName = string;

/**
 * Default export of the ISwarm interface.
 * Represents the primary swarm management interface for the module.
*/
export default ISwarm;
