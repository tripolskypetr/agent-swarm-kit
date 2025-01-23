import { IAgentTool } from "src/interfaces/Agent.interface";
import swarm from "src/lib";

export const addTool = (toolSpec: IAgentTool) => {
    swarm.toolSpecService.register(toolSpec.function.name, toolSpec);
};
