import { GLOBAL_CONFIG } from "../config/params";
import {
  IMCP,
  IMCPParams,
  IMCPTool,
  IMCPToolCallDto,
  MCPToolValue,
} from "../interfaces/MCP.interface";
import { memoize } from "functools-kit";

/**
 * A client-side implementation of the IMCP interface for managing tools and their operations.
 */
export class ClientMCP implements IMCP {
  /**
   * Creates an instance of ClientMCP.
   * @param params - The parameters for configuring the MCP, including callbacks and tool management functions.
   */
  constructor(readonly params: IMCPParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientMCP mcpName=${this.params.mcpName} CTOR`,
        {
          params,
        }
      );
    if (this.params.callbacks?.onInit) {
      this.params.callbacks.onInit();
    }
  }

  /**
   * Memoized function to fetch and cache tools for a given client ID.
   * @param clientId - The ID of the client requesting the tools.
   * @returns A promise resolving to a Map of tool names to IMCPTool objects.
   */
  private fetchTools = memoize(
    ([clientId]) => `${clientId}`,
    async (clientId: string): Promise<Map<string, IMCPTool>> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientMCP mcpName=${this.params.mcpName} fetchTools`,
          {
            clientId,
          }
        );
      const toolList = await this.params.listTools(clientId);
      return new Map(toolList.map((tool: IMCPTool) => [tool.name, tool]));
    }
  );

  /**
   * Lists all available tools for a given client.
   * @param clientId - The ID of the client requesting the tool list.
   * @returns A promise resolving to an array of IMCPTool objects.
   */
  public async listTools(clientId: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientMCP mcpName=${this.params.mcpName} listTools`,
        {
          clientId,
        }
      );
    if (this.params.callbacks?.onList) {
      this.params.callbacks.onList(clientId);
    }
    const toolMap = await this.fetchTools(clientId);
    return Array.from(toolMap.values());
  }

  /**
   * Checks if a specific tool exists for a given client.
   * @param toolName - The name of the tool to check.
   * @param clientId - The ID of the client.
   * @returns A promise resolving to true if the tool exists, false otherwise.
   */
  public async hasTool(toolName: string, clientId: string): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientMCP mcpName=${this.params.mcpName} hasTool`,
        {
          toolName,
          clientId,
        }
      );
    const toolMap = await this.fetchTools(clientId);
    return toolMap.has(toolName);
  }

  /**
   * Updates the list of tools by clearing the cache and invoking the update callback.
   * @returns A promise resolving when the update is complete.
   */
  public async updateToolsForClient(clientId: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientMCP mcpName=${this.params.mcpName} updateToolsForClient`,
        { clientId }
      );
    this.fetchTools.clear(clientId);
    if (this.params.callbacks?.onUpdate) {
      this.params.callbacks.onUpdate(this.params.mcpName, clientId);
    }
  }

  /**
   * Updates the list of tools for all clients by clearing the cache and invoking the update callback.
   * @returns A promise resolving when the update is complete.
   */
  public async updateToolsForAll() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientMCP mcpName=${this.params.mcpName} updateToolsForAll`,
        {}
      );
    this.fetchTools.clear();
    if (this.params.callbacks?.onUpdate) {
      this.params.callbacks.onUpdate(this.params.mcpName, undefined);
    }
  }

  /**
   * Calls a specific tool with the provided parameters.
   * @param toolName - The name of the tool to call.
   * @param dto - The data transfer object containing tool call parameters.
   * @returns A promise resolving when the tool call is complete.
   */
  public async callTool<T extends MCPToolValue = MCPToolValue>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientMCP mcpName=${this.params.mcpName} callTool`,
        {
          toolName,
          dto,
        }
      );
    if (this.params.callbacks?.onCall) {
      this.params.callbacks.onCall(toolName, dto);
    }
    return await this.params.callTool(toolName, dto);
  }

  /**
   * Disposes of resources associated with a client, clearing cached tools and invoking the dispose callback.
   * @param clientId - The ID of the client whose resources are to be disposed.
   */
  public dispose(clientId: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientMCP mcpName=${this.params.mcpName} dispose`,
        {
          clientId,
        }
      );
    this.fetchTools.clear(clientId);
    if (this.params.callbacks?.onDispose) {
      this.params.callbacks.onDispose(clientId);
    }
  }
}

export default ClientMCP;
