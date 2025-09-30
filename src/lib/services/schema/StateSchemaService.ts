import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IStateSchema, StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * Service class for managing state schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IStateSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with StateConnectionService and SharedStateConnectionService (state configuration for ClientState), ClientAgent (state usage in execution), AgentSchemaService (state references in agent schemas), and StatePublicService (public state API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining state configurations (e.g., getState function, middlewares) used by client-specific and shared states within the swarm ecosystem.
*/
export class StateSchemaService {
  /**
   * Logger service instance, injected via DI, for logging state schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StateConnectionService and PerfService logging patterns.
   * @readonly
  */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Schema context service instance, injected via DI, for managing schema-related context operations.
   * Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.
   * @readonly
  */
  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  /**
   * Registry instance for storing state schemas, initialized with ToolRegistry from functools-kit.
   * Maps StateName keys to IStateSchema values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @private
  */
  private _registry = new ToolRegistry<Record<StateName, IStateSchema>>(
    "stateSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
  */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.stateSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
  */
  public set registry(value: ToolRegistry<Record<StateName, IStateSchema>>) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.stateSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates a state schema shallowly, ensuring required fields and optional properties meet basic integrity constraints.
   * Checks stateName as a string and getState as a function (required for state retrieval), and ensures middlewares, if present, is an array of functions.
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StateConnectionService’s configuration needs.
   * Supports ClientState instantiation in StateConnectionService and SharedStateConnectionService by ensuring schema validity before registration.
   * @throws {Error} If any validation check fails, with detailed messages including stateName.
   * @private
  */
  private validateShallow = (stateSchema: IStateSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateSchemaService validateShallow`, {
        stateSchema,
      });
    if (typeof stateSchema.stateName !== "string") {
      throw new Error(
        `agent-swarm state schema validation failed: missing stateName`
      );
    }
    if (typeof stateSchema.getDefaultState !== "function") {
      throw new Error(
        `agent-swarm state schema validation failed: missing getDefaultState for stateName=${stateSchema.stateName}`
      );
    }
    if (stateSchema.middlewares && !Array.isArray(stateSchema.middlewares)) {
      throw new Error(
        `agent-swarm state schema validation failed: invalid middlewares for stateName=${stateSchema.stateName} middlewares=${stateSchema.middlewares}`
      );
    }
    if (stateSchema.middlewares?.some((value) => typeof value !== "function")) {
      throw new Error(
        `agent-swarm state schema validation failed: invalid middlewares for stateName=${stateSchema.stateName} middlewares=[${stateSchema.middlewares}]`
      );
    }
  };

  /**
   * Registers a new state schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (stateName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StateConnectionService’s state management.
   * Supports ClientAgent execution by providing validated state schemas to StateConnectionService and SharedStateConnectionService for ClientState configuration.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
  */
  public register = (key: StateName, value: IStateSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing state schema in the registry with a new schema.
   * Replaces the schema associated with the provided key (stateName) in the ToolRegistry.
   * Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports dynamic updates to state schemas for StateConnectionService and SharedStateConnectionService.
   * @throws {Error} If the key does not exist in the registry (inherent to ToolRegistry.override behavior).
  */
  public override = (key: StateName, value: Partial<IStateSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves a state schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports StateConnectionService and SharedStateConnectionService by providing state configuration (e.g., getState, middlewares) for ClientState instantiation, referenced in AgentSchemaService schemas.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
  */
  public get = (key: StateName): IStateSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * Default export of the StateSchemaService class.
 * Provides the primary service for managing state schemas in the swarm system, integrating with StateConnectionService, SharedStateConnectionService, ClientAgent, AgentSchemaService, and StatePublicService, with validated schema storage via ToolRegistry.
*/
export default StateSchemaService;
