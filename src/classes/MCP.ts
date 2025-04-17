import { GLOBAL_CONFIG } from "../config/params";
import IMCP, { IMCPTool, IMCPToolCallDto, MCPToolValue } from "../interfaces/MCP.interface";
import swarm from "../lib";
import { AgentName } from "../interfaces/Agent.interface";

/**
 * A no-operation implementation of the IMCP interface.
 * This class provides empty or error-throwing implementations of MCP methods.
 */
export class NoopMCP implements IMCP {
  /**
   * Creates an instance of NoopMCP.
   * @param agentName - The name of the agent associated with this MCP.
   */
  constructor(readonly agentName: AgentName) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopMCP CTOR agentName=${agentName}`);
  }

  /**
   * Lists available tools for a given client.
   * @param clientId - The ID of the client requesting the tool list.
   * @returns A promise resolving to an empty array of tools.
   */
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

  /**
   * Checks if a specific tool exists for a given client.
   * @param toolName - The name of the tool to check.
   * @param clientId - The ID of the client.
   * @returns A promise resolving to false, indicating no tools are available.
   */
  public hasTool(toolName: string, clientId: string): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopMCP hasTool agentName=${this.agentName}`, {
        toolName,
        clientId,
      });
    return Promise.resolve(false);
  }

  /**
   * Attempts to call a tool, always throwing an error in this implementation.
   * @param toolName - The name of the tool to call.
   * @param dto - The data transfer object containing tool call parameters.
   * @throws Error indicating that NoopMCP cannot call tools.
   */
  public async callTool<T extends MCPToolValue = MCPToolValue>(
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

/**
 * A composite implementation of the IMCP interface that merges multiple MCPs.
 * This class delegates tool-related operations to a list of MCPs.
 */
export class MergeMCP implements IMCP {
  /**
   * Creates an instance of MergeMCP.
   * @param mcpList - An array of IMCP instances to merge.
   * @param agentName - The name of the agent associated with this MCP.
   */
  constructor(
    private readonly mcpList: IMCP[],
    private readonly agentName: AgentName
  ) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`MergeMCP CTOR agentName=${agentName}`, {
        mcpList,
      });
  }

  /**
   * Lists all tools available from the merged MCPs for a given client.
   * @param clientId - The ID of the client requesting the tool list.
   * @returns A promise resolving to a flattened array of tools from all MCPs.
   */
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

  /**
   * Checks if a specific tool exists in any of the merged MCPs for a given client.
   * @param toolName - The name of the tool to check.
   * @param clientId - The ID of the client.
   * @returns A promise resolving to true if the tool exists in any MCP, false otherwise.
   */
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

  /**
   * Calls a tool from one of the merged MCPs if it exists.
   * @param toolName - The name of the tool to call.
   * @param dto - The data transfer object containing tool call parameters.
   * @throws Error if the tool is not found in any of the merged MCPs.
   */
  public async callTool<T extends MCPToolValue = MCPToolValue>(
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
