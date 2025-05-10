import { isObject, ToolRegistry } from "functools-kit";
import { IAgentTool, ToolName } from "../../../interfaces/Agent.interface";
import LoggerService from "../base/LoggerService";
import { inject } from "../../core/di";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * Service class for managing tool schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IAgentTool instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with AgentSchemaService (tool references in agent schemas via the tools field), ClientAgent (tool usage during execution), AgentConnectionService (agent instantiation with tools), and SwarmConnectionService (swarm-level agent execution).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining agent tools (e.g., call, validate, function properties) used by agents to perform specific tasks within the swarm ecosystem.
 */
export class ToolSchemaService {
  /**
   * Logger service instance, injected via DI, for logging tool schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentConnectionService and PerfService logging patterns.
   * @type {LoggerService}
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Schema context service instance, injected via DI, for managing schema-related context operations.
   * Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.
   * @type {TSchemaContextService}
   * @readonly
   */
  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  /**
   * Registry instance for storing tool schemas, initialized with ToolRegistry from functools-kit.
   * Maps ToolName keys to IAgentTool values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @type {ToolRegistry<Record<ToolName, IAgentTool>>}
   * @private
   */
  private _registry = new ToolRegistry<Record<ToolName, IAgentTool>>(
    "toolSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.toolSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   */
  public set registry(value: ToolRegistry<Record<ToolName, IAgentTool>>) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.toolSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates a tool schema shallowly, ensuring required fields meet basic integrity constraints.
   * Checks toolName as a string, call and validate as functions (for tool execution and input validation), and function as an object (tool metadata), using isObject from functools-kit.
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s tool integration needs.
   * Supports ClientAgent execution by ensuring tool schema validity before registration.
   * @param {IAgentTool} toolSchema - The tool schema to validate, sourced from Agent.interface.
   * @throws {Error} If any validation check fails, with detailed messages including toolName.
   * @private
   */
  private validateShallow = (toolSchema: IAgentTool) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`toolSchemaService validateShallow`, {
        toolSchema,
      });
    if (typeof toolSchema.toolName !== "string") {
      throw new Error(
        `agent-swarm tool schema validation failed: missing toolName`
      );
    }
    if (typeof toolSchema.call !== "function") {
      throw new Error(
        `agent-swarm tool schema validation failed: missing call for toolName=${toolSchema.toolName}`
      );
    }
    if (toolSchema.validate && typeof toolSchema.validate !== "function") {
      throw new Error(
        `agent-swarm tool schema validation failed: missing validate for toolName=${toolSchema.toolName}`
      );
    }
    if (!isObject(toolSchema.function)) {
      throw new Error(
        `agent-swarm tool schema validation failed: missing function for toolName=${toolSchema.toolName}`
      );
    }
  };

  /**
   * Registers a new tool schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (toolName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentSchemaService’s tool references.
   * Supports ClientAgent execution by providing validated tool schemas to AgentConnectionService and SwarmConnectionService for agent tool integration.
   * @param {ToolName} key - The name of the tool, used as the registry key, sourced from Agent.interface.
   * @param {IAgentTool} value - The tool schema to register, sourced from Agent.interface, validated before storage.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
   */
  public register = (key: ToolName, value: IAgentTool) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("toolSchemaService register");
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing tool schema in the registry with a new schema.
   * Replaces the schema associated with the provided key (toolName) in the ToolRegistry.
   * Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports dynamic updates to tool schemas for AgentConnectionService and SwarmConnectionService.
   * @param {ToolName} key - The name of the tool to override, sourced from Agent.interface.
   * @param {IAgentTool} value - The new tool schema to replace the existing one, sourced from Agent.interface.
   * @throws {Error} If the key does not exist in the registry (inherent to ToolRegistry.override behavior).
   */
  public override = (key: ToolName, value: Partial<IAgentTool>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`toolSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves a tool schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports AgentConnectionService by providing tool definitions (e.g., call, validate, function) for agent instantiation, referenced in AgentSchemaService schemas via the tools field.
   * @param {ToolName} key - The name of the tool to retrieve, sourced from Agent.interface.
   * @returns {IAgentTool} The tool schema associated with the key, sourced from Agent.interface, including call, validate, and function properties.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
   */
  public get = (key: ToolName): IAgentTool => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("toolSchemaService get", { key });
    const {
      validate = GLOBAL_CONFIG.CC_DEFAULT_AGENT_TOOL_VALIDATE,
      ...other
    } = this.registry.get(key);
    return {
      validate,
      ...other,
    };
  };
}

/**
 * Default export of the ToolSchemaService class.
 * Provides the primary service for managing tool schemas in the swarm system, integrating with AgentSchemaService, ClientAgent, AgentConnectionService, and SwarmConnectionService, with validated schema storage via ToolRegistry.
 * @type {typeof ToolSchemaService}
 */
export default ToolSchemaService;
