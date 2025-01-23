import { CompletionName, ICompletionSchema } from "src/interfaces/Completion.interface";
import swarm from "src/lib";

export const addCompletion = (completionName: CompletionName, completionSchema: ICompletionSchema) => {
    swarm.completionValidationService.addCompletion(completionName);
    swarm.completionSchemaService.register(completionName, completionSchema);
};
