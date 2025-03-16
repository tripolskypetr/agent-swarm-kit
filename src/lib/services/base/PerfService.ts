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
import { StateName } from "../../../interfaces/State.interface";
import SwarmPublicService from "../public/SwarmPublicService";
import PolicyPublicService from "../public/PolicyPublicService";

const METHOD_NAME_COMPUTE_STATE = "perfService.computeClientState";

/**
 * Service class for tracking and logging performance metrics of client sessions in the swarm system.
 * Monitors execution times, input/output lengths, and session states, aggregating data into IPerformanceRecord and IClientPerfomanceRecord structures.
 * Integrates with ClientAgent workflows (e.g., execute, run) to measure performance, using LoggerService for logging (gated by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and validation/public services for state computation.
 * Provides methods to start/end executions, retrieve metrics, and serialize performance data for reporting or analytics.
 */
export class PerfService {
  /**
   * Logger service instance for logging performance-related information, injected via DI.
   * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, used across methods (e.g., startExecution, toRecord) for info-level logging.
   * @type {LoggerService}
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Session validation service instance, injected via DI.
   * Used to retrieve session lists (e.g., getActiveSessions) and swarm names (e.g., computeClientState).
   * @type {SessionValidationService}
   * @private
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Memory schema service instance, injected via DI.
   * Provides session memory data for toClientRecord, aligning with IClientPerfomanceRecord.sessionMemory.
   * @type {MemorySchemaService}
   * @private
   */
  private readonly memorySchemaService = inject<MemorySchemaService>(
    TYPES.memorySchemaService
  );

  /**
   * Swarm validation service instance, injected via DI.
   * Retrieves agent and policy lists for computeClientState, supporting swarm-level state aggregation.
   * @type {SwarmValidationService}
   * @private
   */
  private readonly swarmValidationService = inject<SwarmValidationService>(
    TYPES.swarmValidationService
  );

