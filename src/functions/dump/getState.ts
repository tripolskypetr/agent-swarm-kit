import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { StateName } from "../../interfaces/State.interface";

const METHOD_NAME = "function.dump.getState";

/**
 * Retrieves a state schema by its name from the swarm's state schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getState
 * @param {StateName} stateName - The name of the state to retrieve.
 * @returns The state schema associated with the provided state name.
 */
export function getState(stateName: StateName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      stateName,
    });
  return swarm.stateSchemaService.get(stateName);
}
