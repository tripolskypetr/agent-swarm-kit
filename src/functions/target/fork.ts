/**
 * @module scope
 * Provides a function to execute a scoped operation with session management, validation, and error handling.
*/

import { AgentName } from "../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";
import beginContext from "../../utils/beginContext";
import { SwarmName } from "../../interfaces/Swarm.interface";
import { disposeConnection } from "./disposeConnection";

/**
 * @constant {string} METHOD_NAME
 * Method name for the scope operation.
 * @private
*/
const METHOD_NAME = "function.target.fork";

/**
 * @interface IScopeOptions
 * Options for the scope operation, including client ID, swarm name, and optional error handler.
*/
export interface IScopeOptions {
  /**
   * The client identifier for the scope operation.
   * Unique identifier used to track and manage the session within the scope.
   */
  clientId: string;

  /**
   * The name of the swarm associated with the scope.
   * Identifies which swarm configuration to use for the scoped operation.
   */
  swarmName: SwarmName;

  /**
   * Optional callback function to handle errors during execution.
   * Called when an error occurs during the scope operation, allowing for custom error handling.
   */
  onError?: (error: Error) => void;
}

/**
 * Function implementation
*/
const forkInternal = beginContext(
  async <T = any>(
    runFn: (clientId: string, agentName: AgentName) => Promise<T | void>,
    { clientId, swarmName, onError }: IScopeOptions
  ): Promise<any> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        clientId,
        swarmName,
      });

    if (swarm.sessionValidationService.hasSession(clientId)) {
      throw new Error(
        `agent-swarm scope Session already exists for clientId=${clientId}`
      );
    }

    swarm.sessionValidationService.addSession(clientId, swarmName, "scope");

    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    swarm.sessionValidationService.validate(clientId, METHOD_NAME);

    const agentName = await swarm.swarmPublicService.getAgentName(
      METHOD_NAME,
      clientId,
      swarmName
    );

    let result: T = null;

    try {
      result = (await runFn(clientId, agentName)) as T;
    } catch (error) {
      console.error(`agent-swarm scope error for clientId=${clientId}`, error);
      onError && onError(error as Error);
    } finally {
      await disposeConnection(clientId, swarmName, METHOD_NAME);
    }

    return result;
  }
);

/**
 * Executes a provided function within a managed scope, handling session creation, validation, and cleanup.
 *
 * @param runFn Function to execute within the managed scope, receiving clientId and agentName as arguments.
 * @param options Configuration options for the scope operation including clientId, swarmName, and optional callbacks.
 * @template T - Type of the result returned by the run function.
 * @throws {Error} If a session already exists for the clientId.
*/
export async function fork<T = any>(
  runFn: (clientId: string, agentName: AgentName) => Promise<T | void>,
  options: IScopeOptions
): Promise<T> {
  return await forkInternal(runFn, options);
}
