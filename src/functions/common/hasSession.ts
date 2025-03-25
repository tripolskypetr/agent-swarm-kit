import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

/** @private Constant defining the method name for logging purposes */
const METHOD_NAME = "function.common.hasSession";

/**
 * Checks if a session exists for the given client ID.
 *
 * This function logs the method name if logging is enabled in the global configuration.
 * It then delegates the session validation to the `swarm.sessionValidationService`.
 *
 * @param {string} clientId - The unique identifier of the client whose session is being validated.
 * @returns {boolean} `true` if the session exists, otherwise `false`.
 */
export const hasSession = (clientId: string) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG && swarm.loggerService.log(METHOD_NAME);
  return swarm.sessionValidationService.hasSession(clientId);
};
