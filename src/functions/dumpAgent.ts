import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

const METHOD_NAME = "function.dumpAgent";

/**
 * Dumps the agent information into PlantUML format.
 *
 * @param {SwarmName} swarmName - The name of the swarm to be dumped.
 * @returns {string} The UML representation of the swarm.
 */
export const dumpAgent = (agentName: AgentName) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      agentName,
    });
  swarm.agentValidationService.validate(agentName, METHOD_NAME);
  return swarm.agentMetaService.toUML(agentName);
};
