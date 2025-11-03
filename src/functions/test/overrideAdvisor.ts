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
type TAdvisorSchema<T = string> = {
  advisorName: IAdvisorSchema<T>["advisorName"];
} & Partial<IAdvisorSchema<T>>;

/**
 * Function implementation
 */
const overrideAdvisorInternal = beginContext(
  (publicAdvisorSchema: TAdvisorSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        advisorSchema: publicAdvisorSchema,
      });

    const advisorSchema = removeUndefined(publicAdvisorSchema);

    return swarm.advisorSchemaService.override(
      advisorSchema.advisorName,
      advisorSchema
    );
  }
);

/**
 * Overrides an existing advisor schema in the swarm system with a new or partial schema.
 * This function updates the configuration of an advisor identified by its `advisorName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 * Only the provided properties will be updated - omitted properties remain unchanged.
 *
 * @function overrideAdvisor
 * @template T - The type of message content the advisor accepts (defaults to string). Can be a custom object, Blob, or string.
 * @param {TAdvisorSchema<T>} advisorSchema - Partial schema definition for advisor. Must include `advisorName`, other properties are optional.
 * @returns {IAdvisorSchema<T>} The updated complete advisor schema.
 * @throws {Error} If the advisor schema service encounters an error during the override operation (e.g., invalid advisorName or schema).
 *
 * @example
 * // Override advisor's description only
 * overrideAdvisor({
 *   advisorName: "KnowledgeBase",
 *   docDescription: "Updated knowledge repository",
 * });
 *
 * @example
 * // Override advisor with custom message type
 * interface CustomMessage { query: string; context: string[] }
 * overrideAdvisor<CustomMessage>({
 *   advisorName: "StructuredAdvisor",
 *   getChat: async (args) => `Query: ${args.message.query}`
 * });
 */
export function overrideAdvisor<T = string>(advisorSchema: TAdvisorSchema<T>) {
  return overrideAdvisorInternal(
    advisorSchema as TAdvisorSchema
  ) as TAdvisorSchema<T>;
}
