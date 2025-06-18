import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { WikiName } from "../../interfaces/Wiki.interface";

const METHOD_NAME = "function.dump.getWiki";

/**
 * Retrieves a wiki schema by its name from the swarm's wiki schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getWiki
 * @param {WikiName} wikiName - The name of the wiki to retrieve.
 * @returns The wiki schema associated with the provided wiki name.
 */
export function getWiki(wikiName: WikiName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      wikiName,
    });
  return swarm.wikiSchemaService.get(wikiName);
}
