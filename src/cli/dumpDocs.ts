import swarm from "../lib";
import { GLOBAL_CONFIG, setConfig } from "../config/params";
import beginContext from "src/utils/beginContext";

const METHOD_NAME = "cli.dumpDocs";

/**
 * Dumps the documentation for the agents and swarms.
 *
 * @param {string} [dirName="./docs/chat"] - The directory where the documentation will be dumped.
 * @param {function} [PlantUML] - An optional function to process PlantUML diagrams.
 * @returns {Promise<void>} - A promise that resolves when the documentation has been dumped.
 */
export const dumpDocs = beginContext((
  dirName = "./docs/chat",
  PlantUML?: (uml: string) => Promise<string>
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
      console.error(`agent-swarm missing dependsOn for agentName=${agentName}`);
    }
  });

  return swarm.docService.dumpDocs(dirName);
});
