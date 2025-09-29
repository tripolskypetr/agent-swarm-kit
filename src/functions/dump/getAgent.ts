import { AgentName } from "../../interfaces/Agent.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.dump.getAgent";

/**
 * Retrieves an agent schema by its name from the swarm's agent schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getAgent
 */
export function getAgent(agentName: AgentName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      agentName,
    });
  return swarm.agentSchemaService.get(agentName);
}