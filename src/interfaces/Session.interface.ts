import { IIncomingMessage, IOutgoingMessage } from "../model/EmitMessage.model";
import { ILogger } from "../interfaces/Logger.interface";
import ISwarm, { ISwarmSessionCallbacks, SwarmName } from "../interfaces/Swarm.interface";

/**
 * Parameters required to create a session.
 * @interface
 */
export interface ISessionParams extends ISessionSchema, ISwarmSessionCallbacks {
  clientId: string;
  logger: ILogger;
  swarm: ISwarm;
  swarmName: SwarmName;
}

/**
 * Schema for session data.
 * @interface
 */
export interface ISessionSchema {
}

/**
 * Function type for sending messages.
 * @typedef {function} SendMessageFn
 * @param {IOutgoingMessage} outgoing - The outgoing message.
 * @returns {Promise<void> | void}
 */
export type SendMessageFn = (
  outgoing: IOutgoingMessage
) => Promise<void> | void;

/**
 * Function type for receiving messages.
 * @typedef {function} ReceiveMessageFn
 * @param {IIncomingMessage} incoming - The incoming message.
 * @returns {Promise<void> | void}
 */
export type ReceiveMessageFn = (
  incoming: IIncomingMessage
) => Promise<void> | void;

/**
 * Interface for a session.
 * @interface
 */
export interface ISession {
  /**
   * Emit a message.
   * @param {string} message - The message to emit.
   * @returns {Promise<void>}
   */
  emit(message: string): Promise<void>;

  /**
   * Execute a command.
   * @param {string} content - The content to execute.
   * @param {string} mode - The source of execution: tool or user
   * @returns {Promise<string>}
   */
  execute(content: string, mode: ExecutionMode): Promise<string>;

  /**
   * Connect to a message sender.
   * @param {SendMessageFn} connector - The function to send messages.
   * @returns {ReceiveMessageFn}
   */
  connect(connector: SendMessageFn): ReceiveMessageFn;

  /**
   * Commit tool output.
   * @param {string} content - The content to commit.
   * @returns {Promise<void>}
   */
  commitToolOutput(content: string): Promise<void>;

  /**
   * Commit user message without answer
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  commitUserMessage: (message: string) => Promise<void>;

  /**
   * Commit flush of agent history
   * @returns {Promise<void>}
   */
  commitFlush: () => Promise<void>;

  /**
   * Commit a system message.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  commitSystemMessage(message: string): Promise<void>;
}

/**
 * Type for session ID.
 * @typedef {string} SessionId
 */
export type SessionId = string;

/**
 * Type for session mode.
 * @typedef {"session" | "makeConnection" | "complete"} SessionMode
 */
export type SessionMode = "session" | "makeConnection" | "complete";

/**
 * Tools can emit user messages to trigger user friendly responses.
 * Should be ignored for `getUserHistory`
 * @typedef {"tool" | "user"} ExecutionMode
 */
export type ExecutionMode = "tool" | "user";
