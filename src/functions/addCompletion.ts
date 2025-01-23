import { CompletionName, ICompletionSchema } from "../interfaces/Completion.interface";
import swarm from "../lib";

export const addCompletion = (completionName: CompletionName, completionSchema: ICompletionSchema) => {
    swarm.completionValidationService.addCompletion(completionName);
    swarm.completionSchemaService.register(completionName, completionSchema);
};
