import { AgentName, IAgentTool } from "../interfaces/Agent.interface";
import { ITool } from "../model/Tool.model";

export const resolveTools = async (clientId: string, agentName: AgentName, tools: IAgentTool[]): Promise<ITool[]> => {
    if (!tools?.length) {
        return [];
    }
    return await Promise.all(tools.map(async ({ type, function: fn }): Promise<ITool> => ({
        type,
        function: typeof fn === "function" ? await fn(clientId, agentName) : fn,
    })))
};
