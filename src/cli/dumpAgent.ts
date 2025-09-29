import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import beginContext from "../utils/beginContext";

const METHOD_NAME = "cli.dumpAgent";

/**
 * The config for UML generation
 */
interface IConfig {
  /**
   * Whether to include subtree information in the UML diagram.
   * Controls the level of detail and hierarchy shown in the generated visualization.
   */
  withSubtree: boolean;
}

/**
 * Dumps the agent information into PlantUML format.
 *
 */
export const dumpAgent = beginContext(
  (agentName: AgentName, { withSubtree = false }: Partial<IConfig> = {}) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        agentName,
      });
    swarm.agentValidationService.validate(agentName, METHOD_NAME);
    return swarm.agentMetaService.toUML(agentName, withSubtree);
  }
);
