import { IIncomingMessage, IOutgoingMessage } from "../model/EmitMessage.model";
import { ILogger } from "../interfaces/Logger.interface";
import ISwarm, {
  ISwarmSessionCallbacks,
  SwarmName,
} from "../interfaces/Swarm.interface";
import { IBus } from "./Bus.interface";

/**
 * Parameters required to create a session.
 * @interface
 */
export interface ISessionParams extends ISessionSchema, ISwarmSessionCallbacks {
  clientId: string;
  logger: ILogger;
  bus: IBus;
  swarm: ISwarm;
  swarmName: SwarmName;
}

/**
 * Schema for session data.
 * @interface
 */
export interface ISessionSchema {}

/**
 * Function type for sending messages.
 * @typedef {function} SendMessageFn
 * @param {IOutgoingMessage} outgoing - The outgoing message.
 * @returns {Promise<void> | void}
 */
export type SendMessageFn<T = void> = (
  outgoing: IOutgoingMessage
) => Promise<T>;

/**
 * Function type for receiving messages.
 * @typedef {function} ReceiveMessageFn
 * @param {IIncomingMessage} incoming - The incoming message.
 * @returns {Promise<void> | void}
 */
export type ReceiveMessageFn<T = void> = (
  incoming: IIncomingMessage
) => Promise<T>;

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
   * Run the complete stateless without modifying chat history
   * @param {string} content - The content to execute.
   * @returns {Promise<string>}
   */
  run(content: string): Promise<string>;

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
  connect(connector: SendMessageFn, ...args: unknown[]): ReceiveMessageFn<string>;

  /**
   * Commit tool output.
   * @param {string} toolId - The `tool_call_id` for openai history
   * @param {string} content - The content to commit.
   * @returns {Promise<void>}
   */
  commitToolOutput(toolId: string, content: string): Promise<void>;

  /**
   * Commit assistant message without answer
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  commitAssistantMessage(message: string): Promise<void>;

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
   * Prevent the next tool from being executed
   * @returns {Promise<void>}
   */
  commitStopTools: () => Promise<void>;

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
