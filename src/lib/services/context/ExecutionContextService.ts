import { scoped } from "di-scoped";

/**
 * Interface representing the context.
 */
export interface IExecutionContext {
  clientId: string;
  executionId: string;
}

/**
 * Service providing execution context information.
 */
export const ExecutionContextService = scoped(
  class {
    /**
     * Creates an instance of ExecutionContextService.
     * @param {IExecutionContext} context - The context object.
     */
    constructor(readonly context: IExecutionContext) {}
  }
);

/**
 * Type representing an instance of ExecutionContextService.
 */
export type TExecutionContextService = InstanceType<typeof ExecutionContextService>;

export default ExecutionContextService;
