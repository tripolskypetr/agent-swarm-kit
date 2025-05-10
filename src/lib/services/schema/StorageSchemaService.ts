import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import {
  IStorageSchema,
  StorageName,
} from "../../../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * Service class for managing storage schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IStorageSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with StorageConnectionService and SharedStorageConnectionService (storage configuration for ClientStorage), EmbeddingSchemaService (embedding references), AgentSchemaService (storage references in agent schemas), ClientAgent (storage usage in execution), and StoragePublicService (public storage API).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining storage configurations (e.g., createIndex function, embedding reference) used by client-specific and shared storage instances within the swarm ecosystem.
 */
export class StorageSchemaService {
  /**
   * Logger service instance, injected via DI, for logging storage schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StorageConnectionService and PerfService logging patterns.
   * @type {LoggerService}
   * @readonly
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

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
   * Registry instance for storing storage schemas, initialized with ToolRegistry from functools-kit.
   * Maps StorageName keys to IStorageSchema values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @type {ToolRegistry<Record<StorageName, IStorageSchema>>}
   * @private
   */
  private _registry = new ToolRegistry<Record<StorageName, IStorageSchema>>(
    "storageSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.storageSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   */
  public set registry(value: ToolRegistry<Record<StorageName, IStorageSchema>>) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.storageSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates a storage schema shallowly, ensuring required fields meet basic integrity constraints.
   * Checks storageName as a string, createIndex as a function (for indexing storage data), and embedding as a string (referencing an EmbeddingName from EmbeddingSchemaService).
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s configuration needs.
   * Supports ClientStorage instantiation in StorageConnectionService and SharedStorageConnectionService by ensuring schema validity before registration.
   * @param {IStorageSchema} storageSchema - The storage schema to validate, sourced from Storage.interface.
   * @throws {Error} If any validation check fails, with detailed messages including storageName.
   * @private
   */
  private validateShallow = (storageSchema: IStorageSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageSchemaService validateShallow`, {
        storageSchema,
      });
    if (typeof storageSchema.storageName !== "string") {
      throw new Error(
        `agent-swarm storage schema validation failed: missing storageName`
      );
    }
    if (typeof storageSchema.createIndex !== "function") {
      throw new Error(
        `agent-swarm storage schema validation failed: missing createIndex for storageName=${storageSchema.storageName}`
      );
    }
    if (typeof storageSchema.embedding !== "string") {
      throw new Error(
        `agent-swarm storage schema validation failed: missing embedding for storageName=${storageSchema.storageName}`
      );
    }
  };

  /**
   * Registers a new storage schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (storageName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s storage management.
   * Supports ClientAgent execution by providing validated storage schemas to StorageConnectionService and SharedStorageConnectionService for ClientStorage configuration.
   * @param {StorageName} key - The name of the storage, used as the registry key, sourced from Storage.interface.
   * @param {IStorageSchema} value - The storage schema to register, sourced from Storage.interface, validated before storage.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
   */
  public register = (key: StorageName, value: IStorageSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing storage schema in the registry with a new schema.
   * Replaces the schema associated with the provided key in the ToolRegistry.
   * Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports updates to storage configurations for ClientStorage and SharedStorageConnectionService.
   * @param {StorageName} key - The name of the storage to override, sourced from Storage.interface.
   * @param {IStorageSchema} value - The new storage schema to replace the existing one, sourced from Storage.interface.
   * @throws {Error} If the key does not exist in the registry (inherent to ToolRegistry.override behavior).
   */
  public override = (key: StorageName, value: Partial<IStorageSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves a storage schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports StorageConnectionService and SharedStorageConnectionService by providing storage configuration (e.g., createIndex, embedding) for ClientStorage instantiation, referenced in AgentSchemaService schemas via the storages field.
   * @param {StorageName} key - The name of the storage to retrieve, sourced from Storage.interface.
   * @returns {IStorageSchema} The storage schema associated with the key, sourced from Storage.interface, including createIndex and embedding fields.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
   */
  public get = (key: StorageName): IStorageSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * Default export of the StorageSchemaService class.
 * Provides the primary service for managing storage schemas in the swarm system, integrating with StorageConnectionService, SharedStorageConnectionService, EmbeddingSchemaService, AgentSchemaService, ClientAgent, and StoragePublicService, with validated schema storage via ToolRegistry.
 * @type {typeof StorageSchemaService}
 */
export default StorageSchemaService;
