import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import { TMethodContextService } from "../context/MethodContextService";
import ClientStorage from "../../../client/ClientStorage";
import StorageSchemaService from "../schema/StorageSchemaService";
import { GLOBAL_CONFIG } from "../../../config/params";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../../../interfaces/Storage.interface";
import EmbeddingSchemaService from "../schema/EmbeddingSchemaService";
import SessionValidationService from "../validation/SessionValidationService";
import BusService from "../base/BusService";
import SharedStorageConnectionService from "./SharedStorageConnectionService";
import {
  PersistEmbeddingAdapter,
  PersistStorageAdapter,
} from "../../../classes/Persist";

/**
 * Service class for managing storage connections and operations in the swarm system.
 * Implements IStorage to provide an interface for storage instance management, data manipulation, and lifecycle operations, scoped to clientId and storageName.
 * Handles both client-specific storage and delegates to SharedStorageConnectionService for shared storage, tracked via a _sharedStorageSet.
 * Integrates with ClientAgent (storage in agent execution), StoragePublicService (public storage API), SharedStorageConnectionService (shared storage delegation), AgentConnectionService (storage initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientStorage instances by a composite key (clientId-storageName), ensuring efficient reuse across calls.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StorageSchemaService for storage configuration, EmbeddingSchemaService for embedding functionality, SessionValidationService for usage tracking, and SharedStorageConnectionService for shared storage handling.
 * @implements {IStorage}
 */
export class StorageConnectionService implements IStorage {
  /**
   * Logger service instance, injected via DI, for logging storage operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with StoragePublicService and PerfService logging patterns.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Bus service instance, injected via DI, for emitting storage-related events.
   * Passed to ClientStorage for event propagation (e.g., storage updates), aligning with BusService’s event system in AgentConnectionService.
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * Method context service instance, injected via DI, for accessing execution context.
   * Used to retrieve clientId and storageName in method calls, integrating with MethodContextService’s scoping in StoragePublicService.
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * Storage schema service instance, injected via DI, for retrieving storage configurations.
   * Provides configuration (e.g., persist, getData, embedding) to ClientStorage in getStorage, aligning with AgentMetaService’s schema management.
   * @private
   */
  private readonly storageSchemaService = inject<StorageSchemaService>(
    TYPES.storageSchemaService
  );

  /**
   * Session validation service instance, injected via DI, for tracking storage usage.
   * Used in getStorage and dispose to manage storage lifecycle, supporting SessionPublicService’s validation needs.
   * @private
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * Embedding schema service instance, injected via DI, for retrieving embedding configurations.
   * Provides embedding logic (e.g., calculateSimilarity, createEmbedding) to ClientStorage in getStorage, supporting similarity-based retrieval in take.
   * @private
   */
  private readonly embeddingSchemaService = inject<EmbeddingSchemaService>(
    TYPES.embeddingSchemaService
  );

  /**
   * Shared storage connection service instance, injected via DI, for delegating shared storage operations.
   * Used in getStorage to retrieve shared storage instances, integrating with SharedStorageConnectionService’s global storage management.
   * @private
   */
  private readonly sharedStorageConnectionService =
    inject<SharedStorageConnectionService>(
      TYPES.sharedStorageConnectionService
    );

  /**
   * Set of storage names marked as shared, used to track delegation to SharedStorageConnectionService.
   * Populated in getStorage and checked in dispose to avoid disposing shared storage.
   * @private
   */
  private _sharedStorageSet = new Set<StorageName>();

