import { IAgentTool } from "src/interfaces/Agent.interface";
import swarm from "src/lib";

export const addTool = (toolSchema: IAgentTool) => {
    swarm.toolValidationService.addTool(toolSchema.function.name);
    swarm.toolSchemaService.register(toolSchema.function.name, toolSchema);
};
