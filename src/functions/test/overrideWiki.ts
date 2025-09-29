import { IWikiSchema } from "../../interfaces/Wiki.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideWiki";

/**
 * Type representing a partial wiki schema configuration.
 * Used for wiki service configuration with optional properties.
 */
type TWikiSchema = {
  wikiName: IWikiSchema["wikiName"];
} & Partial<IWikiSchema>;

/**
 * Function implementation
 */
const overrideWikiInternal = beginContext((publicWikiSchema: TWikiSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      wikiSchema: publicWikiSchema,
    });

  const wikiSchema = removeUndefined(publicWikiSchema);

  return swarm.wikiSchemaService.override(wikiSchema.wikiName, wikiSchema);
});

/**
 * Overrides an existing wiki schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a wiki identified by its `wikiName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @throws {Error} If the wiki schema service encounters an error during the override operation (e.g., invalid wikiName or schema).
 *
 * @example
 * // Override a wiki’s schema with new properties
 * overrideWiki({
 *   wikiName: "KnowledgeBase",
 *   description: "Updated knowledge repository",
 *   storage: "WikiStorage",
 * });
 * // Logs the operation (if enabled) and updates the wiki schema in the swarm.
 */
export function overrideWiki(wikiSchema: TWikiSchema) {
  return overrideWikiInternal(wikiSchema);
}
