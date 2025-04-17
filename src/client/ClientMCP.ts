import { GLOBAL_CONFIG } from "../config/params";
import {
  IMCP,
  IMCPParams,
  IMCPTool,
  IMCPToolCallDto,
  MCPToolValue,
} from "../interfaces/MCP.interface";
import { memoize } from "functools-kit";

export class ClientMCP implements IMCP {
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

  public async callTool<T = Record<string, MCPToolValue>>(
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
