/**
 * Interface representing a performance record.
 */
export interface IPerformanceRecord {
  /**
   * The ID of current process
   */
  processId: string;

  /**
   * Array of client performance records.
   */
  clients: IClientPerfomanceRecord[];

  /**
   * Total execution count.
   */
  totalExecutionCount: number;

  /**
   * Total response time as a string.
   */
  totalResponseTime: string;

  /**
   * Average response time as a string.
   */
  averageResponseTime: string;

  /**
   * Days since 01/01/1970 in London.
   */
  momentStamp: number;

  /**
   * Seconds since 00:00 of the momentStamp.
   */
  timeStamp: number;

  /**
   * Current date in UTC format
   */
  date: string;
}

/**
 * Interface representing a client performance record.
 */
export interface IClientPerfomanceRecord {
  /**
   * Client ID.
   */
  clientId: string;

  /**
   * The memory of client session
   */
  sessionMemory: Record<string, unknown>;

  /**
   * Execution count.
   */
  executionCount: number;

  /**
   * Total execution input.
   */
  executionInputTotal: number;

  /**
   * Total execution output.
   */
  executionOutputTotal: number;

  /**
   * Average execution input.
   */
  executionInputAverage: number;

  /**
   * Average execution output.
   */
  executionOutputAverage: number;

  /**
   * Total execution time as a string.
   */
  executionTimeTotal: string;

  /**
   * Average execution time as a string.
   */
  executionTimeAverage: string;
}

export default IPerformanceRecord;
