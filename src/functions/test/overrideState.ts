import { IStateSchema } from "../../interfaces/State.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideState";

type TStateSchema<T extends unknown = any> = {
  stateName: IStateSchema<T>["stateName"];
} & Partial<IStateSchema<T>>;

/**
 * Overrides an existing state schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a state identified by its `stateName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @template T - The type of the state data, defaults to `any`.
 * @param {TStateSchema<T>} stateSchema - The schema containing the state’s unique name and optional properties to override.
 * @param {string} stateSchema.stateName - The unique identifier of the state to override, matching `IStateSchema<T>["stateName"]`.
 * @param {Partial<IStateSchema<T>>} [stateSchema] - Optional partial schema properties to update, extending `IStateSchema<T>`.
 * @returns {IStateSchema<T>} The updated state schema as applied by the swarm’s state schema service.
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
export const overrideState = beginContext((stateSchema: TStateSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      stateSchema,
    });

  return swarm.stateSchemaService.override(stateSchema.stateName, stateSchema);
}) as <T extends unknown = any>(
  stateSchema: TStateSchema<T>
) => IStateSchema<T>;
