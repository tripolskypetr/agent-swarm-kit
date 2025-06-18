import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { MCPName } from "../../interfaces/MCP.interface";

const METHOD_NAME = "function.dump.getMCP";

/**
 * Retrieves an MCP (Model Context Protocol) schema by its name from the swarm's MCP schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getMCP
 * @param {MCPName} mcpName - The name of the MCP to retrieve.
 * @returns The MCP schema associated with the provided MCP name.
 */
export function getMCP(mcpName: MCPName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      mcpName,
    });
  return swarm.mcpSchemaService.get(mcpName);
}
