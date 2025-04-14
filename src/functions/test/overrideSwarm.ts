import { ISwarmSchema } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideSwarm";

type TSwarmSchema = {
  swarmName: ISwarmSchema["swarmName"];
} & Partial<ISwarmSchema>;

/**
 * Overrides an existing swarm schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a swarm identified by its `swarmName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @param {TSwarmSchema} swarmSchema - The schema containing the swarm’s unique name and optional properties to override.
 * @param {string} swarmSchema.swarmName - The unique identifier of the swarm to override, matching `ISwarmSchema["swarmName"]`.
 * @param {Partial<ISwarmSchema>} [swarmSchema] - Optional partial schema properties to update, extending `ISwarmSchema`.
 * @returns {void} No return value; the override is applied directly to the swarm’s swarm schema service.
 * @throws {Error} If the swarm schema service encounters an error during the override operation (e.g., invalid swarmName or schema).
 *
 * @example
 * // Override a swarm’s schema with new properties
 * overrideSwarm({
 *   swarmName: "MainSwarm",
 *   defaultAgent: "WeatherAgent",
 *   policies: ["ContentFilter"],
 * });
 * // Logs the operation (if enabled) and updates the swarm schema in the swarm system.
 */
export const overrideSwarm = beginContext((swarmSchema: TSwarmSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      swarmSchema,
    });

  return swarm.swarmSchemaService.override(swarmSchema.swarmName, swarmSchema);
});
