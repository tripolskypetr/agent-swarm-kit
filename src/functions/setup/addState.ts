import { IStateSchema } from "../../interfaces/State.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../..//utils/beginContext";

const METHOD_NAME = "function.setup.addState";

/**
 * Adds a new state to the state registry. The swarm takes only those states which was registered
 *
 * @param {IStateSchema} stateSchema - The schema of the state to be added.
 * @returns {string} The name of the added state.
 */
export const addState = beginContext((stateSchema: IStateSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      stateSchema,
    });
  swarm.stateSchemaService.register(stateSchema.stateName, stateSchema);
  if (stateSchema.shared) {
    swarm.sharedStateConnectionService
      .getStateRef(stateSchema.stateName)
      .waitForInit();
  }
  return stateSchema.stateName;
}) as <T extends unknown = any>(storageSchema: IStateSchema<T>) => string;
