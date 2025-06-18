import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { CompletionName } from "../../interfaces/Completion.interface";

const METHOD_NAME = "function.dump.getCompletion";

/**
 * Retrieves a completion schema by its name from the swarm's completion schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getCompletion
 * @param {CompletionName} completionName - The name of the completion to retrieve.
 * @returns The completion schema associated with the provided completion name.
 */
export function getCompletion(completionName: CompletionName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      completionName,
    });
  return swarm.completionSchemaService.get(completionName);
}
