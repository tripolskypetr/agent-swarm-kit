import { ToolRegistry } from "functools-kit";
import {
  IEmbeddingSchema,
  EmbeddingName,
} from "../../../interfaces/Embedding.interface";
import LoggerService from "../base/LoggerService";
import { inject } from "../../core/di";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * Service class for managing embedding schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving IEmbeddingSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with StorageConnectionService and SharedStorageConnectionService (embedding logic for storage operations like take), ClientAgent (potential embedding use in execution), and AgentSchemaService (embedding references in agent schemas).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining embedding logic (e.g., calculateSimilarity and createEmbedding functions) used primarily in storage similarity searches within the swarm ecosystem.
*/
export class EmbeddingSchemaService {
  /**
   * Logger service instance, injected via DI, for logging embedding schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StorageConnectionService and PerfService logging patterns.
   * @private
   * @readonly
  */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Schema context service instance, injected via DI, for managing schema-related context operations.
   * Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.
   * @readonly
  */
  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  /**
   * Registry instance for storing embedding schemas, initialized with ToolRegistry from functools-kit.
   * Maps EmbeddingName keys to IEmbeddingSchema values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @private
  */
  private _registry = new ToolRegistry<Record<EmbeddingName, IEmbeddingSchema>>(
    "embeddingSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
  */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.embeddingSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
  */
  public set registry(
    value: ToolRegistry<Record<EmbeddingName, IEmbeddingSchema>>
  ) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.embeddingSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates an embedding schema shallowly, ensuring required fields meet basic integrity constraints.
   * Checks embeddingName as a string and calculateSimilarity and createEmbedding as functions, critical for storage operations in StorageConnectionService and SharedStorageConnectionService.
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with storage service needs.
   * Supports storage similarity searches (e.g., take method) by ensuring embedding schema validity before registration.
   * @throws {Error} If any validation check fails, with detailed messages including embeddingName.
   * @private
  */
  private validateShallow = (embeddingSchema: IEmbeddingSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`embeddingSchemaService validateShallow`, {
        embeddingSchema,
      });
    if (typeof embeddingSchema.embeddingName !== "string") {
      throw new Error(
        `agent-swarm embedding schema validation failed: missing embeddingName`
      );
    }
    if (typeof embeddingSchema.calculateSimilarity !== "function") {
      throw new Error(
        `agent-swarm embedding schema validation failed: missing calculateSimilarity for embeddingName=${embeddingSchema.embeddingName}`
      );
    }
    if (typeof embeddingSchema.createEmbedding !== "function") {
      throw new Error(
        `agent-swarm embedding schema validation failed: missing createEmbedding for embeddingName=${embeddingSchema.embeddingName}`
      );
    }
  };

  /**
   * Registers a new embedding schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (embeddingName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with StorageConnectionService’s embedding usage.
   * Supports storage operations (e.g., similarity-based retrieval in ClientStorage) by providing validated embedding schemas to StorageConnectionService and SharedStorageConnectionService.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
  */
  public register = (key: EmbeddingName, value: IEmbeddingSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("embeddingSchemaService register");
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing embedding schema in the registry with a new one.
   * Replaces the schema associated with the provided key in the ToolRegistry.
   * Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports updating embedding logic (e.g., calculateSimilarity and createEmbedding) for storage operations in StorageConnectionService and SharedStorageConnectionService.
   * @throws {Error} If the key does not exist in the registry (inherent to ToolRegistry.override behavior).
  */
  public override = (key: EmbeddingName, value: Partial<IEmbeddingSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`embeddingSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves an embedding schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports StorageConnectionService and SharedStorageConnectionService by providing embedding logic (calculateSimilarity and createEmbedding) for storage operations like take, referenced in storage schemas.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
  */
  public get = (key: EmbeddingName): IEmbeddingSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("embeddingSchemaService get", { key });
    return this.registry.get(key);
  };
}

/**
 * Default export of the EmbeddingSchemaService class.
 * Provides the primary service for managing embedding schemas in the swarm system, integrating with StorageConnectionService, SharedStorageConnectionService, ClientAgent, and AgentSchemaService, with validated schema storage via ToolRegistry.
*/
export default EmbeddingSchemaService;
