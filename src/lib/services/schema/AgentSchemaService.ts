import { ToolRegistry } from "functools-kit";
import { AgentName, IAgentSchemaInternal } from "../../../interfaces/Agent.interface";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { GLOBAL_CONFIG } from "../../../config/params";
import TYPES from "../../core/types";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * Service class for managing agent schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IAgentSchemaInternal instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with AgentConnectionService (agent instantiation using schemas), SwarmConnectionService (swarm agent configuration), ClientAgent (schema-driven execution), and AgentMetaService (meta-level agent management).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining agent behavior, dependencies, and resources (e.g., states, storages, tools) within the swarm ecosystem.
*/
export class AgentSchemaService {
  /**
   * Logger service instance, injected via DI, for logging schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentConnectionService and PerfService logging patterns.
   * @readonly
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Schema context service instance, injected via DI, for managing schema-related context operations.
   * Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.
   * @readonly
   */
  readonly schemaContextService = inject<TSchemaContextService>(TYPES.schemaContextService);

  /**
   * Registry instance for storing agent schemas, initialized with ToolRegistry from functools-kit.
   * Maps AgentName keys to IAgentSchemaInternal values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @private
   */
  private _registry = new ToolRegistry<Record<AgentName, IAgentSchemaInternal>>(
    "agentSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   * 
   * @private
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.agentSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   * 
   * @private
   */
  public set registry(value: ToolRegistry<Record<AgentName, IAgentSchemaInternal>>) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.agentSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates an agent schema shallowly, ensuring required fields and array properties meet basic integrity constraints.
   * Checks agentName, completion, and prompt as strings; ensures system, dependsOn, states, storages, and tools are arrays of unique strings if present.
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s validation needs.
   * Supports ClientAgent instantiation by ensuring schema validity before registration.
   * @throws {Error} If any validation check fails, with detailed messages including agentName and invalid values.
   * @private
   */
  private validateShallow = (agentSchema: IAgentSchemaInternal) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentSchemaService validateShallow`, {
        agentSchema,
      });
    if (typeof agentSchema.agentName !== "string") {
      throw new Error(
        `agent-swarm agent schema validation failed: missing agentName`
      );
    }
    if (!agentSchema.operator && typeof agentSchema.completion !== "string") {
      throw new Error(
        `agent-swarm agent schema validation failed: missing completion for agentName=${agentSchema.agentName}`
      );
    }
    if (!agentSchema.operator && agentSchema.prompt === undefined) {
      throw new Error(
        `agent-swarm agent schema validation failed: missing prompt for agentName=${agentSchema.agentName}`
      );
    }
    if (agentSchema.system && !Array.isArray(agentSchema.system)) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid system prompt for agentName=${agentSchema.agentName} system=${agentSchema.system}`
      );
    }
    if (
      agentSchema.system &&
      agentSchema.system.length !== new Set(agentSchema.system).size
    ) {
      throw new Error(
        `agent-swarm agent schema validation failed: found duplicate system prompt for agentName=${agentSchema.agentName} system=[${agentSchema.system}]`
      );
    }
    if (agentSchema.system?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid system prompt for agentName=${agentSchema.agentName} system=[${agentSchema.system}]`
      );
    }
    if (agentSchema.dependsOn && !Array.isArray(agentSchema.dependsOn)) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid dependsOn for agentName=${agentSchema.agentName} dependsOn=${agentSchema.dependsOn}`
      );
    }
    if (
      agentSchema.dependsOn &&
      agentSchema.dependsOn.length !== new Set(agentSchema.dependsOn).size
    ) {
      throw new Error(
        `agent-swarm agent schema validation failed: found duplicate dependsOn for agentName=${agentSchema.agentName} dependsOn=[${agentSchema.dependsOn}]`
      );
    }
    if (agentSchema.dependsOn?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid dependsOn for agentName=${agentSchema.agentName} dependsOn=[${agentSchema.dependsOn}]`
      );
    }
    if (agentSchema.states && !Array.isArray(agentSchema.states)) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid states for agentName=${agentSchema.agentName} states=${agentSchema.states}`
      );
    }
    if (
      agentSchema.states &&
      agentSchema.states.length !== new Set(agentSchema.states).size
    ) {
      throw new Error(
        `agent-swarm agent schema validation failed: found duplicate states for agentName=${agentSchema.agentName} states=[${agentSchema.states}]`
      );
    }
    if (agentSchema.states?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid states for agentName=${agentSchema.agentName} states=[${agentSchema.states}]`
      );
    }
    if (agentSchema.storages && !Array.isArray(agentSchema.storages)) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid storages for agentName=${agentSchema.agentName} storages=${agentSchema.storages}`
      );
    }
    if (
      agentSchema.storages &&
      agentSchema.storages.length !== new Set(agentSchema.storages).size
    ) {
      throw new Error(
        `agent-swarm agent schema validation failed: found duplicate storages for agentName=${agentSchema.agentName} storages=[${agentSchema.storages}]`
      );
    }
    if (agentSchema.storages?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid storages for agentName=${agentSchema.agentName} storages=[${agentSchema.storages}]`
      );
    }
    if (agentSchema.wikiList && !Array.isArray(agentSchema.wikiList)) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid wikiList for agentName=${agentSchema.agentName} wikiList=${agentSchema.wikiList}`
      );
    }
    if (
      agentSchema.wikiList &&
      agentSchema.wikiList.length !== new Set(agentSchema.wikiList).size
    ) {
      throw new Error(
        `agent-swarm agent schema validation failed: found duplicate wikiList for agentName=${agentSchema.agentName} wikiList=[${agentSchema.wikiList}]`
      );
    }
    if (agentSchema.wikiList?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid wikiList for agentName=${agentSchema.agentName} wikiList=[${agentSchema.wikiList}]`
      );
    }
    if (agentSchema.tools && !Array.isArray(agentSchema.tools)) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid tools for agentName=${agentSchema.agentName} tools=${agentSchema.tools}`
      );
    }
    if (
      agentSchema.tools &&
      agentSchema.tools.length !== new Set(agentSchema.tools).size
    ) {
      throw new Error(
        `agent-swarm agent schema validation failed: found duplicate tools for agentName=${agentSchema.agentName} tools=[${agentSchema.tools}]`
      );
    }
    if (agentSchema.tools?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid tools for agentName=${agentSchema.agentName} tools=[${agentSchema.tools}]`
      );
    }
    if (agentSchema.mcp && !Array.isArray(agentSchema.mcp)) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid mcp for agentName=${agentSchema.agentName} mcp=${agentSchema.mcp}`
      );
    }
    if (
      agentSchema.mcp &&
      agentSchema.mcp.length !== new Set(agentSchema.mcp).size
    ) {
      throw new Error(
        `agent-swarm agent schema validation failed: found duplicate mcp for agentName=${agentSchema.agentName} mcp=[${agentSchema.mcp}]`
      );
    }
    if (agentSchema.mcp?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm agent schema validation failed: invalid mcp for agentName=${agentSchema.agentName} mcp=[${agentSchema.mcp}]`
      );
    }
  };

  /**
   * Registers a new agent schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (agentName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s schema usage.
   * Supports ClientAgent instantiation by providing validated schemas to AgentConnectionService and SwarmConnectionService.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
   */
  public register = (key: AgentName, value: IAgentSchemaInternal) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing agent schema in the registry with a new schema.
   * Replaces the schema associated with the provided key (agentName) in the ToolRegistry.
   * Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports dynamic updates to agent schemas for AgentConnectionService and SwarmConnectionService.
   * @throws {Error} If the key does not exist in the registry (inherent to ToolRegistry.override behavior).
   */
  public override = (key: AgentName, value: Partial<IAgentSchemaInternal>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves an agent schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports AgentConnectionService’s getAgent method by providing schema data for agent instantiation, and SwarmConnectionService’s swarm configuration.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
   */
  public get = (key: AgentName): IAgentSchemaInternal => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * Default export of the AgentSchemaService class.
 * Provides the primary service for managing agent schemas in the swarm system, integrating with AgentConnectionService, SwarmConnectionService, ClientAgent, and AgentMetaService, with validated schema storage via ToolRegistry.
*/
export default AgentSchemaService;
