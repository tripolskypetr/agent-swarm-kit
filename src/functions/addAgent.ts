import { IAgentSchema } from "../interfaces/Agent.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Adds a new agent to the agent registry. The swarm takes only those agents which was registered
 *
 * @param {IAgentSchema} agentSchema - The schema of the agent to be added.
 * @returns {string} The name of the added agent.
 */
export const addAgent = (agentSchema: IAgentSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log("function addAgent", {
      agentSchema,
    });
  swarm.agentValidationService.addAgent(agentSchema.agentName, agentSchema);
  swarm.agentSchemaService.register(agentSchema.agentName, agentSchema);
  return agentSchema.agentName;
};
