import { execpool, memoize, singleshot, SortedArray } from "functools-kit";
import {
  IStorage,
  IStorageData,
  IStorageParams,
} from "../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../config/params";
import { IBusEvent } from "../model/Event.model";

const WAIT_FOR_INIT_FN = async (self: ClientStorage) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientStorage storageName=${self.params.storageName} clientId=${self.params.clientId} shared=${self.params.shared} waitForInit`
    );
  if (!self.params.getData) {
    return;
  }
  const data = await self.params.getData(
    self.params.clientId,
    self.params.storageName
  );
  await Promise.all(
    data.map(
      execpool(self._createEmbedding, {
        delay: 10,
        maxExec: GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL,
      })
    )
  );
  self._itemMap = new Map(data.map((item) => [item.id, item]));
};

/**
 * ClientStorage class to manage storage operations.
 * @template T - The type of storage data.
 */
export class ClientStorage<T extends IStorageData = IStorageData>
  implements IStorage<T>
{
  _itemMap = new Map<IStorageData["id"], T>();

  /**
   * Creates an instance of ClientStorage.
   * @param {IStorageParams<T>} params - The storage parameters.
   */
  constructor(readonly params: IStorageParams<T>) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} CTOR`,
        {
          params,
        }
      );
    if (this.params.callbacks?.onInit) {
      this.params.callbacks.onInit(
        this.params.clientId,
        this.params.storageName
      );
    }
  }

  /**
   * Creates an embedding for the given item.
   * @param {T} item - The item to create an embedding for.
   * @returns {Promise<readonly [any, any]>} - The embeddings and index.
   */
  _createEmbedding = memoize(
    ([{ id }]) => id,
    async (item: T) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} _createEmbedding`,
          {
            id: item.id,
          }
        );
      const index = await this.params.createIndex(item);
      const embeddings = await this.params.createEmbedding(index);
      if (this.params.onCreate) {
        this.params.onCreate(
          index,
          embeddings,
          this.params.clientId,
          this.params.embedding
        );
      }
      return [embeddings, index] as const;
    }
  );

  /**
   * Waits for the initialization of the storage.
   * @returns {Promise<void>}
   */
  waitForInit = singleshot(async () => await WAIT_FOR_INIT_FN(this));

  /**
   * Takes a specified number of items based on the search criteria.
   * @param {string} search - The search string.
   * @param {number} total - The total number of items to take.
   * @param {number} [score=GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY] - The similarity score.
   * @returns {Promise<T[]>} - The list of items.
   */
  async take(
    search: string,
    total: number,
    score = GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY
  ): Promise<T[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} take`,
        {
          search,
          total,
        }
      );
    const indexed = new SortedArray<T>();
    const searchEmbeddings = await this.params.createEmbedding(search);
    if (this.params.onCreate) {
      this.params.onCreate(
        search,
        searchEmbeddings,
        this.params.clientId,
        this.params.embedding
      );
    }
    await Promise.all(
      Array.from(this._itemMap.values()).map(
        execpool(
          async (item) => {
            const [targetEmbeddings, index] = await this._createEmbedding(item);
            const score = await this.params.calculateSimilarity(
              searchEmbeddings,
              targetEmbeddings
            );
            if (this.params.onCompare) {
              this.params.onCompare(
                search,
                index,
                score,
                this.params.clientId,
                this.params.embedding
              );
            }
            indexed.push(item, score);
          },
          {
            delay: 10,
            maxExec: GLOBAL_CONFIG.CC_STORAGE_SEARCH_POOL,
          }
        )
      )
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} take indexed`,
        {
          indexed: indexed.getEntries(),
        }
      );
    if (this.params.callbacks?.onSearch) {
      this.params.callbacks?.onSearch(
        search,
        indexed,
        this.params.clientId,
        this.params.storageName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "take",
      source: "storage-bus",
      input: {
        search,
        total,
        score,
      },
      output: {
        indexed,
      },
      context: {
        storageName: this.params.storageName,
      },
      clientId: this.params.clientId,
    });
    return indexed.take(total, score);
  }

  /**
   * Upserts an item into the storage.
   * @param {T} item - The item to upsert.
   * @returns {Promise<void>}
   */
  async upsert(item: T) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} upsert`,
        {
          item,
        }
      );
    this._itemMap.set(item.id, item);
    this._createEmbedding.clear(item.id);
    await this._createEmbedding(item);
    if (this.params.callbacks?.onUpdate) {
      this.params.callbacks?.onUpdate(
        [...this._itemMap.values()],
        this.params.clientId,
        this.params.storageName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "upsert",
      source: "storage-bus",
      input: {
        item,
      },
      output: {},
      context: {
        storageName: this.params.storageName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Removes an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @returns {Promise<void>}
   */
  async remove(itemId: IStorageData["id"]) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} remove`,
        {
          id: itemId,
        }
      );
    this._itemMap.delete(itemId);
    this._createEmbedding.clear(itemId);
    if (this.params.callbacks?.onUpdate) {
      this.params.callbacks?.onUpdate(
        [...this._itemMap.values()],
        this.params.clientId,
        this.params.storageName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "remove",
      source: "storage-bus",
      input: {
        itemId,
      },
      output: {},
      context: {
        storageName: this.params.storageName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Clears all items from the storage.
   * @returns {Promise<void>}
   */
  async clear() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} clear`
      );
    this._itemMap.clear();
    this._createEmbedding.clear();
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "clear",
      source: "storage-bus",
      input: {},
      output: {},
      context: {
        storageName: this.params.storageName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Gets an item by its ID.
   * @param {IStorageData["id"]} itemId - The ID of the item to get.
   * @returns {Promise<T | null>} - The item or null if not found.
   */
  async get(itemId: IStorageData["id"]): Promise<T | null> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} get`,
        {
          id: itemId,
        }
      );
    const result = this._itemMap.get(itemId) ?? null;
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "get",
      source: "storage-bus",
      input: {
        itemId,
      },
      output: {
        result,
      },
      context: {
        storageName: this.params.storageName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Lists all items in the storage, optionally filtered by a predicate.
   * @param {(item: T) => boolean} [filter] - The filter predicate.
   * @returns {Promise<T[]>} - The list of items.
   */
  async list(filter?: (item: T) => boolean) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} list`
      );
    if (!filter) {
      return [...this._itemMap.values()];
    }
    const result: T[] = [];
    for (const item of this._itemMap.values()) {
      if (filter(item)) {
        result.push(item);
      }
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "list",
      source: "storage-bus",
      input: {},
      output: {
        result,
      },
      context: {
        storageName: this.params.storageName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Disposes of the state.
   * @returns {Promise<void>}
   */
  async dispose() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} dispose`
      );
    if (this.params.callbacks?.onDispose) {
      this.params.callbacks.onDispose(
        this.params.clientId,
        this.params.storageName
      );
    }
  }
}

export default ClientStorage;
