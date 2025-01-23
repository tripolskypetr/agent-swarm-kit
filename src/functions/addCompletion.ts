import { AgentName, IAgentSpec } from "src/interfaces/Agent.interface";
import { CompletionName, ICompletionSpec } from "src/interfaces/Completion.interface";
import swarm from "src/lib";

export const addCompletion = (completionName: CompletionName, completionSpec: ICompletionSpec) => {
    swarm.completionSpecService.register(completionName, completionSpec);
};
