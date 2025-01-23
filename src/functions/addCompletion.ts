import { AgentName, IAgentSchema } from "src/interfaces/Agent.interface";
import { CompletionName, ICompletionSchema } from "src/interfaces/Completion.interface";
import swarm from "src/lib";

export const addCompletion = (completionName: CompletionName, completionSchema: ICompletionSchema) => {
    swarm.completionSchemaService.register(completionName, completionSchema);
};
