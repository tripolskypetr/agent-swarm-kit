import { ICompletionSchema } from "../interfaces/Completion.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

const METHOD_NAME = "function.addCompletion";

/**
 * Adds a completion engine for agents. Agents could use different models and
 * framewords for completion like: mock, gpt4all, ollama, openai
 *
 * @param {ICompletionSchema} completionSchema - The completion schema to be added.
 * @returns {string} The name of the completion that was added.
 */
export const addCompletion = (completionSchema: ICompletionSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      completionSchema,
    });
  swarm.completionValidationService.addCompletion(
    completionSchema.completionName
  );
  swarm.completionSchemaService.register(
    completionSchema.completionName,
    completionSchema
  );
  return completionSchema.completionName;
};
