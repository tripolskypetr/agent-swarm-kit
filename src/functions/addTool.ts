import { IAgentTool } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const addTool = (toolSchema: IAgentTool) => {
    swarm.toolValidationService.addTool(toolSchema.function.name);
    swarm.toolSchemaService.register(toolSchema.function.name, toolSchema);
};
