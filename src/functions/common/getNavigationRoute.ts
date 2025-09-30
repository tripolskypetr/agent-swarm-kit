import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { SwarmName } from "../../interfaces/Swarm.interface";

/**
 * @private Constant defining the method name for logging purposes.
 * Used as an identifier in log messages to track calls to `getNavigationRoute`.
*/
const METHOD_NAME = "function.common.getNavigationRoute";

/**
 * Function implementation
*/
const getNavigationRouteInternal = (clientId: string, swarmName: SwarmName) => {
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

/**
 * Retrieves the navigation route for a given client and swarm.
 * Delegates to `NavigationValidationService.getNavigationRoute` to obtain a `Set` of visited agent names,
 * with optional logging based on global configuration.
 * @param {string} clientId - The unique identifier of the client session.
 * @param {SwarmName} swarmName - The name of the swarm to operate on.
*/
export function getNavigationRoute(clientId: string, swarmName: SwarmName) {
  return getNavigationRouteInternal(clientId, swarmName);
}
