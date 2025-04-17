import { GLOBAL_CONFIG } from "../config/params";
import IMCP, { IMCPTool, IMCPToolCallDto, MCPToolValue } from "../interfaces/MCP.interface";
import swarm from "../lib";
import { AgentName } from "../interfaces/Agent.interface";

export class NoopMCP implements IMCP {
  constructor(readonly agentName: AgentName) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopMCP CTOR agentName=${agentName}`);
  }

  public async listTools(clientId: string): Promise<IMCPTool[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopMCP listTools agentName=${this.agentName}`,
        {
          clientId,
        }
      );
    return [];
  }

  public hasTool(toolName: string, clientId: string): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopMCP hasTool agentName=${this.agentName}`, {
        toolName,
        clientId,
      });
    return Promise.resolve(false);
  }

  public async callTool<T = Record<string, MCPToolValue>>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopMCP callTool agentName=${this.agentName}`,
        {
          toolName,
          dto,
        }
      );
    throw new Error(
      `NoopPolicy callTool should not be called agentName=${this.agentName} toolName=${toolName}`
    );
  }
}

export class MergeMCP implements IMCP {
  constructor(
    private readonly mcpList: IMCP[],
    private readonly agentName: AgentName
  ) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`MergeMCP CTOR agentName=${agentName}`, {
        mcpList,
      });
  }

  public async listTools(clientId: string): Promise<IMCPTool[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergeMCP listTools agentName=${this.agentName}`,
        {
          clientId,
        }
      );
    const toolList: IMCPTool[][] = [];
    for (const mcp of this.mcpList) {
      toolList.push(await mcp.listTools(clientId));
    }
    return toolList.flatMap((tools) => tools);
  }

  public async hasTool(toolName: string, clientId: string): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergeMCP hasTool agentName=${this.agentName}`,
        {
          toolName,
          clientId,
        }
      );
    for (const mcp of this.mcpList) {
      if (await mcp.hasTool(toolName, clientId)) {
        return true;
      }
    }
    return false;
  }

  public async callTool<T = Record<string, MCPToolValue>>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergeMCP callTool agentName=${this.agentName}`,
        {
          toolName,
          dto,
        }
      );
    for (const mcp of this.mcpList) {
      if (await mcp.hasTool(toolName, dto.clientId)) {
        return await mcp.callTool(toolName, dto);
      }
    }
    throw new Error(
      `MergeMCP callTool agentName=${this.agentName} tool not found toolName=${toolName}`
    );
  }
}
