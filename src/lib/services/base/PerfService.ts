import { inject } from "../../core/di";
import LoggerService from "./LoggerService";
import TYPES from "../../core/types";
import SessionValidationService from "../validation/SessionValidationService";
import { GLOBAL_CONFIG } from "../../../config/params";
import msToTime from "../../../utils/msToTime";
import IPerformanceRecord, {
  IClientPerfomanceRecord,
} from "../../../model/Performance.model";
import { getMomentStamp, getTimeStamp } from "get-moment-stamp";
import MemorySchemaService from "../schema/MemorySchemaService";
import SwarmValidationService from "../validation/SwarmValidationService";
import AgentValidationService from "../validation/AgentValidationService";
import StatePublicService from "../public/StatePublicService";
import StateConnectionService from "../connection/StateConnectionService";

const METHOD_NAME_COMPUTE_STATE = "perfService.computeClientState";

/**
 * Performance Service to track and log execution times, input lengths, and output lengths
 * for different client sessions.
 */
export class PerfService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );
  private readonly memorySchemaService = inject<MemorySchemaService>(
    TYPES.memorySchemaService
  );
  private readonly swarmValidationService = inject<SwarmValidationService>(
    TYPES.swarmValidationService
  );
  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );
  private readonly statePublicService = inject<StatePublicService>(
    TYPES.statePublicService
  );
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );

  private executionScheduleMap: Map<string, Map<string, number[]>> = new Map();

  private executionOutputLenMap: Map<string, number> = new Map();
  private executionInputLenMap: Map<string, number> = new Map();
  private executionCountMap: Map<string, number> = new Map();
  private executionTimeMap: Map<string, number> = new Map();

  private totalResponseTime: number = 0;
  private totalRequestCount = 0;

  /**
   * Computes the state of the client by aggregating the states of all agents in the client's swarm.
   * @param {string} clientId - The client ID.
   * @returns {Promise<Record<string, unknown>>} A promise that resolves to an object containing the aggregated state of the client.
   */
  private computeClientState = async (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService computeClientState`, {
        clientId,
      });
    const swarmName = this.sessionValidationService.getSwarm(clientId);
    const result: Record<string, unknown> = {};
    await Promise.all(
      this.swarmValidationService
        .getAgentList(swarmName)
        .flatMap((agentName) =>
          this.agentValidationService.getStateList(agentName)
        )
        .filter((stateName) => !!stateName)
        .map(async (stateName) => {
          if (!this.sessionValidationService.hasSession(clientId)) {
            return;
          }
          if (
            !this.stateConnectionService.getStateRef.has(
              `${clientId}-${stateName}`
            )
          ) {
            return;
          }
          const stateValue = await this.statePublicService.getState(
            METHOD_NAME_COMPUTE_STATE,
            clientId,
            stateName
          );
          Object.assign(result, { [stateName]: stateValue });
        })
    );
    return result;
  };

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
      this.loggerService.info(
        "perfService getActiveSessionExecutionAverageTime"
      );
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
    const clientStack = clientMap.get(executionId)!;
    const startTime = clientStack.pop()!;
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
    if (!clientStack.length) {
      clientMap.delete(executionId);
    }
    return true;
  };

  /**
   * Convert performance measures of the client for serialization
   * @param {string} clientId - The client ID.
   */
  public toClientRecord = async (
    clientId: string
  ): Promise<IClientPerfomanceRecord> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService toClientRecord`, { clientId });
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
      sessionMemory: this.memorySchemaService.readValue(clientId),
      sessionState: await this.computeClientState(clientId),
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
   * Convert performance measures of all clients for serialization.
   * @returns {Promise<IPerformanceRecord>} An object containing performance measures of all clients,
   *                   total execution count, total response time, and average response time.
   */
  public toRecord = async (): Promise<IPerformanceRecord> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService toRecord`);
    const totalExecutionCount = this.getTotalExecutionCount();
    const totalResponseTime = this.getTotalResponseTime();
    const averageResponseTime = this.getAverageResponseTime();
    return {
      processId: GLOBAL_CONFIG.CC_PROCESS_UUID,
      clients: await Promise.all(
        this.getActiveSessions().map(this.toClientRecord)
      ),
      totalExecutionCount,
      totalResponseTime: msToTime(totalResponseTime),
      averageResponseTime: msToTime(averageResponseTime),
      momentStamp: getMomentStamp(),
      timeStamp: getTimeStamp(),
      date: new Date().toUTCString(),
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
