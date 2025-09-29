import { GLOBAL_CONFIG } from "../config/params";
import IMCP, {
  IMCPTool,
  IMCPToolCallDto,
  MCPName,
  MCPToolValue,
} from "../interfaces/MCP.interface";
import swarm from "../lib";
import { AgentName } from "../interfaces/Agent.interface";
import { commitToolOutput } from "../functions/commit/commitToolOutput";
import { execute } from "../functions/target/execute";
import { commitFlush } from "../functions/commit/commitFlush";
import { emit } from "../functions/target/emit";
import { createPlaceholder } from "../client/ClientAgent";
import { getAgentName } from "../functions/common/getAgentName";
import { getErrorMessage } from "functools-kit";
import { commitStopTools } from "../functions/commit/commitStopTools";

const METHOD_NAME_UPDATE = "McpUtils.update";

/**
 * A no-operation implementation of the IMCP interface.
 * This class provides empty or error-throwing implementations of MCP methods.
 */
export class NoopMCP implements IMCP {
  /**
   * Creates an instance of NoopMCP.
   */
  constructor(readonly agentName: AgentName) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(`NoopMCP CTOR agentName=${agentName}`);
  }

  /**
   * Lists available tools for a given client.
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
   * Updates the list of tools for a specific client.
   */
  public async updateToolsForAll(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopMCP updateToolsForAll agentName=${this.agentName}`
      );
  }

  /**
   * Updates the list of tools for a specific client.
   */
  public async updateToolsForClient(clientId: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `NoopMCP updateToolsForClient agentName=${this.agentName}`,
        {
          clientId,
        }
      );
  }

  /**
   * Checks if a specific tool exists for a given client.
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
   * @throws Error indicating that NoopMCP cannot call tools.
   */
  public async callTool<T extends MCPToolValue = MCPToolValue>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<undefined> {
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
   * Updates the list of tools for all clients across all merged MCPs.
   */
  public async updateToolsForAll(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergeMCP updateToolsForAll agentName=${this.agentName}`
      );
    for (const mcp of this.mcpList) {
      await mcp.updateToolsForAll();
    }
  }

  /**
   * Updates the list of tools for a specific client across all merged MCPs.
   */
  public async updateToolsForClient(clientId: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(
        `MergeMCP updateToolsForClient agentName=${this.agentName}`,
        {
          clientId,
        }
      );
    for (const mcp of this.mcpList) {
      await mcp.updateToolsForClient(clientId);
    }
  }

  /**
   * Calls a tool from one of the merged MCPs if it exists.
   * @throws Error if the tool is not found in any of the merged MCPs.
   */
  public async callTool<T extends MCPToolValue = MCPToolValue>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<undefined> {
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
        const agentName = await getAgentName(dto.clientId);
        try {
          const toolOutput = await mcp.callTool(toolName, dto);
          if (typeof toolOutput === "string") {
            await commitToolOutput(
              dto.toolId,
              toolOutput,
              dto.clientId,
              agentName
            );
            if (dto.isLast) {
              await execute("", dto.clientId, agentName);
            }
          }
        } catch (error) {
          console.error(
            `agent-swarm MCP tool error toolName=${toolName} agentName=${agentName} error=${getErrorMessage(
              error
            )}`
          );
          {
            const { callbacks = {} } = swarm.agentSchemaService.get(agentName);
            callbacks.onToolError &&
              callbacks.onToolError(dto.clientId, dto.agentName, toolName, error);
            callbacks.onResurrect &&
              callbacks.onResurrect(
                dto.clientId,
                dto.agentName,
                "tool",
                `MCP execution failed toolName=${toolName}`
              );
          }
          await commitStopTools(dto.clientId, agentName);
          await commitFlush(dto.clientId, agentName);
          await emit(createPlaceholder(), dto.clientId, agentName);
        }
        return;
      }
    }
    throw new Error(
      `MergeMCP callTool agentName=${this.agentName} tool not found toolName=${toolName}`
    );
  }
}

/**
 * Utility class for managing MCP updates.
 * This class provides methods to update tools for all clients or a specific client.
 * It is used in the context of the MCP (Multi-Client Protocol) system.
 */
export class MCPUtils {
  /**
   * Updates the list of tools for all clients or a specific client.
   */
  public async update(mcpName: MCPName, clientId?: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      swarm.loggerService.info(METHOD_NAME_UPDATE, {
        mcpName,
        clientId,
      });
    swarm.mcpValidationService.validate(mcpName, METHOD_NAME_UPDATE);
    if (clientId) {
      return await swarm.mcpPublicService.updateToolsForClient(
        METHOD_NAME_UPDATE,
        clientId,
        mcpName
      );
    }
    return await swarm.mcpPublicService.updateToolsForAll(
      METHOD_NAME_UPDATE,
      mcpName
    );
  }
}

/**
 * Singleton instance of the MCPUtils class.
 */
export const MCP = new MCPUtils();
