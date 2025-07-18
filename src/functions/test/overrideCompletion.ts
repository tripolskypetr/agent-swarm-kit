import { ICompletionSchema } from "../../interfaces/Completion.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideCompletion";

type TCompletionSchema = {
  completionName: ICompletionSchema["completionName"];
} & Partial<ICompletionSchema>;

/**
 * Function implementation
 */
const overrideCompletionInternal = beginContext(
  (publicCompletionSchema: TCompletionSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        completionSchema: publicCompletionSchema,
      });

    const completionSchema = removeUndefined(publicCompletionSchema);

    return swarm.completionSchemaService.override(
      completionSchema.completionName,
      completionSchema
    );
  }
);

/**
 * Overrides an existing completion schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a completion mechanism identified by its `completionName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @param {TCompletionSchema} completionSchema - The schema containing the completion’s unique name and optional properties to override.
 * @param {string} completionSchema.completionName - The unique identifier of the completion to override, matching `ICompletionSchema["completionName"]`.
 * @param {Partial<ICompletionSchema>} [completionSchema] - Optional partial schema properties to update, extending `ICompletionSchema`.
 * @returns {void} No return value; the override is applied directly to the swarm’s completion schema service.
 * @throws {Error} If the completion schema service encounters an error during the override operation (e.g., invalid completionName or schema).
 *
 * @example
 * // Override a completion’s schema with new properties
 * overrideCompletion({
 *   completionName: "TextCompletion",
 *   model: "gpt-4",
 *   maxTokens: 500,
 * });
 * // Logs the operation (if enabled) and updates the completion schema in the swarm.
 */
export function overrideCompletion(completionSchema: TCompletionSchema) {
  return overrideCompletionInternal(completionSchema);
}
