import { AgentName, IAgentSchema } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const addAgent = (agentName: AgentName, agentSchema: IAgentSchema) => {
    swarm.agentValidationService.addAgent(agentName, agentSchema);
    swarm.agentSchemaService.register(agentName, agentSchema);
};
