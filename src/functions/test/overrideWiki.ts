import { IWikiSchema } from "../../interfaces/Wiki.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideWiki";

type TWikiSchema = {
  wikiName: IWikiSchema["wikiName"]
} & Partial<IWikiSchema>;

export const overrideWiki = beginContext(
  (wikiSchema: TWikiSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        wikiSchema,
      });

    return swarm.wikiSchemaService.override(
      wikiSchema.wikiName,
      wikiSchema
    );
  }
);