import { ICompletionSchema } from "../../interfaces/Completion.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addCompletion";

/**
 * Adds a completion engine to the registry for use by agents in the swarm system.
 *
 * This function registers a completion engine, enabling agents to utilize various models and frameworks (e.g., mock, GPT4All, Ollama, OpenAI)
 * for generating completions. The completion schema is added to the validation and schema services, making it available for agent operations.
 * The execution is wrapped in `beginContext` to ensure it runs outside of existing method and execution contexts, providing a clean execution environment.
 * The function logs the operation if enabled and returns the completion's name upon successful registration.
 *
 * @param {ICompletionSchema} completionSchema - The schema defining the completion engine's properties, including its name (`completionName`) and configuration details.
 * @returns {string} The name of the newly added completion (`completionSchema.completionName`), confirming its registration.
 * @throws {Error} If the completion schema is invalid or if registration fails due to conflicts or service errors (e.g., duplicate completion name).
 * @example
 * const completionSchema = { completionName: "OpenAI", model: "gpt-3.5-turbo" };
 * const completionName = addCompletion(completionSchema);
 * console.log(completionName); // Outputs "OpenAI"
 */
export const addCompletion = beginContext(
  (completionSchema: ICompletionSchema) => {
    // Log the operation details if logging is enabled in GLOBAL_CONFIG
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        completionSchema,
      });

    // Register the completion in the validation and schema services
    swarm.completionValidationService.addCompletion(
      completionSchema.completionName
    );
    swarm.completionSchemaService.register(
      completionSchema.completionName,
      completionSchema
    );

    // Return the completion's name as confirmation of registration
    return completionSchema.completionName;
  }
);
