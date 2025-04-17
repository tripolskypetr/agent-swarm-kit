import { IMCPSchema } from "../../interfaces/MCP.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.test.overrideMCP";

type TMCPSchema = {
  mcpName: IMCPSchema["mcpName"];
} & Partial<IMCPSchema>;

export const overrideMCP = beginContext((mcpSchema: TMCPSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      mcpSchema,
    });

  return swarm.mcpSchemaService.override(mcpSchema.mcpName, mcpSchema);
});
