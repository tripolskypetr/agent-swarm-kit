import { ISwarmSchema } from "../../interfaces/Swarm.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideSwarm";

/**
 * Type representing a partial swarm schema configuration.
 * Used for swarm configuration with optional properties.
*/
type TSwarmSchema = {
  swarmName: ISwarmSchema["swarmName"];
} & Partial<ISwarmSchema>;

/**
 * Function implementation
*/
const overrideSwarmInternal = beginContext(async (publicSwarmSchema: TSwarmSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      swarmSchema: publicSwarmSchema,
    });

  await swarm.agentValidationService.validate(publicSwarmSchema.swarmName, METHOD_NAME);

  const swarmSchema = removeUndefined(publicSwarmSchema);

  return swarm.swarmSchemaService.override(swarmSchema.swarmName, swarmSchema);
});

/**
 * Overrides an existing swarm schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a swarm identified by its `swarmName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 *
 * @param {TSwarmSchema} swarmSchema - The schema definition for swarm.
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
export async function overrideSwarm(swarmSchema: TSwarmSchema) {
  return await overrideSwarmInternal(swarmSchema);
}
