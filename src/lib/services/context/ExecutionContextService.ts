import { scoped } from "di-scoped";

/**
 * Interface defining the structure of execution context in the swarm system.
 * Represents metadata for tracking a specific execution, used across services like ClientAgent, PerfService, and BusService.
 * @interface IExecutionContext
*/
export interface IExecutionContext {
  /**
   * The unique identifier of the client session, tying to ClientAgent’s clientId and PerfService’s execution tracking.
  */
  clientId: string;

  /**
   * The unique identifier of the execution instance, used in PerfService (e.g., startExecution) and BusService (e.g., commitExecutionBegin).
  */
  executionId: string;

  /**
   * The unique identifier of the process, sourced from GLOBAL_CONFIG.CC_PROCESS_UUID, used in PerfService’s IPerformanceRecord.processId.
  */
  processId: string;
}

/**
 * Scoped service class providing execution context information in the swarm system.
 * Stores and exposes an IExecutionContext object (clientId, executionId, processId) via dependency injection, scoped using di-scoped for execution-specific instances.
 * Integrates with ClientAgent (e.g., EXECUTE_FN execution context), PerfService (e.g., execution tracking in startExecution), BusService (e.g., execution events in commitExecutionBegin), and LoggerService (e.g., context logging in info).
 * Provides a lightweight, immutable context container for tracking execution metadata across the system.
*/
export const ExecutionContextService = scoped(
  class {
    /**
     * Creates an instance of ExecutionContextService with the provided execution context.
     * Stores the context immutably, making it available to dependent services like LoggerService and BusService via DI.
    */
    constructor(readonly context: IExecutionContext) {}
  }
);

/**
 * Type alias representing an instance of ExecutionContextService.
 * Used in dependency injection (e.g., LoggerService, BusService) to type the injected service, ensuring type safety across the swarm system.
*/
export type TExecutionContextService = InstanceType<
  typeof ExecutionContextService
>;

/**
 * Default export of the ExecutionContextService scoped service.
 * Provides the primary interface for accessing execution context in the swarm system, integrating with ClientAgent, PerfService, BusService, and LoggerService.
*/
export default ExecutionContextService;
