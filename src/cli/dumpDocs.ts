import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

const METHOD_NAME = "cli.dumpDocs";

export const dumpDocs = (dirName = "./docs/chat") => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      dirName,
    });
  return swarm.docService.dumpDocs(dirName);
};
