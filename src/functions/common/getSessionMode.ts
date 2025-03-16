import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.common.getSessionMode";

/**
 * Retrieves the session mode for a given client session in a swarm.
 *
 * This function returns the current mode of the specified client session, which can be one of `"session"`, `"makeConnection"`, or `"complete"`.
 * It validates the client session and associated swarm, logs the operation if enabled, and fetches the session mode using the session validation service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 * @param {string} clientId - The unique identifier of the client session whose mode is being retrieved.
 * @returns {Promise<"session" | "makeConnection" | "complete">} A promise that resolves to the session mode, indicating the current state of the session.
 * @throws {Error} If the client session is invalid, the swarm validation fails, or the session validation service encounters an error during mode retrieval.
 * @example
 * const mode = await getSessionMode("client-123");
 * console.log(mode); // Outputs "session", "makeConnection", or "complete"
 */
export const getSessionMode = beginContext(async (clientId: string) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  // Validate the session and swarm to ensure they exist and are accessible
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

  // Retrieve the session mode from the session validation service
  return swarm.sessionValidationService.getSessionMode(clientId);
});
