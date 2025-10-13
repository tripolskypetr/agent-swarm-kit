import { IAdvisorSchema } from "../../interfaces/Advisor.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideAdvisor";

/**
 * Type representing a partial advisor schema configuration.
 * Used for advisor service configuration with optional properties.
*/
type TAdvisorSchema = {
  advisorName: IAdvisorSchema["advisorName"];
} & Partial<IAdvisorSchema>;

/**
 * Function implementation
*/
const overrideAdvisorInternal = beginContext((publicAdvisorSchema: TAdvisorSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      advisorSchema: publicAdvisorSchema,
    });

  const advisorSchema = removeUndefined(publicAdvisorSchema);

  return swarm.advisorSchemaService.override(advisorSchema.advisorName, advisorSchema);
});

/**
 * Overrides an existing advisor schema in the swarm system with a new or partial schema.
 * This function updates the configuration of an advisor identified by its `advisorName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 *
 * @param {TAdvisorSchema} advisorSchema - The schema definition for advisor.
 * @throws {Error} If the advisor schema service encounters an error during the override operation (e.g., invalid advisorName or schema).
 *
 * @example
 * // Override an advisor's schema with new properties
 * overrideAdvisor({
 *   advisorName: "KnowledgeBase",
 *   description: "Updated knowledge repository",
 *   storage: "AdvisorStorage",
 * });
 * // Logs the operation (if enabled) and updates the advisor schema in the swarm.
*/
export function overrideAdvisor(advisorSchema: TAdvisorSchema) {
  return overrideAdvisorInternal(advisorSchema);
}
