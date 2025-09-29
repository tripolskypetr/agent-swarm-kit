import { AgentName } from "../interfaces/Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { ILogger } from "../interfaces/Logger.interface";
import { IHistoryAdapter } from "../classes/History";
import { IBus } from "./Bus.interface";

/**
 * Interface representing the history of model messages within the swarm.
 * Provides methods to manage and retrieve a sequence of messages for an agent or raw usage.
 */
export interface IHistory {
  /**
   * Adds a message to the end of the history.
   * Updates the history store asynchronously.
   * @throws {Error} If the push operation fails (e.g., due to storage issues or invalid message).
   */
  push(message: IModelMessage): Promise<void>;

  /**
   * Removes and returns the last message from the history.
   * @throws {Error} If the pop operation fails (e.g., due to internal errors).
   */
  pop(): Promise<IModelMessage | null>;

  /**
   * Converts the history into an array of messages tailored for a specific agent.
   * Filters or formats messages based on the provided prompt and optional system prompts.
   * @throws {Error} If conversion fails (e.g., due to adapter issues or invalid prompt).
   */
  toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;

  /**
   * Converts the entire history into an array of raw model messages.
   * Retrieves all messages without agent-specific filtering or formatting.
   * @throws {Error} If conversion fails (e.g., due to adapter issues).
   */
  toArrayForRaw(): Promise<IModelMessage[]>;
}

/**
 * Interface representing the parameters required to create a history instance.
 * Extends the history schema with runtime dependencies for agent-specific history management.
 * @extends {IHistorySchema}
 */
export interface IHistoryParams extends IHistorySchema {
  /** The unique name of the agent associated with this history instance. */
  agentName: AgentName;

  /** Maximum number of messages taken from agent schema to maintain context size */
  keepMessages: number;

  /** The unique ID of the client associated with this history instance. */
  clientId: string;

  /** The logger instance for recording history-related activity and errors. */
  logger: ILogger;

  /** The bus instance for event communication within the swarm. */
  bus: IBus;
}

/**
 * Interface representing the schema for history configuration.
 * Defines the underlying storage mechanism for model messages.
 */
export interface IHistorySchema {
  /**
   * The adapter responsible for managing the array of model messages.
   * Provides the implementation for history storage and retrieval.
   */
  items: IHistoryAdapter;
}

/**
 * Default export of the IHistory interface.
 * Represents the primary history management interface for the module.
 */
export default IHistory;
