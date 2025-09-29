import { ICompletionSchema } from "../../interfaces/Completion.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import mapCompletionSchema from "../../helpers/mapCompletionSchema";

const METHOD_NAME = "function.test.overrideCompletion";

/**
 * Type representing a partial completion schema with required completionName.
 * Used for overriding existing completion configurations with selective updates.
 * Combines required completion name with optional completion properties.
 */
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

    const completionSchema = mapCompletionSchema(publicCompletionSchema);

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
 *
 * @param {TCompletionSchema} completionSchema - The schema definition for completion.
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
