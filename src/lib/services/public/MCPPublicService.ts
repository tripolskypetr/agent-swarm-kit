import { inject } from "../../core/di";
import { MCPConnectionService } from "../connection/MCPConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import {
  IMCPTool,
  IMCPToolCallDto,
  MCPToolOutput,
  MCPToolValue,
} from "../../../interfaces/MCP.interface";

interface IMCPConnectionService extends MCPConnectionService {}

type InternalKeys = keyof {
  getMCP: never;
};

type TMCPConnectionService = {
  [key in Exclude<keyof IMCPConnectionService, InternalKeys>]: unknown;
};

/**
 * Public service class for interacting with MCP (Model Context Protocol) operations.
 * Provides methods to list tools, check tool existence, call tools, and dispose resources,
 * executing operations within a specified context.
 */
export class MCPPublicService implements TMCPConnectionService {
  /** Injected LoggerService for logging operations. */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /** Injected MCPConnectionService for handling MCP operations. */
  private readonly mcpConnectionService = inject<MCPConnectionService>(
    TYPES.mcpConnectionService
  );

  /**
   * Lists available tools for a given client within a specified context.
   * @param methodName - The name of the method for context tracking.
   * @param clientId - The ID of the client requesting the tool list.
   * @param mcpName - The name of the MCP to query.
   * @returns A promise resolving to an array of IMCPTool objects.
   */
  async listTools(
    methodName: string,
    clientId: string,
    mcpName: string
  ): Promise<IMCPTool[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpPublicService listTools`, {
        clientId,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.mcpConnectionService.listTools(clientId);
      },
      {
        methodName,
        clientId,
        mcpName,
        agentName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        policyName: "",
        computeName: "",
      }
    );
  }

  /**
   * Checks if a specific tool exists for a given client within a specified context.
   * @param methodName - The name of the method for context tracking.
   * @param clientId - The ID of the client.
   * @param mcpName - The name of the MCP to query.
   * @param toolName - The name of the tool to check.
   * @returns A promise resolving to true if the tool exists, false otherwise.
   */
  async hasTool(
    methodName: string,
    clientId: string,
    mcpName: string,
    toolName: string
  ): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpPublicService hasTool`, {
        toolName,
        clientId,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.mcpConnectionService.hasTool(toolName, clientId);
      },
      {
        methodName,
        clientId,
        mcpName,
        agentName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        policyName: "",
        computeName: "",
      }
    );
  }

  /**
   * Calls a specific tool with the provided parameters within a specified context.
   * @param methodName - The name of the method for context tracking.
   * @param clientId - The ID of the client.
   * @param mcpName - The name of the MCP to query.
   * @param toolName - The name of the tool to call.
   * @param dto - The data transfer object containing tool call parameters.
   * @returns A promise resolving when the tool call is complete.
   */
  async callTool<T extends MCPToolValue = MCPToolValue>(
    methodName: string,
    clientId: string,
    mcpName: string,
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<MCPToolOutput> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpPublicService callTool`, {
        toolName,
        dto,
      });
    return await MethodContextService.runInContext(
      async () => {
        return await this.mcpConnectionService.callTool(toolName, dto);
      },
      {
        methodName,
        clientId,
        mcpName,
        agentName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        policyName: "",
        computeName: "",
      }
    );
  }

  /**
   * Disposes of resources associated with a client within a specified context.
   * @param methodName - The name of the method for context tracking.
   * @param clientId - The ID of the client whose resources are to be disposed.
   * @param mcpName - The name of the MCP to query.
   * @returns A promise resolving when the disposal is complete.
   */
  public dispose = async (
    methodName: string,
    clientId: string,
    mcpName: string
  ) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpPublicService dispose`, { clientId });
    return await MethodContextService.runInContext(
      async () => {
        return await this.mcpConnectionService.dispose(clientId);
      },
      {
        methodName,
        clientId,
        mcpName,
        agentName: "",
        swarmName: "",
        storageName: "",
        stateName: "",
        policyName: "",
        computeName: "",
      }
    );
  };
}

export default MCPPublicService;
