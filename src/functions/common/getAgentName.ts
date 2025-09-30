import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.common.getAgentName";

/**
 * Function implementation
*/
const getAgentNameInternal = beginContext(async (clientId: string) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  // Validate the session and swarm to ensure they exist and are accessible
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);

  // Retrieve the active agent name via the swarm public service
  return await swarm.swarmPublicService.getAgentName(
    METHOD_NAME,
    clientId,
    swarmName
  );
});

/**
 * Retrieves the name of the active agent for a given client session in a swarm.
 *
 * This function fetches the name of the currently active agent associated with the specified client session within a swarm.
 * It validates the client session and swarm, logs the operation if enabled, and delegates the retrieval to the swarm public service.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 *
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @throws {Error} If the client session is invalid, the swarm validation fails, or the swarm public service encounters an error during retrieval.
 * @example
 * const agentName = await getAgentName("client-123");
 * console.log(agentName); // Outputs "AgentX"
*/
export async function getAgentName(clientId: string) {
  return await getAgentNameInternal(clientId);
}
