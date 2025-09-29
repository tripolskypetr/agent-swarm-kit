import swarm from "../lib";
import { GLOBAL_CONFIG, setConfig } from "../config/params";
import beginContext from "../utils/beginContext";

const METHOD_NAME = "cli.dumpDocs";

/**
 * Dumps the documentation for the agents and swarms.
 *
 */
export const dumpDocs = beginContext(
  (
    prefix = "swarm",
    dirName = "./docs/chat",
    PlantUML?: (uml: string) => Promise<string>,
    sanitizeMarkdown: (text: string) => string = (t) => t
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        dirName,
      });

    if (PlantUML) {
      setConfig({
        CC_FN_PLANTUML: PlantUML,
      });
    }

    swarm.agentValidationService
      .getAgentList()
      .forEach((agentName) =>
        swarm.agentValidationService.validate(agentName, METHOD_NAME)
      );

    swarm.swarmValidationService
      .getSwarmList()
      .forEach((swarmName) =>
        swarm.swarmValidationService.validate(swarmName, METHOD_NAME)
      );

    swarm.agentValidationService.getAgentList().forEach((agentName) => {
      const { dependsOn } = swarm.agentSchemaService.get(agentName);
      if (!dependsOn) {
        console.error(
          `agent-swarm missing dependsOn for agentName=${agentName}`
        );
      }
    });

    swarm.outlineValidationService
      .getOutlineList()
      .forEach((swarmName) =>
        swarm.outlineValidationService.validate(swarmName, METHOD_NAME)
      );

    return swarm.docService.dumpDocs(prefix, dirName, sanitizeMarkdown);
  }
);
