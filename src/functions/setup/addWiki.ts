import { IWikiSchema } from "../../interfaces/Wiki.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

/** @constant {string} METHOD_NAME - The name of the method used for logging */
const METHOD_NAME = "function.setup.addWiki";

/**
 * Adds a wiki schema to the system
 * @function addWiki
 * @param {IWikiSchema} wikiSchema - The wiki schema to add
 * @returns {string} The name of the added wiki
 */
export const addWiki = beginContext(
  (wikiSchema: IWikiSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        wikiSchema,
      });

    swarm.wikiValidationService.addWiki(
      wikiSchema.wikiName,
      wikiSchema,
    );
    swarm.wikiSchemaService.register(
      wikiSchema.wikiName,
      wikiSchema
    );

    return wikiSchema.wikiName;
  }
);
