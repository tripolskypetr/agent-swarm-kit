import { IStateSchema } from "../../interfaces/State.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideState";

/**
 * Type representing a partial state schema configuration.
 * Used for state management with optional properties.
 */
type TStateSchema<T extends unknown = any> = {
  stateName: IStateSchema<T>["stateName"];
} & Partial<IStateSchema<T>>;

/**
 * Function implementation
 */
const overrideStateInternal = beginContext((publicStateSchema: TStateSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      stateSchema: publicStateSchema,
    });

  const stateSchema = removeUndefined(publicStateSchema);

  return swarm.stateSchemaService.override(stateSchema.stateName, stateSchema);
});

/**
 * Overrides an existing state schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a state identified by its `stateName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @template T - The type of the state data, defaults to `any`.
 * @throws {Error} If the state schema service encounters an error during the override operation (e.g., invalid stateName or schema).
 *
 * @example
 * // Override a state’s schema with new properties
 * overrideState({
 *   stateName: "UserPreferences",
 *   persist: true,
 *   getDefaultState: () => ({ theme: "dark" }),
 * });
 * // Logs the operation (if enabled) and updates the state schema in the swarm.
 */
export function overrideState<T extends unknown = any>(
  stateSchema: TStateSchema<T>
): IStateSchema<T> {
  return overrideStateInternal(stateSchema);
}
