import { AgentName, IAgentSpec } from "src/interfaces/Agent.interface";
import swarm from "src/lib";

export const addAgent = (agentName: AgentName, agentSpec: IAgentSpec) => {
    swarm.agentSpecService.register(agentName, agentSpec);
};
