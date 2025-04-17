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

/**
 * Service class for managing MCP (Model Context Protocol) connections and operations.
 * Implements the IMCP interface to handle tool listing, checking, calling, and disposal.
 */
export class MCPConnectionService implements IMCP {
  /** Injected LoggerService for logging operations. */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  /** Injected BusService for communication or event handling. */
  private readonly busService = inject<BusService>(TYPES.busService);
  /** Injected MethodContextService for accessing method context information. */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );
  /** Injected MCPSchemaService for managing MCP schemas. */
  private readonly mcpSchemaService = inject<MCPSchemaService>(
    TYPES.mcpSchemaService
  );

  /**
   * Memoized function to retrieve or create an MCP instance for a given MCP name.
   * @param mcpName - The name of the MCP to retrieve or create.
   * @returns A ClientMCP instance configured with the specified schema and dependencies.
   */
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

  /**
   * Lists available tools for a given client.
   * @param clientId - The ID of the client requesting the tool list.
   * @returns A promise resolving to an array of IMCPTool objects.
   */
  async listTools(clientId: string): Promise<IMCPTool[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpConnectionService listTools`, {
        clientId,
      });
    return await this.getMCP(
      this.methodContextService.context.mcpName
    ).listTools(clientId);
  }

  /**
   * Checks if a specific tool exists for a given client.
   * @param toolName - The name of the tool to check.
   * @param clientId - The ID of the client.
   * @returns A promise resolving to true if the tool exists, false otherwise.
   */
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

  /**
   * Calls a specific tool with the provided parameters.
   * @param toolName - The name of the tool to call.
   * @param dto - The data transfer object containing tool call parameters.
   * @returns A promise resolving when the tool call is complete.
   */
  async callTool<T extends MCPToolValue = MCPToolValue>(
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

  /**
   * Disposes of resources associated with a client, clearing cached MCP instances.
   * @param clientId - The ID of the client whose resources are to be disposed.
   * @returns A promise resolving when the disposal is complete.
   */
  public dispose = async (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpConnectionService dispose`, { clientId });
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.agentName}`;
    if (!this.getMCP.has(key)) {
      return;
    }
    await this.getMCP(this.methodContextService.context.mcpName).dispose(
      clientId
    );
    this.getMCP.clear(clientId);
  };
}

export default MCPConnectionService;
