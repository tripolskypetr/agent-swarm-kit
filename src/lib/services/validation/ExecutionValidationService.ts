/**
 * @module ExecutionValidationService
 * @description Service for validating and managing execution counts for client sessions in a swarm context.
 */
import { inject } from "../../../lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../../lib/core/types";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { LimitedSet, memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";
import SessionValidationService from "./SessionValidationService";

/**
 * @typedef {string} ExecutionId
 * @description A unique identifier for an execution instance.
 */
type ExecutionId = string;

/**
 * @class ExecutionValidationService
 * @description Manages execution count validation to prevent excessive nested executions within a swarm.
 */
export class ExecutionValidationService {
  /**
   * @private
   * @type {LoggerService}
   * @description Injected logger service for logging execution-related information.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @private
   * @type {SessionValidationService}
   * @description Injected session validation service for checking client sessions and swarm associations.
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Retrieves a memoized set of execution IDs for a given client and swarm.
   * @param {string} clientId - The unique identifier for the client.
   * @param {SwarmName} swarmName - The name of the swarm associated with the client.
   * @returns {Set<ExecutionId>} A set containing execution IDs for the client and swarm.
   */
  public getExecutionCount = memoize<
    (clientId: string, swarmName: SwarmName) => {
      executionSet: Set<ExecutionId>,
      executionIgnore: LimitedSet<ExecutionId>,
    }
  >(
    ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    () => ({
      executionSet: new Set<ExecutionId>(),
      executionIgnore: new LimitedSet<ExecutionId>(
        GLOBAL_CONFIG.CC_MAX_NESTED_EXECUTIONS
      ),
    })
  );

  /**
   * Increments the execution count for a client and checks for excessive nested executions.
   * @param {string} executionId - The unique identifier for the execution.
   * @param {string} clientId - The unique identifier for the client.
   * @param {SwarmName} swarmName - The name of the swarm associated with the client.
   * @throws {Error} If the maximum nested execution limit is reached.
   * @returns {void}
   */
  public incrementCount = (
    executionId: string,
    clientId: string,
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("executionValidationService incrementCount", {
        clientId,
        executionId,
      });
    if (!this.sessionValidationService.hasSession(clientId)) {
      return;
    }

    const swarmName = this.sessionValidationService.getSwarm(clientId);

    const { executionSet, executionIgnore } = this.getExecutionCount(clientId, swarmName);

    if (!executionIgnore.has(executionId)) {
      executionSet.add(executionId);
      executionIgnore.add(executionId);
    }

    if (executionSet.size >= GLOBAL_CONFIG.CC_MAX_NESTED_EXECUTIONS) {
      const ids = [...executionSet].join(",");
      const msg = `agent-swarm recursive execution prevented for clientId=${clientId} swarmName=${swarmName} executionId=${executionId} size=${executionSet.size} ids=${ids}`;
      console.error(msg);
      throw new Error(msg);
    }
  };

  /**
   * Resets the execution count for a client and swarm.
   * @param {string} executionId - The unique identifier for the execution.
   * @param {string} clientId - The unique identifier for the client.
   * @param {SwarmName} swarmName - The name of the swarm associated with the client.
   * @returns {void}
   */
  public decrementCount = (
    executionId: string,
    clientId: string,
    swarmName: SwarmName
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("executionValidationService decrementCount", {
        clientId,
        executionId,
        swarmName,
      });
    if (!this.sessionValidationService.hasSession(clientId)) {
      return;
    }
    const { executionSet, executionIgnore } = this.getExecutionCount(clientId, swarmName);
    executionSet.delete(executionId);
    executionIgnore.add(executionId);
  };

  /**
   * Clears all tracked execution IDs for a specific client and swarm.
   * This effectively resets the execution count for the given client and swarm context,
   * but does not remove the memoized entry itself.
   *
   * @param {string} clientId - The unique identifier for the client.
   * @param {SwarmName} swarmName - The name of the swarm associated with the client.
   * @returns {void}
   */
  public flushCount = (clientId: string, swarmName: SwarmName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("executionValidationService dispose", {
        clientId,
        swarmName,
      });
    if (!this.sessionValidationService.hasSession(clientId)) {
      return;
    }
    const { executionSet } = this.getExecutionCount(clientId, swarmName);
    executionSet.clear();
  }

  /**
   * Clears the memoized execution count for a specific client and swarm.
   * @param {string} clientId - The unique identifier for the client.
   * @param {SwarmName} swarmName - The name of the swarm associated with the client.
   * @returns {void}
   */
  public dispose = (clientId: string, swarmName: SwarmName): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("executionValidationService dispose", {
        clientId,
        swarmName,
      });
    this.getExecutionCount.clear(`${clientId}-${swarmName}`);
  };
}

export default ExecutionValidationService;
