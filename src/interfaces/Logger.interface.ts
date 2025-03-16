/**
 * Interface representing a logging mechanism for the swarm system.
 * Provides methods to record messages at different severity levels, used across components like agents, sessions, states, storage, swarms, history, embeddings, completions, and policies.
 * Logs are utilized to track lifecycle events (e.g., initialization, disposal), operational details (e.g., tool calls, message emissions), validation outcomes (e.g., policy checks), and errors (e.g., persistence failures), aiding in debugging, monitoring, and auditing.
 */
export interface ILogger {
  /**
   * Logs a general-purpose message.
   * Used throughout the swarm system to record significant events or state changes, such as agent execution, session connections, or storage updates.
   * @param {string} topic - The category or context of the log message (e.g., "AgentExecution", "StorageUpsert").
   * @param {...any[]} args - Variable arguments representing the message content, which can include strings, objects, or other data types for flexible logging.
   */
  log(topic: string, ...args: any[]): void;

  /**
   * Logs a debug-level message.
   * Employed for detailed diagnostic information, such as intermediate states during agent tool calls, swarm navigation changes, or embedding creation processes, typically enabled in development or troubleshooting scenarios.
   * @param {string} topic - The category or context of the debug message (e.g., "ToolValidation", "EmbeddingSimilarity").
   * @param {...any[]} args - Variable arguments representing the debug content, often detailed data like parameters, stack traces, or internal states.
   */
  debug(topic: string, ...args: any[]): void;

  /**
   * Logs an info-level message.
   * Used to record informational updates, such as successful completions, policy validations, or history commits, providing a high-level overview of system activity without excessive detail.
   * @param {string} topic - The category or context of the info message (e.g., "SessionInit", "PolicyBan").
   * @param {...any[]} args - Variable arguments representing the informational content, typically concise summaries or status updates.
   */
  info(topic: string, ...args: any[]): void;
}
