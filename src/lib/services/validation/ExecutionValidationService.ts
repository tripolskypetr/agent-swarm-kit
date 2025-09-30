/**
 * @module ExecutionValidationService
 * Service for validating and managing execution counts for client sessions in a swarm context.
*/
import { inject } from "../../../lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../../lib/core/types";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { LimitedSet, memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";
import SessionValidationService from "./SessionValidationService";

/**
 * A unique identifier for an execution instance.
 * Used to track and manage execution flows within the swarm.
*/
type ExecutionId = string;

/**
 * @class ExecutionValidationService
 * Manages execution count validation to prevent excessive nested executions within a swarm.
*/
export class ExecutionValidationService {
  /**
   * @private
   * Injected logger service for logging execution-related information.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @private
   * Injected session validation service for checking client sessions and swarm associations.
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Retrieves a memoized set of execution IDs for a given client and swarm.
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
   * @throws {Error} If the maximum nested execution limit is reached.
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
