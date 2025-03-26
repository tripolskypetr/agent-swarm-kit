import { IIncomingMessage, IOutgoingMessage } from "../model/EmitMessage.model";
import { ILogger } from "../interfaces/Logger.interface";
import ISwarm, {
  ISwarmSessionCallbacks,
  SwarmName,
} from "../interfaces/Swarm.interface";
import { IBus } from "./Bus.interface";
import { IPolicy } from "./Policy.interface";

/**
 * Interface representing the parameters required to create a session.
 * Combines session schema, swarm callbacks, and runtime dependencies.
 * @extends {ISessionSchema}
 * @extends {ISwarmSessionCallbacks}
 */
export interface ISessionParams extends ISessionSchema, ISwarmSessionCallbacks {
  /** The unique ID of the client associated with the session. */
  clientId: string;

  /** The logger instance for recording session activity and errors. */
  logger: ILogger;

  /** The policy instance defining session rules and constraints. */
  policy: IPolicy;

  /** The bus instance for event communication within the swarm. */
  bus: IBus;

  /** The swarm instance managing the session. */
  swarm: ISwarm;

  /** The unique name of the swarm this session belongs to. */
  swarmName: SwarmName;
}

/**
 * Interface representing the schema for session data.
 * Currently empty, serving as a placeholder for future session-specific configuration.
 */
export interface ISessionSchema {}

/**
 * Type representing a function for sending messages.
 * @template T - The return type of the send operation, defaults to void.
 * @param {IOutgoingMessage} outgoing - The outgoing message to send.
 * @returns {Promise<T> | T} A promise resolving to the result of the send operation, or the result directly.
 */
export type SendMessageFn<T = void> = (
  outgoing: IOutgoingMessage
) => Promise<T>;

/**
 * Type representing a function for receiving messages.
 * @template T - The return type of the receive operation, defaults to void.
 * @param {IIncomingMessage} incoming - The incoming message to process.
 * @returns {Promise<T> | T} A promise resolving to the result of the receive operation, or the result directly.
 */
export type ReceiveMessageFn<T = void> = (
  incoming: IIncomingMessage
) => Promise<T>;

/**
 * Interface representing a session within the swarm.
 * Defines methods for message emission, execution, and state management.
 */
export interface ISession {

  /**
   * Sends a notification message to connect listeners via the internal `_notifySubject`.
   * Logs the notification if debugging is enabled.
   * 
   * @param {string} message - The notification message to send.
   * @returns {Promise<void>} Resolves when the message is successfully sent to subscribers.
   */
  notify(message: string): Promise<void>

  /**
   * Emits a message to the session's communication channel.
   * @param {string} message - The message content to emit.
   * @returns {Promise<void>} A promise that resolves when the message is successfully emitted.
   * @throws {Error} If the emission fails due to connection issues or invalid message format.
   */
  emit(message: string): Promise<void>;

  /**
   * Runs a stateless completion without modifying the session's chat history.
   * Useful for one-off computations or previews.
   * @param {string} content - The content to process statelessly.
   * @returns {Promise<string>} A promise resolving to the output of the completion.
   * @throws {Error} If the execution fails due to invalid content or internal errors.
   */
  run(content: string): Promise<string>;

  /**
   * Executes a command within the session, potentially updating history based on mode.
   * @param {string} content - The content to execute.
   * @param {ExecutionMode} mode - The source of execution ("tool" or "user").
   * @returns {Promise<string>} A promise resolving to the output of the execution.
   * @throws {Error} If the execution fails due to invalid content, mode, or internal errors.
   */
  execute(content: string, mode: ExecutionMode): Promise<string>;

  /**
   * Connects the session to a message sender and returns a receiver function.
   * Establishes a bidirectional communication channel.
   * @param {SendMessageFn} connector - The function to send outgoing messages.
   * @param {...unknown[]} args - Additional arguments for connector setup (implementation-specific).
   * @returns {ReceiveMessageFn<string>} A function to handle incoming messages, returning a string result.
   * @throws {Error} If the connection fails or the connector is invalid.
   */
  connect(
    connector: SendMessageFn,
    ...args: unknown[]
  ): ReceiveMessageFn<string>;

  /**
   * Commits tool output to the session's history or state.
   * @param {string} toolId - The unique `tool_call_id` for tracking in OpenAI-style history.
   * @param {string} content - The output content from the tool.
   * @returns {Promise<void>} A promise that resolves when the output is committed.
   * @throws {Error} If the tool ID is invalid or committing fails.
   */
  commitToolOutput(toolId: string, content: string): Promise<void>;

  /**
   * Commits an assistant message to the session's history without triggering a response.
   * @param {string} message - The assistant message content to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
   * @throws {Error} If committing the message fails.
   */
  commitAssistantMessage(message: string): Promise<void>;

  /**
   * Commits a user message to the session's history without triggering a response.
   * @param {string} message - The user message content to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
   * @throws {Error} If committing the message fails.
   */
  commitUserMessage: (message: string, mode: ExecutionMode) => Promise<void>;

  /**
   * Commits a flush operation to clear the session's agent history.
   * Resets the history to an initial state.
   * @returns {Promise<void>} A promise that resolves when the history is flushed.
   * @throws {Error} If flushing the history fails.
   */
  commitFlush: () => Promise<void>;

  /**
   * Prevents the next tool in the execution sequence from running.
   * Stops further tool calls within the session.
   * @returns {Promise<void>} A promise that resolves when the stop is committed.
   * @throws {Error} If stopping the tools fails.
   */
  commitStopTools: () => Promise<void>;

  /**
   * Commits a system message to the session's history or state.
   * @param {string} message - The system message content to commit.
   * @returns {Promise<void>} A promise that resolves when the message is committed.
   * @throws {Error} If committing the message fails.
   */
  commitSystemMessage(message: string): Promise<void>;
}

/**
 * Type representing the unique identifier for a session.
 * @typedef {string} SessionId
 */
export type SessionId = string;

/**
 * Type representing the operational mode of a session.
 * Defines the session's behavior: full session, connection setup, or single completion.
 * @typedef {"session" | "makeConnection" | "complete"} SessionMode
 */
export type SessionMode = "session" | "makeConnection" | "complete";

/**
 * Type representing the source of execution within a session.
 * Tools emit "tool" messages (ignored in user history), while users emit "user" messages.
 * @typedef {"tool" | "user"} ExecutionMode
 */
export type ExecutionMode = "tool" | "user";
