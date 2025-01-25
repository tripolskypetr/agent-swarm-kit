import { IAgentSchema } from "../interfaces/Agent.interface";
import swarm from "../lib";

export const addAgent = (agentSchema: IAgentSchema) => {
    swarm.loggerService.log('function addAgent', {
        agentSchema
    });
    swarm.agentValidationService.addAgent(agentSchema.agentName, agentSchema);
    swarm.agentSchemaService.register(agentSchema.agentName, agentSchema);
    return agentSchema.agentName;
};
