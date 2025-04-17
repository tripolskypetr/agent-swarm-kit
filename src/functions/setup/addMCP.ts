import { IMCPSchema } from "../../interfaces/MCP.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addMCP";

export const addMCP = beginContext((mcpSchema: IMCPSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      mcpSchema,
    });

  swarm.mcpValidationService.addMCP(mcpSchema.mcpName, mcpSchema);
  swarm.mcpSchemaService.register(mcpSchema.mcpName, mcpSchema);

  return mcpSchema.mcpName;
});
