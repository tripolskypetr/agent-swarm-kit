import { inject } from "../../core/di";
import LoggerService from "./LoggerService";
import TYPES from "../../core/types";
import SessionValidationService from "../validation/SessionValidationService";
import { GLOBAL_CONFIG } from "../../../config/params";
import msToTime from "../../../utils/msToTime";

/**
 * Performance Service to track and log execution times, input lengths, and output lengths
 * for different client sessions.
 */
export class PerfService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  private executionScheduleMap: Map<string, Map<string, number[]>> = new Map();

  private executionOutputLenMap: Map<string, number> = new Map();
  private executionInputLenMap: Map<string, number> = new Map();
  private executionCountMap: Map<string, number> = new Map();
  private executionTimeMap: Map<string, number> = new Map();

  private totalResponseTime: number = 0;
  private totalRequestCount = 0;

  /**
   * Gets the number of active session executions for a given client.
   * @param {string} clientId - The client ID.
   * @returns {number} The number of active session executions.
   */
  public getActiveSessionExecutionCount = (clientId: string): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessionExecutionCount");
    if (!this.executionCountMap.has(clientId)) {
      return 0;
    }
    return this.executionCountMap.get(clientId)!;
  };

  /**
   * Gets the total execution time for a given client's sessions.
   * @param {string} clientId - The client ID.
   * @returns {number} The total execution time in milliseconds.
   */
  public getActiveSessionExecutionTotalTime = (clientId: string): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessionExecutionTotalTime");
    if (!this.executionTimeMap.has(clientId)) {
      return 0;
    }
    return this.executionTimeMap.get(clientId)!;
  };

  /**
   * Gets the average execution time for a given client's sessions.
   * @param {string} clientId - The client ID.
   * @returns {number} The average execution time in milliseconds.
   */
  public getActiveSessionExecutionAverageTime = (clientId: string): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessionExecutionAverageTime");
    if (!this.executionCountMap.has(clientId)) {
      return 0;
    }
    if (!this.executionTimeMap.has(clientId)) {
      return 0;
    }
    return (
      this.executionTimeMap.get(clientId)! /
      this.executionCountMap.get(clientId)!
    );
  };

  /**
   * Gets the average input length for active sessions of a given client.
   * @param {string} clientId - The client ID.
   * @returns {number} The average input length.
   */
  public getActiveSessionAverageInputLength = (clientId: string): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessionAverageInputLength");
    if (!this.executionInputLenMap.has(clientId)) {
      return 0;
    }
    if (!this.executionCountMap.has(clientId)) {
      return 0;
    }
    return (
      this.executionInputLenMap.get(clientId)! /
      this.executionCountMap.get(clientId)!
    );
  };

  /**
   * Gets the average output length for active sessions of a given client.
   * @param {string} clientId - The client ID.
   * @returns {number} The average output length.
   */
  public getActiveSessionAverageOutputLength = (clientId: string): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(
        "perfService getActiveSessionAverageOutputLength"
      );
    if (!this.executionOutputLenMap.has(clientId)) {
      return 0;
    }
    if (!this.executionCountMap.has(clientId)) {
      return 0;
    }
    return (
      this.executionOutputLenMap.get(clientId)! /
      this.executionCountMap.get(clientId)!
    );
  };

  /**
   * Gets the total input length for active sessions of a given client.
   * @param {string} clientId - The client ID.
   * @returns {number} The total input length.
   */
  public getActiveSessionTotalInputLength = (clientId: string): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessionTotalInputLength");
    if (!this.executionInputLenMap.has(clientId)) {
      return 0;
    }
    return this.executionInputLenMap.get(clientId)!;
  };

  /**
   * Gets the total output length for active sessions of a given client.
   * @param {string} clientId - The client ID.
   * @returns {number} The total output length.
   */
  public getActiveSessionTotalOutputLength = (clientId: string): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessionTotalOutputLength");
    if (!this.executionOutputLenMap.has(clientId)) {
      return 0;
    }
    return this.executionOutputLenMap.get(clientId)!;
  };

  /**
   * Gets the list of active sessions.
   * @returns {string[]} The list of active sessions.
   */
  public getActiveSessions = (): string[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessions");
    return this.sessionValidationService.getSessionList();
  };

  /**
   * Gets the average response time for all requests.
   * @returns {number} The average response time.
   */
  public getAverageResponseTime = (): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getAverageResponseTime");
    if (this.totalRequestCount === 0) {
      return 0;
    }
    return this.totalResponseTime / this.totalRequestCount;
  };

  /**
   * Gets the total number of executions.
   * @returns {number} The total number of executions.
   */
  public getTotalExecutionCount = (): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getTotalExecutionCount");
    return this.totalRequestCount;
  };

  /**
   * Gets the total response time for all requests.
   * @returns {number} The total response time.
   */
  public getTotalResponseTime = (): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getTotalResponseTime");
    return this.totalResponseTime;
  };

  /**
   * Starts an execution for a given client.
   * @param {string} executionId - The execution ID.
   * @param {string} clientId - The client ID.
   * @param {number} inputLen - The input length.
   */
  public startExecution = (
    executionId: string,
    clientId: string,
    inputLen: number
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService startExecution`, {
        executionId,
        clientId,
        inputLen,
      });
    const startTime = Date.now();
    if (!this.executionScheduleMap.has(clientId)) {
      this.executionScheduleMap.set(clientId, new Map());
    }
    if (!this.executionInputLenMap.has(clientId)) {
      this.executionInputLenMap.set(clientId, 0);
    }
    if (!this.executionOutputLenMap.has(clientId)) {
      this.executionOutputLenMap.set(clientId, 0);
    }
    if (!this.executionTimeMap.has(clientId)) {
      this.executionTimeMap.set(clientId, 0);
    }
    const clientMap = this.executionScheduleMap.get(clientId)!;
    if (!clientMap.has(executionId)) {
      clientMap.set(executionId, []);
    }
    clientMap.get(executionId)!.push(startTime);
    if (!this.executionCountMap.has(clientId)) {
      this.executionCountMap.set(clientId, 0);
    }
    this.executionCountMap.set(
      clientId,
      this.executionCountMap.get(clientId)! + 1
    );
    this.executionInputLenMap.set(
      clientId,
      this.executionInputLenMap.get(clientId)! + inputLen
    );
  };

  /**
   * Ends an execution for a given client.
   * @param {string} executionId - The execution ID.
   * @param {string} clientId - The client ID.
   * @param {number} outputLen - The output length.
   * @returns {boolean} True if the execution ended successfully (all required data was found), false otherwise.
   */
  public endExecution = (
    executionId: string,
    clientId: string,
    outputLen: number
  ): boolean => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService endExecution`, {
        executionId,
        clientId,
        outputLen,
      });
    if (!this.executionScheduleMap.has(clientId)) {
      return false;
    }
    if (!this.executionOutputLenMap.has(clientId)) {
      return false;
    }
    if (!this.executionTimeMap.has(clientId)) {
      return false;
    }
    const clientMap = this.executionScheduleMap.get(clientId)!;
    if (!clientMap.has(executionId)) {
      return false;
    }
    const startTime = clientMap.get(executionId)!.pop()!;
    if (!startTime) {
      return false;
    }
    this.executionOutputLenMap.set(
      clientId,
      this.executionOutputLenMap.get(clientId)! + outputLen
    );
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    this.totalResponseTime += responseTime;
    this.totalRequestCount += 1;
    this.executionTimeMap.set(
      clientId,
      this.executionTimeMap.get(clientId)! + responseTime
    );
    return true;
  };

  /**
   * Convert performance measures to record for serialization
   * @param {string} clientId - The client ID.
   */
  public toRecord = (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService toRecord`, { clientId });
    const executionCount = this.executionCountMap.get(clientId) || 0;
    const executionInputTotal = this.executionInputLenMap.get(clientId) || 0;
    const executionOutputTotal = this.executionOutputLenMap.get(clientId) || 0;
    const executionTimeTotal = this.executionTimeMap.get(clientId) || 0;
    const executionInputAverage = executionCount
      ? executionInputTotal / executionCount
      : 0;
    const executionOutputAverage = executionCount
      ? executionOutputTotal / executionCount
      : 0;
    const executionTimeAverage = executionCount
      ? executionTimeTotal / executionCount
      : 0;
    return {
      clientId,
      executionCount,
      executionInputTotal,
      executionOutputTotal,
      executionInputAverage,
      executionOutputAverage,
      executionTimeTotal: msToTime(executionTimeTotal),
      executionTimeAverage: msToTime(executionTimeAverage),
    };
  };

  /**
   * Disposes of all data related to a given client.
   * @param {string} clientId - The client ID.
   */
  public dispose = (clientId: string): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService dispose`, { clientId });
    this.executionScheduleMap.delete(clientId);
    this.executionCountMap.delete(clientId);
    this.executionInputLenMap.delete(clientId);
    this.executionOutputLenMap.delete(clientId);
    this.executionTimeMap.delete(clientId);
  };
}

export default PerfService;
