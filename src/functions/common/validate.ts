import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { singleshot } from "functools-kit";

const METHOD_NAME = "function.common.validate";

/**
 * Runs validation for all swarms, agents, and outlines.
 * This function is wrapped with `singleshot` to ensure it only runs once per process.
 * Logs the validation process if logging is enabled in the global config.
 * 
 * @private
 */
const validateInternal = singleshot(() => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME);

  const swarmList = swarm.swarmValidationService.getSwarmList();
  const agentList = swarmList.flatMap((swarmName) => swarm.swarmValidationService.getAgentList(swarmName));
  const outlineList = swarm.outlineValidationService.getOutlineList();

  swarmList.forEach((swarmName) => swarm.swarmValidationService.validate(swarmName, METHOD_NAME));
  agentList.forEach((agentName) => swarm.agentValidationService.validate(agentName, METHOD_NAME));
  outlineList.forEach((outlineName) => swarm.outlineValidationService.validate(outlineName, METHOD_NAME));
});

/**
 * Validates all swarms, agents, and outlines in the system.
 * This function is idempotent and will only perform validation once per process.
 * 
 * @returns {void}
 */
export function validate() {
  return validateInternal();
}
