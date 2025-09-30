import swarm, {
  ExecutionContextService,
  MethodContextService,
} from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { IMethodContext } from "../../lib/services/context/MethodContextService";
import { IExecutionContext } from "../../lib/services/context/ExecutionContextService";

const METHOD_NAME = "function.common.getSessionContext";

/**
 * Represents the session context, encapsulating client, method, and execution metadata.
 *
 * This interface defines the structure of the session context returned by `getSessionContext`, providing information about the client session,
 * the current method context (if available), and the execution context (if available) within the swarm system.
*/
export interface ISessionContext {
  /**
   * The unique identifier of the client session, or null if not available from either context.
   * Derived from either the method context or execution context.
  */
  clientId: string | null;
  /**
   * The unique identifier of the process, sourced from GLOBAL_CONFIG.CC_PROCESS_UUID.
   * Identifies the current swarm process instance.
  */
  processId: string;
  /**
   * The current method context, or null if no method context is active.
   * Provides access to method-specific metadata and client information.
  */
  methodContext: IMethodContext | null;
  /**
   * The current execution context, or null if no execution context is active.
   * Provides access to execution-specific metadata and state information.
  */
  executionContext: IExecutionContext | null;
}

/**
 * Function implementation
*/
const getSessionContextInternal = async (): Promise<ISessionContext> => {
  // Log the operation if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME);

  // Determine the method context, if active
  const methodContext = MethodContextService.hasContext()
    ? swarm.methodContextService.context
    : null;

  // Determine the execution context, if active
  const executionContext = ExecutionContextService.hasContext()
    ? swarm.executionContextService.context
    : null;

  // Derive the client ID from either the method or execution context, if available
  const clientId = methodContext?.clientId ?? executionContext?.clientId;

  // Return the constructed session context
  return {
    clientId,
    processId: GLOBAL_CONFIG.CC_PROCESS_UUID,
    methodContext,
    executionContext,
  };
};

/**
 * Retrieves the session context for the current execution environment.
 *
 * This function constructs and returns the session context, including the client ID, process ID, and available method and execution contexts.
 * It logs the operation if enabled, checks for active contexts using the `MethodContextService` and `ExecutionContextService`, and derives the client ID from either context if available.
 * Unlike other functions, it does not perform explicit validation or require a `clientId` parameter, as it relies on the current execution environment's state.
 *
 * @throws {Error} If an unexpected error occurs while accessing the method or execution context services (though typically none are thrown in this implementation).
 * @example
 * const context = await getSessionContext();
 * console.log(context); // Outputs { clientId: "client-123", processId: "uuid-xyz", methodContext: {...}, executionContext: {...} }
*/
export async function getSessionContext() {
  return await getSessionContextInternal();
}
