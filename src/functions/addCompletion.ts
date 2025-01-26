import { ICompletionSchema } from "../interfaces/Completion.interface";
import swarm from "../lib";

/**
 * Adds a completion engine for agents. Agents could use different models and
 * framewords for completion like: mock, gpt4all, ollama, openai
 * 
 * @param {ICompletionSchema} completionSchema - The completion schema to be added.
 * @returns {string} The name of the completion that was added.
 */
export const addCompletion = (completionSchema: ICompletionSchema) => {
    swarm.loggerService.log('function addCompletion', {
        completionSchema,
    });
    swarm.completionValidationService.addCompletion(completionSchema.completionName);
    swarm.completionSchemaService.register(completionSchema.completionName, completionSchema);
    return completionSchema.completionName;
};
