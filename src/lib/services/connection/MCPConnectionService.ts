import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import IMCP, {
  IMCPTool,
  IMCPToolCallDto,
  MCPName,
  MCPToolValue,
} from "../../../interfaces/MCP.interface";
import { memoize } from "functools-kit";
import ClientMCP from "../../../client/ClientMCP";
import { TMethodContextService } from "../context/MethodContextService";
import { GLOBAL_CONFIG } from "../../../config/params";
import BusService from "../base/BusService";
import MCPSchemaService from "../schema/MCPSchemaService";

export class MCPConnectionService implements IMCP {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );
  private readonly mcpSchemaService = inject<MCPSchemaService>(
    TYPES.mcpSchemaService
  );

  public getMCP = memoize(
    ([mcpName]) => `${mcpName}`,
    (mcpName: MCPName) => {
      const schema = this.mcpSchemaService.get(mcpName);
      return new ClientMCP({
        mcpName,
        bus: this.busService,
        logger: this.loggerService,
        ...schema,
      });
    }
  );

  async listTools(clientId: string): Promise<IMCPTool[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpConnectionService listTools`, {
        clientId,
      });
    return await this.getMCP(
      this.methodContextService.context.mcpName
    ).listTools(clientId);
  }

  async hasTool(toolName: string, clientId: string): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpConnectionService hasTool`, {
        toolName,
        clientId,
      });
    return await this.getMCP(this.methodContextService.context.mcpName).hasTool(
      toolName,
      clientId
    );
  }

  async callTool<T = Record<string, MCPToolValue>>(
    toolName: string,
    dto: IMCPToolCallDto<T>
  ): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpConnectionService hasTool`, {
        toolName,
        dto,
      });
    return await this.getMCP(
      this.methodContextService.context.mcpName
    ).callTool(toolName, dto);
  }
}

export default MCPConnectionService;