  /**
   * Retrieves or creates a memoized ClientStorage instance for a given client and storage name.
   * Uses functools-kit’s memoize to cache instances by a composite key (clientId-storageName), ensuring efficient reuse across calls.
   * Configures client-specific storage with schema data from StorageSchemaService, embedding logic from EmbeddingSchemaService, and persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG.
   * Delegates to SharedStorageConnectionService for shared storage (shared=true), tracking them in _sharedStorageSet.
   * Supports ClientAgent (storage in EXECUTE_FN), AgentConnectionService (storage initialization), and StoragePublicService (public API).
   */
  public getStorage = memoize(
    ([clientId, storageName]) => `${clientId}-${storageName}`,
    (clientId: string, storageName: StorageName) => {
      this.sessionValidationService.addStorageUsage(clientId, storageName);
      const {
        createIndex,
        persist = GLOBAL_CONFIG.CC_PERSIST_ENABLED_BY_DEFAULT,
        getData = persist
          ? PersistStorageAdapter.getData
          : GLOBAL_CONFIG.CC_DEFAULT_STORAGE_GET,
        setData = persist
          ? PersistStorageAdapter.setData
          : GLOBAL_CONFIG.CC_DEFAULT_STORAGE_SET,
        embedding: embeddingName,
        getDefaultData = () => [],
        shared = false,
        callbacks,
      } = this.storageSchemaService.get(storageName);
      if (shared) {
        this._sharedStorageSet.add(storageName);
        return this.sharedStorageConnectionService.getStorage(storageName);
      }
      const {
        persist: p = GLOBAL_CONFIG.CC_PERSIST_EMBEDDING_CACHE,
        writeEmbeddingCache = p
          ? PersistEmbeddingAdapter.writeEmbeddingCache
          : GLOBAL_CONFIG.CC_DEFAULT_WRITE_EMBEDDING_CACHE,
        readEmbeddingCache = p
          ? PersistEmbeddingAdapter.readEmbeddingCache
          : GLOBAL_CONFIG.CC_DEFAULT_READ_EMBEDDING_CACHE,
        calculateSimilarity,
        createEmbedding,
        callbacks: embedding,
      } = this.embeddingSchemaService.get(embeddingName);
      return new ClientStorage({
        clientId,
        storageName,
        embedding: embeddingName,
        writeEmbeddingCache,
        readEmbeddingCache,
        calculateSimilarity,
        createEmbedding,
        createIndex,
        getDefaultData,
        getData,
        setData,
        shared,
        logger: this.loggerService,
        bus: this.busService,
        ...embedding,
        callbacks,
      });
    }
  );

  /**
   * Retrieves a list of storage data items based on a search query, total count, and optional similarity score.
   * Delegates to ClientStorage.take after awaiting initialization, using context from MethodContextService to identify the storage, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StoragePublicService’s take, supporting ClientAgent’s similarity-based data retrieval with embedding support from EmbeddingSchemaService.
   */
  public take = async (
    search: string,
    total: number,
    score?: number
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageConnectionService take`, {
        search,
        total,
        score,
      });
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.take(search, total, score);
  };

  /**
   * Upserts an item into the storage, inserting or updating based on its ID.
   * Delegates to ClientStorage.upsert after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StoragePublicService’s upsert, supporting ClientAgent’s data persistence.
   */
  public upsert = async (item: IStorageData): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageConnectionService upsert`, {
        item,
      });
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.upsert(item);
  };

  /**
   * Removes an item from the storage by its ID.
   * Delegates to ClientStorage.remove after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StoragePublicService’s remove, supporting ClientAgent’s data deletion.
   */
  public remove = async (itemId: IStorageData["id"]): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageConnectionService remove`, {
        itemId,
      });
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.remove(itemId);
  };

  /**
   * Retrieves an item from the storage by its ID.
   * Delegates to ClientStorage.get after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StoragePublicService’s get, supporting ClientAgent’s data access, returning null if the item is not found.
   */
  public get = async (
    itemId: IStorageData["id"]
  ): Promise<IStorageData | null> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageConnectionService get`, {
        itemId,
      });
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.get(itemId);
  };

  /**
   * Retrieves a list of items from the storage, optionally filtered by a predicate function.
   * Delegates to ClientStorage.list after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StoragePublicService’s list, supporting ClientAgent’s bulk data access.
   */
  public list = async (
    filter?: (item: IStorageData) => boolean
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageConnectionService list`);
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.list(filter);
  };

  /**
   * Clears all items from the storage, resetting it to its default state.
   * Delegates to ClientStorage.clear after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors StoragePublicService’s clear, supporting ClientAgent’s storage reset.
   */
  public clear = async (): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageConnectionService clear`);
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.clear();
  };

  /**
   * Disposes of the storage connection, cleaning up resources and clearing the memoized instance for client-specific storage.
   * Checks if the storage exists in the memoization cache and is not shared (via _sharedStorageSet) before calling ClientStorage.dispose, then clears the cache and updates SessionValidationService.
   * Logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligns with StoragePublicService’s dispose and PerfService’s cleanup.
   * Shared storage is not disposed here, as it is managed by SharedStorageConnectionService.
   */
  public dispose = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.storageName}`;
    if (!this.getStorage.has(key)) {
      return;
    }
    if (
      !this._sharedStorageSet.has(this.methodContextService.context.storageName)
    ) {
      const storage = this.getStorage(
        this.methodContextService.context.clientId,
        this.methodContextService.context.storageName
      );
      await storage.waitForInit();
      await storage.dispose();
    }
    this.getStorage.clear(key);
    this.sessionValidationService.removeStorageUsage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
  };
}

/**
 * Default export of the StorageConnectionService class.
 * Provides the primary service for managing storage connections in the swarm system, integrating with ClientAgent, StoragePublicService, SharedStorageConnectionService, AgentConnectionService, and PerfService, with memoized storage management.
 */
export default StorageConnectionService;
