import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { AgentName } from "../../interfaces/Agent.interface";

/**
 * @private Constant defining the method name for logging and validation purposes.
 * Used as an identifier in log messages and validation checks to track calls to `hasNavigation`.
 */
const METHOD_NAME = "function.common.hasNavigation";

/**
 * Function implementation
 */
const hasNavigationInternal = async (clientId: string, agentName: AgentName) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, { clientId });

  swarm.agentValidationService.validate(agentName, METHOD_NAME);
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);

  const swarmName = swarm.sessionValidationService.getSwarm(clientId);
  return swarm.navigationValidationService
    .getNavigationRoute(clientId, swarmName)
    .has(agentName);
};

/**
 * Checks if a specific agent is part of the navigation route for a given client.
 * Validates the agent and client session, retrieves the associated swarm, and queries the navigation route.
 * Logs the operation if enabled by global configuration.
 * @param {string} clientId - The unique identifier of the client whose navigation route is being checked.
 * @param {AgentName} agentName - The name of the agent to check within the navigation route.
 * @returns {Promise<boolean>} A promise resolving to true if the agent is in the navigation route, false otherwise.
 */
export async function hasNavigation(clientId: string, agentName: AgentName) {
  return await hasNavigationInternal(clientId, agentName);
}
