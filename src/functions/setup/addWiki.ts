import { IWikiSchema } from "../../interfaces/Wiki.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addWiki";

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
