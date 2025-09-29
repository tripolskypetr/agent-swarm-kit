import beginContext from "../../utils/beginContext";
import { GLOBAL_CONFIG } from "../../config/params";
import swarm from "../../lib";

const METHOD_NAME = "function.history.getRawHistory";

/**
 * Function implementation
 */
export const getRawHistoryInternal = beginContext(async (
  clientId: string,
  methodName: string,
) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
    });

  // Validate the session and swarm
  swarm.sessionValidationService.validate(clientId, methodName);
  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  swarm.swarmValidationService.validate(swarmName, methodName);

  // Get the current agent and fetch raw history
  const agentName = await swarm.swarmPublicService.getAgentName(
    methodName,
    clientId,
    swarmName
  );
  const history = await swarm.historyPublicService.toArrayForRaw(
    methodName,
    clientId,
    agentName
  );
  return [...history];
});

/**
 * Retrieves the raw, unmodified history for a given client session.
 *
 * This function fetches the complete history associated with a client’s active agent in a swarm session, without any filtering or modifications.
 * It is wrapped in `beginContext` for a clean execution environment and logs the operation if enabled via `GLOBAL_CONFIG`. The function validates
 * the session and swarm, retrieves the current agent, and uses `historyPublicService.toArrayForRaw` to obtain the raw history as an array.
 * The result is a fresh copy of the history array.
 *
 *
 * @param {string} clientId - The unique identifier of the client session.
 * @throws {Error} If session or swarm validation fails, or if history retrieval encounters an issue.
 * @example
 * const rawHistory = await getRawHistory("client-123");
 * console.log(rawHistory); // Outputs the full raw history array
 */
export async function getRawHistory(clientId: string) {
  return await getRawHistoryInternal(clientId, METHOD_NAME);
}
