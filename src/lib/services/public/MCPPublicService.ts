import { inject } from "../../core/di";
import { MCPConnectionService } from "../connection/MCPConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import MethodContextService from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import { IMCPTool, IMCPToolCallDto, MCPToolValue } from "../../../interfaces/MCP.interface";

interface IMCPConnectionService extends MCPConnectionService {}

type InternalKeys = keyof {
  getMCP: never;
};

type TMCPConnectionService = {
  [key in Exclude<keyof IMCPConnectionService, InternalKeys>]: unknown;
};

export class MCPPublicService implements TMCPConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly mcpConnectionService = inject<MCPConnectionService>(
    TYPES.mcpConnectionService
  );

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
      }
    );
  }

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
      }
    );
  }

  async callTool<T = MCPToolValue>(
    methodName: string,
    clientId: string,
    mcpName: string,
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<void> {
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
      }
    );
  }
}

export default MCPPublicService;
