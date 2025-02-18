import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import { TContextService } from "../base/ContextService";
import ClientStorage from "../../../client/ClientStorage";
import StorageSchemaService from "../schema/StorageSchemaService";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../../../interfaces/Storage.interface";
import EmbeddingSchemaService from "../schema/EmbeddingSchemaService";

/**
 * Service for managing storage connections.
 * @implements {IStorage}
 */
export class StorageConnectionService implements IStorage {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly contextService = inject<TContextService>(
    TYPES.contextService
  );

  private readonly storageSchemaService = inject<StorageSchemaService>(
    TYPES.storageSchemaService
  );

  private readonly embeddingSchemaService = inject<EmbeddingSchemaService>(
    TYPES.embeddingSchemaService
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
      const {
        createIndex,
        getData,
        embedding: embeddingName,
        callbacks,
      } = this.storageSchemaService.get(storageName);
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
        logger: this.loggerService,
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
    score?: number,
  ): Promise<IStorageData[]> => {
    this.loggerService.log(`storageConnectionService take`, {
      context: this.contextService.context,
      search,
      total,
      score,
    });
    const storage = this.getStorage(
      this.contextService.context.clientId,
      this.contextService.context.storageName
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
    this.loggerService.log(`storageConnectionService upsert`, {
      context: this.contextService.context,
      item,
    });
    const storage = this.getStorage(
      this.contextService.context.clientId,
      this.contextService.context.storageName
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
    this.loggerService.log(`storageConnectionService remove`, {
      context: this.contextService.context,
      itemId,
    });
    const storage = this.getStorage(
      this.contextService.context.clientId,
      this.contextService.context.storageName
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
    this.loggerService.log(`storageConnectionService get`, {
      context: this.contextService.context,
      itemId,
    });
    const storage = this.getStorage(
      this.contextService.context.clientId,
      this.contextService.context.storageName
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
    this.loggerService.log(`storageConnectionService list`, {
      context: this.contextService.context,
    });
    const storage = this.getStorage(
      this.contextService.context.clientId,
      this.contextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.list(filter);
  };

  /**
   * Clears all items from the storage.
   * @returns {Promise<void>}
   */
  public clear = async (): Promise<void> => {
    this.loggerService.log(`storageConnectionService clear`, {
      context: this.contextService.context,
    });
    const storage = this.getStorage(
      this.contextService.context.clientId,
      this.contextService.context.storageName
    );
    await storage.waitForInit();
    return await storage.clear();
  };

  /**
   * Disposes of the storage connection.
   * @returns {Promise<void>}
   */
  public dispose = async () => {
    this.loggerService.log(`storageConnectionService dispose`, {
      context: this.contextService.context,
    });
    const key = `${this.contextService.context.clientId}-${this.contextService.context.storageName}`;
    if (!this.getStorage.has(key)) {
      return;
    }
    this.getStorage.clear(key);
  };
}

export default StorageConnectionService;
