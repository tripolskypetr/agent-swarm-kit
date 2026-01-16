import { ICompletionSchema } from "../../interfaces/Completion.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import mapCompletionSchema from "../../helpers/mapCompletionSchema";
import { IBaseMessage } from "../../contract/BaseMessage.contract";
import { IBaseCompletionArgs } from "../../contract/BaseCompletion.contract";

const METHOD_NAME = "function.test.overrideCompletion";

/**
 * Type representing a partial completion schema with required completionName.
 * Used for overriding existing completion configurations with selective updates.
 * Combines required completion name with optional completion properties.
 * @template Message - The type of message, extending IBaseMessage with any role type.
 * @template Args - The type of completion arguments.
 */
type TCompletionSchema<
  Message extends IBaseMessage<string> = IBaseMessage<any>,
  Args extends IBaseCompletionArgs<
    IBaseMessage<string>
  > = IBaseCompletionArgs<Message>
> = {
  completionName: ICompletionSchema<Message, Args>["completionName"];
} & Partial<ICompletionSchema<Message, Args>>;

/**
 * Function implementation
 */
const overrideCompletionInternal = beginContext(
  async (publicCompletionSchema: TCompletionSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        completionSchema: publicCompletionSchema,
      });

    await swarm.agentValidationService.validate(publicCompletionSchema.completionName, METHOD_NAME);

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
 * @template Message - The type of message, extending IBaseMessage with any role type.
 * @template Args - The type of completion arguments.
 * @param {TCompletionSchema<Message, Args>} completionSchema - The schema definition for completion.
 * @throws {Error} If the completion schema service encounters an error during the override operation (e.g., invalid completionName or schema).
 *
 * @example
 * // Override a completion's schema with new properties
 * overrideCompletion({
 *   completionName: "TextCompletion",
 *   model: "gpt-4",
 *   maxTokens: 500,
 * });
 * // Logs the operation (if enabled) and updates the completion schema in the swarm.
 */
export async function overrideCompletion<
  Message extends IBaseMessage<any> = IBaseMessage<string>,
  Args extends IBaseCompletionArgs<
    IBaseMessage<string>
  > = IBaseCompletionArgs<Message>
>(completionSchema: TCompletionSchema<Message, Args>) {
  return await overrideCompletionInternal(completionSchema);
}
