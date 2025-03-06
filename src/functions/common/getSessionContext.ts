import swarm, {
  ExecutionContextService,
  MethodContextService,
} from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { IMethodContext } from "../../lib/services/context/MethodContextService";
import { IExecutionContext } from "../../lib/services/context/ExecutionContextService";

const METHOD_NAME = "function.getSessionContext";

/**
 * Represents the session context.
 *
 * @interface ISessionContext
 * @property {IMethodContext | null} methodContext - The method context, or null if not available.
 * @property {IExecutionContext | null} executionContext - The execution context, or null if not available.
 */
interface ISessionContext {
  methodContext: IMethodContext | null;
  executionContext: IExecutionContext | null;
}

/**
 * Retrieves the session context for a given client ID.
 *
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<ISessionContext>} A promise that resolves to the session context.
 */
export const getSessionContext = async (
  clientId: string
): Promise<ISessionContext> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const methodContext = MethodContextService.hasContext()
    ? swarm.methodContextService.context
    : null;
  const executionContext = ExecutionContextService.hasContext()
    ? swarm.executionContextService.context
    : null;
  return {
    methodContext,
    executionContext,
  };
};
