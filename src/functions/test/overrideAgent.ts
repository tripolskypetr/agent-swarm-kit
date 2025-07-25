import { IAgentSchema } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import mapAgentSchema from "../../helpers/mapAgentSchema";

const METHOD_NAME = "function.test.overrideAgent";

type TAgentSchema = {
  agentName: IAgentSchema["agentName"];
} & Partial<IAgentSchema>;

/**
 * Function implementation
 */
const overrideAgentInternal = beginContext(
  (publicAgentSchema: TAgentSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        agentSchema: publicAgentSchema,
      });

    const agentSchema = mapAgentSchema(publicAgentSchema);

    return swarm.agentSchemaService.override(
      agentSchema.agentName,
      agentSchema
    );
  }
);

/**
 * Overrides an existing agent schema in the swarm system with a new or partial schema.
 * This function updates the configuration of an agent identified by its `agentName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @param {TAgentSchema} agentSchema - The schema containing the agent’s unique name and optional properties to override.
 * @param {string} agentSchema.agentName - The unique identifier of the agent to override, matching `IAgentSchemaInternal["agentName"]`.
 * @param {Partial<IAgentSchemaInternal>} [agentSchema] - Optional partial schema properties to update, extending `IAgentSchemaInternal`.
 * @returns {void} No return value; the override is applied directly to the swarm’s agent schema service.
 * @throws {Error} If the agent schema service encounters an error during the override operation (e.g., invalid agentName or schema).
 *
 * @example
 * // Override an agent’s schema with new properties
 * overrideAgent({
 *   agentName: "WeatherAgent",
 *   description: "Updated weather query handler",
 *   tools: ["getWeather"],
 * });
 * // Logs the operation (if enabled) and updates the agent schema in the swarm.
 */
export function overrideAgent(agentSchema: TAgentSchema) {
  return overrideAgentInternal(agentSchema);
}
