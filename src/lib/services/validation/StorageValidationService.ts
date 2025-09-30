import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  StorageName,
  IStorageSchema,
} from "../../../interfaces/Storage.interface";
import { memoize } from "functools-kit";
import EmbeddingValidationService from "./EmbeddingValidationService";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating storage configurations within the swarm system.
 * Manages a map of registered storages, ensuring their uniqueness, existence, and valid embedding configurations.
 * Integrates with StorageSchemaService (storage registration), ClientStorage (storage operations),
 * AgentValidationService (validating agent storages), EmbeddingValidationService (embedding validation),
 * and LoggerService (logging).
 * Uses dependency injection for services and memoization for efficient validation checks.
*/
export class StorageValidationService {
  /**
   * Logger service instance for logging validation operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Embedding validation service instance for validating embeddings associated with storages.
   * Injected via DI, used in validate method to check storage.embedding.
   * @private
   * @readonly
   */
  private readonly embeddingValidationService =
    inject<EmbeddingValidationService>(TYPES.embeddingValidationService);

  /**
   * Map of storage names to their schemas, used to track and validate storages.
   * Populated by addStorage, queried by validate.
   * @private
   */
  private _storageMap = new Map<StorageName, IStorageSchema>();

  /**
   * Registers a new storage with its schema in the validation service.
   * Logs the operation and ensures uniqueness, supporting StorageSchemaService’s registration process.
   * @throws {Error} If the storage name already exists in _storageMap.
   */
  public addStorage = (
    storageName: StorageName,
    storageSchema: IStorageSchema
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("storageValidationService addStorage", {
        storageName,
        storageSchema,
      });
    if (this._storageMap.has(storageName)) {
      throw new Error(`storage-swarm storage ${storageName} already exist`);
    }
    this._storageMap.set(storageName, storageSchema);
  };

  /**
   * Validates a storage by its name and source, memoized by storageName for performance.
   * Checks storage existence and validates its embedding, supporting ClientStorage’s operational integrity.
   * @throws {Error} If the storage is not found in _storageMap or its embedding is invalid.
   */
  public validate = memoize(
    ([storageName]) => storageName,
    (storageName: StorageName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("storageValidationService validate", {
          storageName,
          source,
        });
      const storage = this._storageMap.get(storageName);
      if (!storage) {
        throw new Error(
          `storage-swarm storage ${storageName} not found source=${source}`
        );
      }
      this.embeddingValidationService.validate(storage.embedding, source);
      return true as never;
    }
  ) as (storageName: StorageName, source: string) => void;
}

/**
 * Default export of the StorageValidationService class.
 * Provides a service for validating storage configurations in the swarm system,
 * integrating with StorageSchemaService, ClientStorage, AgentValidationService,
 * EmbeddingValidationService, and LoggerService,
 * with memoized validation and embedding consistency checks.
*/
export default StorageValidationService;
