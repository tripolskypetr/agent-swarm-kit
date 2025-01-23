import { AgentName } from "src/interfaces/Agent.interface";
import swarm from "src/lib";

export const getAgentHistory = async (clientId: string, agentName: AgentName) => {
    swarm.agentValidationService.validate(agentName);
    const { prompt } = swarm.agentSchemaService.get(agentName);
    return await swarm.historyPublicService.toArrayForAgent(prompt, clientId, agentName);
};
