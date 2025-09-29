import { IMCPSchema } from "../../interfaces/MCP.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideMCP";

/**
 * Type definition for a partial MCP schema, requiring at least an mcpName.
 */
type TMCPSchema = {
  mcpName: IMCPSchema["mcpName"];
} & Partial<IMCPSchema>;

/**
 * Function implementation
 */
const overrideMCPInternal = beginContext((publicMcpSchema: TMCPSchema) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      mcpSchema: publicMcpSchema,
    });

  const mcpSchema = removeUndefined(publicMcpSchema);

  return swarm.mcpSchemaService.override(mcpSchema.mcpName, mcpSchema);
});

/**
 * Overrides an existing MCP (Model Context Protocol) schema with a new or partial schema.
 * @param {TMCPSchema} mcpSchema - The schema definition for mcp.
 */
export function overrideMCP(mcpSchema: TMCPSchema) {
  return overrideMCPInternal(mcpSchema);
}
