import { AgentName } from "../interfaces/Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import { ILogger } from "../interfaces/Logger.interface";
import { IHistoryAdapter } from "../classes/History";
import { IBus } from "./Bus.interface";

/**
 * Interface representing the history of model messages.
 */
export interface IHistory {
  /**
   * Pushes a message to the history.
   * @param {IModelMessage} message - The message to push.
   * @returns {Promise<void>}
   */
  push(message: IModelMessage): Promise<void>;

  /**
   * Pop the last message from a history
   * @returns {Promise<IModelMessage | null>}
   */
  pop(): Promise<IModelMessage | null>;

  /**
   * Converts the history to an array of messages for a specific agent.
   * @param {string} prompt - The prompt to filter messages for the agent.
   * @returns {Promise<IModelMessage[]>}
   */
  toArrayForAgent(prompt: string, system?: string[]): Promise<IModelMessage[]>;

  /**
   * Converts the history to an array of raw messages.
   * @returns {Promise<IModelMessage[]>}
   */
  toArrayForRaw(): Promise<IModelMessage[]>;
}

/**
 * Interface representing the parameters required to create a history instance.
 */
export interface IHistoryParams extends IHistorySchema {
  /**
   * The name of the agent.
   * @type {AgentName}
   */
  agentName: AgentName;

  /**
   * The client ID.
   * @type {string}
   */
  clientId: string;

  /**
   * The logger instance.
   * @type {ILogger}
   */
  logger: ILogger;

  /** The bus instance. */
  bus: IBus;
}

/**
 * Interface representing the schema of the history.
 */
export interface IHistorySchema {
  /**
   * The adapter for array of model messages.
   * @type {IHistoryAdapter}
   */
  items: IHistoryAdapter;
}

export default IHistory;
