import { ToolRegistry } from "functools-kit";
import { MCPName, IMCPSchema } from "../../../interfaces/MCP.interface";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { GLOBAL_CONFIG } from "../../../config/params";
import TYPES from "../../core/types";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * Service class for managing MCP (Model Context Protocol) schemas.
 * Provides methods to register, override, and retrieve MCP schemas.
*/
export class MCPSchemaService {
  /** Injected LoggerService for logging operations.*/
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Schema context service instance, injected via DI, for managing schema-related context operations.
   * Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.
   * @readonly
   */
  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  /** Registry for storing MCP schemas, keyed by MCP name.*/
  private _registry = new ToolRegistry<Record<MCPName, IMCPSchema>>(
    "mcpSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.mcpSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   */
  public set registry(
    value: ToolRegistry<Record<MCPName, IMCPSchema>>
  ) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.mcpSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates the basic structure of an MCP schema.
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
   */
  public register = (key: MCPName, value: IMCPSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing MCP schema with new or partial values.
   */
  public override = (key: MCPName, value: Partial<IMCPSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves an MCP schema by its name.
   */
  public get = (key: MCPName): IMCPSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`mcpSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default MCPSchemaService;
