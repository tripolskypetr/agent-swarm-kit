import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import { TMethodContextService } from "../context/MethodContextService";
import ClientStorage from "../../../client/ClientStorage";
import StorageSchemaService from "../schema/StorageSchemaService";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../../../interfaces/Storage.interface";
import EmbeddingSchemaService from "../schema/EmbeddingSchemaService";
import SessionValidationService from "../validation/SessionValidationService";
import BusService from "../base/BusService";

/**
 * Service for managing storage connections.
 * @implements {IStorage}
 */
export class StorageConnectionService implements IStorage {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  private readonly storageSchemaService = inject<StorageSchemaService>(
    TYPES.storageSchemaService
  );

  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  private readonly embeddingSchemaService = inject<EmbeddingSchemaService>(
    TYPES.embeddingSchemaService
  );

  /**
   * Retrieves a shared storage instance based on storage name.
   * @param {string} clientId - The client ID.
   * @param {string} storageName - The storage name.
   * @returns {ClientStorage} The client storage instance.
   */
  public getSharedStorage = memoize(
    ([, storageName]) => `${storageName}`,
    (clientId: string, storageName: StorageName) => {
      const {
        createIndex,
        getData,
        embedding: embeddingName,
        shared,
        callbacks,
      } = this.storageSchemaService.get(storageName);
      const {
        calculateSimilarity,
        createEmbedding,
        callbacks: embedding,
      } = this.embeddingSchemaService.get(embeddingName);
      if (!shared) {
        throw new Error(
          `agent-swarm storage not shared storageName=${storageName}`
        );
      }
      return new ClientStorage({
        clientId,
        storageName,
        embedding: embeddingName,
        calculateSimilarity,
        createEmbedding,
        createIndex,
        getData,
        shared,
        logger: this.loggerService,
        bus: this.busService,
        ...embedding,
        callbacks,
      });
    }
  );

  /**
   * Retrieves a storage instance based on client ID and storage name.
   * @param {string} clientId - The client ID.
   * @param {string} storageName - The storage name.
   * @returns {ClientStorage} The client storage instance.
   */
  public getStorage = memoize(
    ([clientId, storageName]) => `${clientId}-${storageName}`,
    (clientId: string, storageName: StorageName) => {
      this.sessionValidationService.addStorageUsage(clientId, storageName);
      const {
        createIndex,
        getData,
        embedding: embeddingName,
        shared = false,
        callbacks,
      } = this.storageSchemaService.get(storageName);
      if (shared) {
        return this.getSharedStorage(clientId, storageName);
      }
      const {
        calculateSimilarity,
        createEmbedding,
        callbacks: embedding,
      } = this.embeddingSchemaService.get(embeddingName);
      return new ClientStorage({
        clientId,
        storageName,
        embedding: embeddingName,
        calculateSimilarity,
        createEmbedding,
        createIndex,
        getData,
        shared,
        logger: this.loggerService,
        bus: this.busService,
        ...embedding,
        callbacks,
      });
    }
  );

  /**
   * Retrieves a list of storage data based on a search query and total number of items.
   * @param {string} search - The search query.
   * @param {number} total - The total number of items to retrieve.
   * @returns {Promise<IStorageData[]>} The list of storage data.
   */
  public take = async (
    search: string,
    total: number,
    score?: number
  ): Promise<IStorageData[]> => {
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
   * Upserts an item in the storage.
   * @param {IStorageData} item - The item to upsert.
   * @returns {Promise<void>}
   */
  public upsert = async (item: IStorageData): Promise<void> => {
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
   * Removes an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @returns {Promise<void>}
   */
  public remove = async (itemId: IStorageData["id"]): Promise<void> => {
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
   * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
   * @returns {Promise<IStorageData>} The retrieved item.
   */
  public get = async (
    itemId: IStorageData["id"]
  ): Promise<IStorageData | null> => {
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
   * @param {function(IStorageData): boolean} [filter] - The optional filter function.
   * @returns {Promise<IStorageData[]>} The list of items.
   */
  public list = async (
    filter?: (item: IStorageData) => boolean
  ): Promise<IStorageData[]> => {
    this.loggerService.info(`storageConnectionService list`);
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.list(filter);
  };

  /**
   * Clears all items from the storage.
   * @returns {Promise<void>}
   */
  public clear = async (): Promise<void> => {
    this.loggerService.info(`storageConnectionService clear`);
    const storage = this.getStorage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.clear();
  };

  /**
   * Disposes of the storage connection.
   * @returns {Promise<void>}
   */
  public dispose = async () => {
    this.loggerService.info(`storageConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.storageName}`;
    if (!this.getStorage.has(key)) {
      return;
    }
    if (!this.getSharedStorage.has(this.methodContextService.context.storageName)) {
      const storage = this.getSharedStorage(
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

export default StorageConnectionService;
