import { ToolRegistry } from "functools-kit";
import { MCPName, IMCPSchema } from "../../../interfaces/MCP.interface";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { GLOBAL_CONFIG } from "../../../config/params";
import TYPES from "../../core/types";

export class MCPSchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<MCPName, IMCPSchema>>(
    "mcpSchemaService"
  );

  private validateShallow = (mcpSchema: IMCPSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService validateShallow`, {
        mcpSchema,
      });
    if (typeof mcpSchema.mcpName !== "string") {
      throw new Error(
        `agent-swarm mcp schema validation failed: missing mcpName`
      );
    }
    if (typeof mcpSchema.callTool !== "function") {
      throw new Error(
        `agent-swarm mcp schema validation failed: callTool must be provided mcpName=${mcpSchema.mcpName}`
      );
    }
    if (typeof mcpSchema.listTools !== "function") {
      throw new Error(
        `agent-swarm mcp schema validation failed: listTools must be provided mcpName=${mcpSchema.mcpName}`
      );
    }
  };

  public register = (key: MCPName, value: IMCPSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  public override = (key: MCPName, value: Partial<IMCPSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  public get = (key: MCPName): IMCPSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default MCPSchemaService;
