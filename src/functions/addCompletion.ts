import { ICompletionSchema } from "../interfaces/Completion.interface";
import swarm from "../lib";

export const addCompletion = (completionSchema: ICompletionSchema) => {
    swarm.loggerService.log('function addCompletion', {
        completionSchema,
    });
    swarm.completionValidationService.addCompletion(completionSchema.completionName);
    swarm.completionSchemaService.register(completionSchema.completionName, completionSchema);
    return completionSchema.completionName;
};
