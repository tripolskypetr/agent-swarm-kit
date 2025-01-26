import { IIncomingMessage, IOutgoingMessage } from "../model/EmitMessage.model";
import { ILogger } from "../interfaces/Logger.interface";
import ISwarm from "../interfaces/Swarm.interface";

/**
 * Parameters required to create a session.
 * @interface
 */
export interface ISessionParams extends ISessionSchema {
  clientId: string;
  logger: ILogger;
  swarm: ISwarm;
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
export type SendMessageFn = (outgoing: IOutgoingMessage) => Promise<void> | void;

/**
 * Function type for receiving messages.
 * @typedef {function} ReceiveMessageFn
 * @param {IIncomingMessage} incoming - The incoming message.
 * @returns {Promise<void> | void}
 */
export type ReceiveMessageFn = (incoming: IIncomingMessage) => Promise<void> | void;

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
   * @returns {Promise<string>}
   */
  execute(content: string): Promise<string>;

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
