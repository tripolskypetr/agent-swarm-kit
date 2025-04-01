import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";

/**
 * @private Constant defining the method name for logging purposes.
 * Used as an identifier in log messages to track calls to `getNavigationRoute`.
 */
const METHOD_NAME = "function.common.getNavigationRoute";

/**
 * Retrieves the navigation route for a given client and swarm.
 * Delegates to `NavigationValidationService.getNavigationRoute` to obtain a `Set` of visited agent names,
 * with optional logging based on global configuration.
 * @param {string} clientId - The unique identifier of the client requesting the navigation route.
 * @param {SwarmName} swarmName - The name of the swarm context for which the route is retrieved.
 * @returns {Set<string>} A set of `AgentName`s representing the visited agents in the navigation route.
 */
export const getNavigationRoute = (clientId: string, swarmName: SwarmName) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      clientId,
      swarmName,
    });
  swarm.sessionValidationService.validate(clientId, METHOD_NAME);
  return swarm.navigationValidationService.getNavigationRoute(
    clientId,
    swarmName
  );
};
