/**
 * Interface representing a performance record for a process within the swarm system.
 * Aggregates execution and response metrics across multiple clients (e.g., sessions or agent instances) for a specific process, likely used for system-wide performance monitoring or diagnostics.
 * Integrated into components like logging (e.g., ILogger in ClientAgent) or event buses (e.g., IBus.emit) to track operational efficiency, such as total execution counts, response times, and temporal context.
 */
export interface IPerformanceRecord {
  /**
   * The unique identifier of the process being monitored.
   * Represents a specific execution context, such as a swarm run, agent workflow, or session batch, distinguishing it from other processes in the system.
   * Example: A UUID or incremental ID like "proc-123" tied to a ClientAgent execution cycle.
   *    */
  processId: string;

  /**
   * Array of performance records for individual clients involved in the process.
   * Each entry details metrics for a specific client (e.g., a session or agent instance), enabling granular analysis of performance across the swarm.
   * Populated with IClientPerfomanceRecord objects, reflecting per-client execution and resource usage.
   *    */
  clients: IClientPerfomanceRecord[];

  /**
   * The total number of executions performed across all clients in the process.
   * Counts discrete operations (e.g., command executions in ClientAgent.execute, tool calls), providing a measure of overall activity volume.
   * Example: 50 if 5 clients each executed 10 commands.
   *    */
  totalExecutionCount: number;

  /**
   * The total response time for the process, formatted as a string.
   * Represents the cumulative duration of all client responses (e.g., from command start to output in ClientAgent), typically in a human-readable format like "500ms" or "1.23s".
   * Useful for assessing end-to-end performance across the process.
   *    */
  totalResponseTime: string;

  /**
   * The average response time per execution across all clients, formatted as a string.
   * Calculated as totalResponseTime divided by totalExecutionCount, providing a normalized performance metric (e.g., "10ms" per execution).
   * Aids in identifying typical response latency for the process.
   *    */
  averageResponseTime: string;

  /**
   * The number of days since January 1, 1970 (Unix epoch), based on London time (UTC).
   * Serves as a coarse timestamp for when the performance record was created, aligning with historical date tracking conventions.
   * Example: 19737 for a date in 2024, calculated as floor(Date.now() / 86400000).
   *    */
  momentStamp: number;

  /**
   * The number of seconds since midnight (00:00 UTC) of the day specified by momentStamp.
   * Provides fine-grained timing within the day, complementing momentStamp for precise event logging.
   * Example: 3600 for 01:00:00 UTC, derived from (Date.now() % 86400000) / 1000.
   *    */
  timeStamp: number;

  /**
   * The current date and time of the performance record in UTC format.
   * Stored as a string (e.g., "2024-03-15T12:00:00Z"), offering a human-readable timestamp for when the metrics were captured.
   * Likely used for logging or reporting alongside momentStamp and timeStamp.
   *    */
  date: string;
}

/**
 * Interface representing a performance record for an individual client within a process.
 * Captures detailed execution metrics, memory, and state for a specific client (e.g., a session or agent instance), used to analyze performance at the client level.
 * Embedded within IPerformanceRecord.clients to provide per-client breakdowns, likely logged via ILogger or emitted via IBus for monitoring (e.g., in ClientAgent workflows).
 */
export interface IClientPerfomanceRecord {
  /**
   * The unique identifier of the client, typically a session or agent-specific ID.
   * Matches the clientId used in runtime params (e.g., this.params.clientId in ClientAgent), linking performance data to a specific session or agent instance.
   * Example: "client-456" for a user session.
   *    */
  clientId: string;

  /**
   * A key-value record of the client’s session memory.
   * Stores arbitrary data (e.g., cached values, temporary variables) used during the client’s operation, similar to IState’s state management in ClientAgent.
   * Example: `{ "cacheKey": "value" }` for a session’s temporary storage.
   *    */
  sessionMemory: Record<string, unknown>;

  /**
   * A key-value record of the client’s session state.
   * Represents persistent state data (e.g., configuration, current step) for the client, akin to IState’s role in tracking agent state in ClientAgent.
   * Example: `{ "step": 3, "active": true }` for a session’s current status.
   *    */
  sessionState: Record<string, unknown>;

  /**
   * The number of executions performed by this client within the process.
   * Counts operations like command runs (e.g., ClientAgent.execute) or tool calls, contributing to the process’s totalExecutionCount.
   * Example: 10 for a client that executed 10 commands.
   *    */
  executionCount: number;

  /**
   * The total input size processed during executions, in a numeric unit (e.g., bytes, characters).
   * Measures the cumulative input data (e.g., incoming messages in ClientAgent.execute), useful for assessing data throughput.
   * Example: 1024 for 1KB of total input across executions.
   *    */
  executionInputTotal: number;

  /**
   * The total output size generated during executions, in a numeric unit (e.g., bytes, characters).
   * Measures the cumulative output data (e.g., results in ClientAgent._emitOutput), indicating response volume.
   * Example: 2048 for 2KB of total output.
   *    */
  executionOutputTotal: number;

  /**
   * The average input size per execution, in a numeric unit (e.g., bytes, characters).
   * Calculated as executionInputTotal divided by executionCount, providing a normalized input metric.
   * Example: 102.4 for an average of 102.4 bytes per execution.
   *    */
  executionInputAverage: number;

  /**
   * The average output size per execution, in a numeric unit (e.g., bytes, characters).
   * Calculated as executionOutputTotal divided by executionCount, offering insight into typical output size.
   * Example: 204.8 for an average of 204.8 bytes per execution.
   *    */
  executionOutputAverage: number;

  /**
   * The total execution time for the client, formatted as a string.
   * Represents the cumulative duration of all executions (e.g., from incoming to output in ClientAgent.execute), typically in a readable format like "300ms" or "1.5s".
   * Contributes to the process’s totalResponseTime.
   *    */
  executionTimeTotal: string;

  /**
   * The average execution time per execution, formatted as a string.
   * Calculated as executionTimeTotal divided by executionCount, providing a normalized latency metric (e.g., "30ms" per execution).
   * Helps evaluate client-specific performance efficiency.
   *    */
  executionTimeAverage: string;
}

/**
 * Default export of the IPerformanceRecord interface.
 * Represents the primary performance tracking interface for the module, aggregating client metrics for system analysis.
 *  */
export default IPerformanceRecord;
