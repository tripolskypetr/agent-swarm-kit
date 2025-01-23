import { AgentName, IAgentSchema } from "src/interfaces/Agent.interface";
import swarm from "src/lib";

export const addAgent = (agentName: AgentName, agentSchema: IAgentSchema) => {
    swarm.agentValidationService.addAgent(agentName, agentSchema);
    swarm.agentSchemaService.register(agentName, agentSchema);
};
