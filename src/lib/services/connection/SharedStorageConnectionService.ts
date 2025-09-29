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
import BusService from "../base/BusService";
import {
  PersistEmbeddingAdapter,
  PersistStorageAdapter,
} from "../../../classes/Persist";

/**
 * Service class for managing shared storage connections and operations in the swarm system.
 * Implements IStorage to provide an interface for shared storage instance management, data manipulation, and retrieval, scoped to storageName across all clients (using a fixed clientId of "shared").
 * Integrates with ClientAgent (shared storage in agent execution), StoragePublicService (client-specific storage counterpart), SharedStoragePublicService (public shared storage API), AgentConnectionService (storage initialization), and PerfService (tracking via BusService).
 * Uses memoization via functools-kit’s memoize to cache ClientStorage instances by storageName, ensuring a single shared instance across all clients.
 * Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), and coordinates with StorageSchemaService for storage configuration and EmbeddingSchemaService for embedding functionality, applying persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG.
 * @implements {IStorage}
 */
export class SharedStorageConnectionService implements IStorage {
  /**
   * Logger service instance, injected via DI, for logging shared storage operations.
   * Used across all methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with SharedStoragePublicService and PerfService logging patterns.
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
   * Used to retrieve storageName in method calls, integrating with MethodContextService’s scoping in SharedStoragePublicService.
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
   * Embedding schema service instance, injected via DI, for retrieving embedding configurations.
   * Provides embedding logic (e.g., calculateSimilarity, createEmbedding) to ClientStorage in getStorage, supporting similarity-based retrieval in take.
   * @private
   */
  private readonly embeddingSchemaService = inject<EmbeddingSchemaService>(
    TYPES.embeddingSchemaService
  );

  /**
   * Retrieves or creates a memoized ClientStorage instance for a given shared storage name.
   * Uses functools-kit’s memoize to cache instances by storageName, ensuring a single shared instance across all clients (fixed clientId: "shared").
   * Configures the storage with schema data from StorageSchemaService, embedding logic from EmbeddingSchemaService, and persistence via PersistStorageAdapter or defaults from GLOBAL_CONFIG, enforcing shared=true via an error check.
   * Supports ClientAgent (shared storage in EXECUTE_FN), AgentConnectionService (storage initialization), and SharedStoragePublicService (public API).
   * @throws {Error} If the storage is not marked as shared in the schema.
   */
  public getStorage = memoize(
    ([storageName]) => `${storageName}`,
    (storageName: StorageName) => {
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
        shared = false,
        getDefaultData = () => [],
        callbacks,
      } = this.storageSchemaService.get(storageName);
      if (!shared) {
        throw new Error(
          `agent-swarm storage not shared storageName=${storageName}`
        );
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
        clientId: "shared",
        storageName,
        embedding: embeddingName,
        writeEmbeddingCache,
        readEmbeddingCache,
        calculateSimilarity,
        createEmbedding,
        createIndex,
        getData,
        setData,
        shared,
        getDefaultData,
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
   * Mirrors SharedStoragePublicService’s take, supporting ClientAgent’s similarity-based data retrieval with embedding support from EmbeddingSchemaService.
   */
  public take = async (
    search: string,
    total: number,
    score?: number
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStorageConnectionService take`, {
        search,
        total,
        score,
      });
    const storage = this.getStorage(
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.take(search, total, score);
  };

  /**
   * Upserts an item into the shared storage, inserting or updating based on its ID.
   * Delegates to ClientStorage.upsert after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStoragePublicService’s upsert, supporting ClientAgent’s data persistence.
   */
  public upsert = async (item: IStorageData): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStorageConnectionService upsert`, {
        item,
      });
    const storage = this.getStorage(
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.upsert(item);
  };

  /**
   * Removes an item from the shared storage by its ID.
   * Delegates to ClientStorage.remove after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStoragePublicService’s remove, supporting ClientAgent’s data deletion.
   */
  public remove = async (itemId: IStorageData["id"]): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStorageConnectionService remove`, {
        itemId,
      });
    const storage = this.getStorage(
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.remove(itemId);
  };

  /**
   * Retrieves an item from the shared storage by its ID.
   * Delegates to ClientStorage.get after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStoragePublicService’s get, supporting ClientAgent’s data access.
   */
  public get = async (
    itemId: IStorageData["id"]
  ): Promise<IStorageData | null> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStorageConnectionService get`, {
        itemId,
      });
    const storage = this.getStorage(
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.get(itemId);
  };

  /**
   * Retrieves a list of items from the shared storage, optionally filtered by a predicate function.
   * Delegates to ClientStorage.list after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStoragePublicService’s list, supporting ClientAgent’s bulk data access.
   */
  public list = async (
    filter?: (item: IStorageData) => boolean
  ): Promise<IStorageData[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStorageConnectionService list`);
    const storage = this.getStorage(
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.list(filter);
  };

  /**
   * Clears all items from the shared storage, resetting it to its default state.
   * Delegates to ClientStorage.clear after awaiting initialization, using context from MethodContextService, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Mirrors SharedStoragePublicService’s clear, supporting ClientAgent’s storage reset.
   */
  public clear = async (): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedStorageConnectionService clear`);
    const storage = this.getStorage(
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.clear();
  };
}

/**
 * Default export of the SharedStorageConnectionService class.
 * Provides the primary service for managing shared storage connections in the swarm system, integrating with ClientAgent, StoragePublicService, SharedStoragePublicService, AgentConnectionService, and PerfService, with memoized storage management.
 */
export default SharedStorageConnectionService;