  /**
   * Agent validation service instance, injected via DI.
   * Fetches state lists for agents in computeClientState, enabling client state computation.
   * @type {AgentValidationService}
   * @private
   */
  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );

  /**
   * State public service instance, injected via DI.
   * Retrieves state values for computeClientState, populating IClientPerfomanceRecord.sessionState.
   * @type {StatePublicService}
   * @private
   */
  private readonly statePublicService = inject<StatePublicService>(
    TYPES.statePublicService
  );

  /**
   * Swarm public service instance, injected via DI.
   * Provides agent names for computeClientState, supporting swarm status in sessionState.
   * @type {SwarmPublicService}
   * @private
   */
  private readonly swarmPublicService = inject<SwarmPublicService>(
    TYPES.swarmPublicService
  );

  /**
   * Policy public service instance, injected via DI.
   * Checks for bans in computeClientState, contributing to policyBans in sessionState.
   * @type {PolicyPublicService}
   * @private
   */
  private readonly policyPublicService = inject<PolicyPublicService>(
    TYPES.policyPublicService
  );

  /**
   * State connection service instance, injected via DI.
   * Verifies state references in computeClientState, ensuring valid state retrieval.
   * @type {StateConnectionService}
   * @private
   */
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );

  /**
   * Map tracking execution start times for clients, keyed by clientId and executionId.
   * Used in startExecution and endExecution to calculate response times per execution.
   * @type {Map<string, Map<string, number[]>>}
   * @private
   */
  private executionScheduleMap: Map<string, Map<string, number[]>> = new Map();

  /**
   * Map of total output lengths per client, keyed by clientId.
   * Updated in endExecution, used for IClientPerfomanceRecord.executionOutputTotal.
   * @type {Map<string, number>}
   * @private
   */
  private executionOutputLenMap: Map<string, number> = new Map();

  /**
   * Map of total input lengths per client, keyed by clientId.
   * Updated in startExecution, used for IClientPerfomanceRecord.executionInputTotal.
   * @type {Map<string, number>}
   * @private
   */
  private executionInputLenMap: Map<string, number> = new Map();

  /**
   * Map of execution counts per client, keyed by clientId.
   * Updated in startExecution, used for IClientPerfomanceRecord.executionCount.
   * @type {Map<string, number>}
   * @private
   */
  private executionCountMap: Map<string, number> = new Map();

  /**
   * Map of total execution times per client, keyed by clientId.
   * Updated in endExecution, used for IClientPerfomanceRecord.executionTimeTotal.
   * @type {Map<string, number>}
   * @private
   */
  private executionTimeMap: Map<string, number> = new Map();

  /**
   * Total response time across all executions, in milliseconds.
   * Aggregated in endExecution, used for IPerformanceRecord.totalResponseTime.
   * @type {number}
   * @private
   */
  private totalResponseTime: number = 0;

  /**
   * Total number of execution requests across all clients.
   * Incremented in endExecution, used for IPerformanceRecord.totalExecutionCount.
   * @type {number}
   * @private
   */
  private totalRequestCount = 0;

  /**
   * Computes the aggregated state of a client by collecting swarm, agent, policy, and state data.
   * Used in toClientRecord to populate IClientPerfomanceRecord.sessionState, integrating with validation and public services.
   * Logs via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true (e.g., ClientAgent-style debug logging).
   * @param {string} clientId - The unique identifier of the client.
   * @returns {Promise<Record<string, unknown>>} A promise resolving to an object with swarm status, policy bans, and state values.
   * @private
   */
  private computeClientState = async (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`perfService computeClientState`, {
        clientId,
      });
    const swarmName = this.sessionValidationService.getSwarm(clientId);
    const agentName = await this.swarmPublicService.getAgentName(
      METHOD_NAME_COMPUTE_STATE,
      clientId,
      swarmName
    );

    const policyBans = await Promise.all(
      this.swarmValidationService
        .getPolicyList(swarmName)
        .map(
          async (policyName) =>
            [
              policyName,
              await this.policyPublicService.hasBan(
                swarmName,
                METHOD_NAME_COMPUTE_STATE,
                clientId,
                policyName
              ),
            ] as const
        )
    );

    const result: Record<string, unknown> = {
      swarmStatus: {
        swarmName,
        agentName,
      },
      policyBans: Object.fromEntries(policyBans),
    };
    {
      const stateFetchSet = new Set<StateName>();
      await Promise.all(
        this.swarmValidationService
          .getAgentList(swarmName)
          .flatMap((agentName) =>
            this.agentValidationService.getStateList(agentName)
          )
          .filter((stateName) => !!stateName)
          .map(async (stateName) => {
            if (stateFetchSet.has(stateName)) {
              return;
            }
            stateFetchSet.add(stateName);
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
    }
    return result;
  };

  /**
   * Retrieves the number of active executions for a client’s session.
   * Used to monitor execution frequency, reflecting IClientPerfomanceRecord.executionCount.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {number} The number of executions recorded for the client, or 0 if none.
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
   * Retrieves the total execution time for a client’s sessions, in milliseconds.
   * Used for performance analysis, feeding into IClientPerfomanceRecord.executionTimeTotal.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {number} The total execution time in milliseconds, or 0 if none.
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
   * Calculates the average execution time per execution for a client’s sessions, in milliseconds.
   * Used for performance metrics, contributing to IClientPerfomanceRecord.executionTimeAverage.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {number} The average execution time in milliseconds, or 0 if no executions.
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
   * Calculates the average input length per execution for a client’s sessions.
   * Used for data throughput analysis, feeding into IClientPerfomanceRecord.executionInputAverage.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {number} The average input length (e.g., bytes, characters), or 0 if no executions.
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
   * Calculates the average output length per execution for a client’s sessions.
   * Used for data throughput analysis, feeding into IClientPerfomanceRecord.executionOutputAverage.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {number} The average output length (e.g., bytes, characters), or 0 if no executions.
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
   * Retrieves the total input length for a client’s sessions.
   * Used for data volume tracking, aligning with IClientPerfomanceRecord.executionInputTotal.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {number} The total input length (e.g., bytes, characters), or 0 if none.
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
   * Retrieves the total output length for a client’s sessions.
   * Used for data volume tracking, aligning with IClientPerfomanceRecord.executionOutputTotal.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {number} The total output length (e.g., bytes, characters), or 0 if none.
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
   * Retrieves the list of active session client IDs.
   * Sources data from sessionValidationService, used in toRecord to enumerate clients.
   * @returns {string[]} An array of client IDs with active sessions.
   */
  public getActiveSessions = (): string[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getActiveSessions");
    return this.sessionValidationService.getSessionList();
  };

  /**
   * Calculates the average response time across all executions, in milliseconds.
   * Used for system-wide performance metrics, feeding into IPerformanceRecord.averageResponseTime.
   * @returns {number} The average response time in milliseconds, or 0 if no requests.
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
   * Retrieves the total number of executions across all clients.
   * Used for system-wide metrics, aligning with IPerformanceRecord.totalExecutionCount.
   * @returns {number} The total execution count.
   */
  public getTotalExecutionCount = (): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getTotalExecutionCount");
    return this.totalRequestCount;
  };

  /**
   * Retrieves the total response time across all executions, in milliseconds.
   * Used for system-wide metrics, feeding into IPerformanceRecord.totalResponseTime.
   * @returns {number} The total response time in milliseconds.
   */
  public getTotalResponseTime = (): number => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("perfService getTotalResponseTime");
    return this.totalResponseTime;
  };

  /**
   * Starts tracking an execution for a client, recording start time and input length.
   * Initializes maps and increments execution count/input length, used with endExecution to measure performance (e.g., ClientAgent.execute).
   * @param {string} executionId - The unique identifier of the execution (e.g., a command or tool call).
   * @param {string} clientId - The unique identifier of the client.
   * @param {number} inputLen - The length of the input data (e.g., bytes, characters).
   * @returns {void}
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
    clientMap.get(executionId)!.unshift(startTime);
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
   * Ends tracking an execution for a client, calculating response time and updating output length.
   * Pairs with startExecution to compute execution duration, updating totals for IClientPerfomanceRecord metrics.
   * @param {string} executionId - The unique identifier of the execution.
   * @param {string} clientId - The unique identifier of the client.
   * @param {number} outputLen - The length of the output data (e.g., bytes, characters).
   * @returns {boolean} True if the execution was successfully ended (start time found), false otherwise.
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
   * Serializes performance metrics for a specific client into an IClientPerfomanceRecord.
   * Aggregates execution counts, input/output lengths, times, memory, and state, used in toRecord for per-client data.
   * @param {string} clientId - The unique identifier of the client.
   * @returns {Promise<IClientPerfomanceRecord>} A promise resolving to the client’s performance record.
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
      executionInputAverage: +executionInputAverage.toFixed(2),
      executionOutputAverage: +executionOutputAverage.toFixed(2),
      executionTimeTotal: msToTime(executionTimeTotal),
      executionTimeAverage: msToTime(executionTimeAverage),
    };
  };

  /**
   * Serializes performance metrics for all clients into an IPerformanceRecord.
   * Aggregates client records, total execution counts, and response times, used for system-wide performance reporting.
   * @returns {Promise<IPerformanceRecord>} A promise resolving to the complete performance record.
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
   * Disposes of all performance data associated with a client.
   * Clears maps for the clientId, used to reset or terminate tracking (e.g., session end in ClientAgent).
   * @param {string} clientId - The unique identifier of the client.
   * @returns {void}
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

/**
 * Default export of the PerfService class.
 * Provides the primary interface for performance tracking and reporting in the swarm system.
 * @type {typeof PerfService}
 */
export default PerfService;
