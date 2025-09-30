import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import { SwarmName } from "../interfaces/Swarm.interface";
import beginContext from "../utils/beginContext";

const METHOD_NAME = "cli.dumpSwarm";

/**
 * Dumps the swarm information into PlantUML format.
 *
*/
export const dumpSwarm = beginContext((swarmName: SwarmName) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      swarmName,
    });
  swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
  return swarm.swarmMetaService.toUML(swarmName);
});
