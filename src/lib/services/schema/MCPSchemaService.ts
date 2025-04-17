import { ToolRegistry } from "functools-kit";
import { MCPName, IMCPSchema } from "../../../interfaces/MCP.interface";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { GLOBAL_CONFIG } from "../../../config/params";
import TYPES from "../../core/types";

/**
 * Service class for managing MCP (Model Context Protocol) schemas.
 * Provides methods to register, override, and retrieve MCP schemas.
 */
export class MCPSchemaService {
  /** Injected LoggerService for logging operations. */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /** Registry for storing MCP schemas, keyed by MCP name. */
  private registry = new ToolRegistry<Record<MCPName, IMCPSchema>>(
    "mcpSchemaService"
  );

  /**
   * Validates the basic structure of an MCP schema.
   * @param mcpSchema - The MCP schema to validate.
   * @throws Error if the schema is missing required fields or has invalid types.
   */
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

  /**
   * Registers a new MCP schema in the registry.
   * @param key - The name of the MCP to register.
   * @param value - The MCP schema to register.
   */
  public register = (key: MCPName, value: IMCPSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing MCP schema with new or partial values.
   * @param key - The name of the MCP to override.
   * @param value - The partial MCP schema to apply.
   * @returns The updated MCP schema.
   */
  public override = (key: MCPName, value: Partial<IMCPSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves an MCP schema by its name.
   * @param key - The name of the MCP to retrieve.
   * @returns The MCP schema associated with the given name.
   */
  public get = (key: MCPName): IMCPSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default MCPSchemaService;
