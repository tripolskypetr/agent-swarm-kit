import { IAgentTool } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const addTool = (toolSchema: IAgentTool) => {
    swarm.toolValidationService.addTool(toolSchema.toolName, toolSchema);
    swarm.toolSchemaService.register(toolSchema.toolName, toolSchema);
    return toolSchema.toolName;
};
