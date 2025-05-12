import { IStateSchema } from "../../interfaces/State.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addState";

/**
 * Function implementation
 */
const addStateInternal = beginContext((stateSchema: IStateSchema) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      stateSchema,
    });

  // Register the policy with StateValidationService for runtime validation
  swarm.stateValidationService.addState(
    stateSchema.stateName,
    stateSchema
  );

  // Register the state in the schema service
  swarm.stateSchemaService.register(stateSchema.stateName, stateSchema);

  // If the state is shared, initialize and wait for the shared state connection
  if (stateSchema.shared) {
    swarm.sharedStateConnectionService
      .getStateRef(stateSchema.stateName)
      .waitForInit();
  }

  // Return the state's name as confirmation of registration
  return stateSchema.stateName;
});

/**
 * Adds a new state to the state registry for use within the swarm system.
 *
 * This function registers a new state, enabling the swarm to manage and utilize it for agent operations or shared data persistence.
 * Only states registered through this function are recognized by the swarm. If the state is marked as shared, it initializes a connection
 * to the shared state service and waits for its initialization. The execution is wrapped in `beginContext` to ensure it runs outside of
 * existing method and execution contexts, providing a clean execution environment. The function logs the operation if enabled and returns
 * the state's name upon successful registration.
 *
 * @template T - The type of data stored in the state (defaults to `any` if unspecified).
 * @param {IStateSchema<T>} stateSchema - The schema defining the state's properties, including its name (`stateName`), shared status (`shared`), and other configuration details.
 * @returns {string} The name of the newly added state (`stateSchema.stateName`), confirming its registration.
 * @throws {Error} If the state schema is invalid, registration fails (e.g., duplicate state name), or shared state initialization encounters an error.
 * @example
 * const stateSchema = { stateName: "UserPrefs", shared: true, initialValue: { theme: "dark" } };
 * const stateName = addState(stateSchema);
 * console.log(stateName); // Outputs "UserPrefs"
 */
export function addState<T extends unknown = any>(stateSchema: IStateSchema<T>) {
  return addStateInternal(stateSchema);
}
