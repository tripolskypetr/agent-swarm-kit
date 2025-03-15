import {
  execpool,
  memoize,
  queued,
  singleshot,
  SortedArray,
} from "functools-kit";
import {
  IStorage,
  IStorageData,
  IStorageParams,
} from "../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../config/params";
import { IBusEvent } from "../model/Event.model";
import { Embeddings } from "../interfaces/Embedding.interface";

/**
 * Type representing possible storage actions.
 */
type Action = "upsert" | "remove" | "clear";

/**
 * Type representing the payload for storage actions.
 * @template T - The type of storage data, extending IStorageData.
 */
type Payload<T extends IStorageData = IStorageData> = {
  /** The ID of the item. */
  itemId: IStorageData["id"];
  /** The item data to upsert. */
  item: T;
};

/**
 * Creates embeddings and an index for a given item.
 * Invokes the onCreate callback if provided.
 * @template T - The type of storage data, extending IStorageData.
 * @param {T} item - The item to create embeddings for.
 * @param {ClientStorage<T>} self - The ClientStorage instance.
 * @returns {Promise<readonly [Embeddings, string]>} A tuple containing the embeddings and index.
 * @private
 */
const CREATE_EMBEDDING_FN = async <T extends IStorageData = IStorageData>(
  item: T,
  self: ClientStorage<T>
): Promise<readonly [Embeddings, string]> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientStorage storageName=${self.params.storageName} clientId=${self.params.clientId} shared=${self.params.shared} _createEmbedding`,
      {
        id: item.id,
      }
    );
  const index = await self.params.createIndex(item);
  const embeddings = await self.params.createEmbedding(index);
  if (self.params.onCreate) {
    self.params.onCreate(
      index,
      embeddings,
      self.params.clientId,
      self.params.embedding
    );
  }
  return [embeddings, index] as const;
};

/**
 * Waits for the ClientStorage instance to initialize by loading initial data and creating embeddings.
 * Uses an execution pool to process embeddings concurrently.
 * @param {ClientStorage} self - The ClientStorage instance.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 * @private
 */
const WAIT_FOR_INIT_FN = async (self: ClientStorage): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientStorage storageName=${self.params.storageName} clientId=${self.params.clientId} shared=${self.params.shared} waitForInit`
    );
  if (!self.params.getData) {
    return;
  }
  const data = await self.params.getData(
    self.params.clientId,
    self.params.storageName,
    await self.params.getDefaultData(
      self.params.clientId,
      self.params.storageName
    )
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
 * Upserts an item into the storage, updates embeddings, and persists the data.
 * Invokes the onUpdate callback and emits an event if configured.
 * @template T - The type of storage data, extending IStorageData.
 * @param {T} item - The item to upsert.
 * @param {ClientStorage<T>} self - The ClientStorage instance.
 * @returns {Promise<void>}
 * @private
 */
const UPSERT_FN = async <T extends IStorageData = IStorageData>(
  item: T,
  self: ClientStorage<T>
): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientStorage storageName=${self.params.storageName} clientId=${self.params.clientId} shared=${self.params.shared} upsert`,
      {
        item,
      }
    );
  self._itemMap.set(item.id, item);
  self._createEmbedding.clear(item.id);
  await self._createEmbedding(item);
  const data = [...self._itemMap.values()];
  if (self.params.setData) {
    await self.params.setData(
      data,
      self.params.clientId,
      self.params.storageName
    );
  }
  if (self.params.callbacks?.onUpdate) {
    self.params.callbacks?.onUpdate(
      data,
      self.params.clientId,
      self.params.storageName
    );
  }
  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "upsert",
    source: "storage-bus",
    input: {
      item,
    },
    output: {},
    context: {
      storageName: self.params.storageName,
    },
    clientId: self.params.clientId,
  });
};

/**
 * Removes an item from the storage by its ID and persists the updated data.
 * Invokes the onUpdate callback and emits an event if configured.
 * @param {IStorageData["id"]} itemId - The ID of the item to remove.
 * @param {ClientStorage} self - The ClientStorage instance.
 * @returns {Promise<void>}
 * @private
 */
const REMOVE_FN = async (itemId: IStorageData["id"], self: ClientStorage): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientStorage storageName=${self.params.storageName} clientId=${self.params.clientId} shared=${self.params.shared} remove`,
      {
        id: itemId,
      }
    );
  self._itemMap.delete(itemId);
  self._createEmbedding.clear(itemId);
  const data = [...self._itemMap.values()];
  if (self.params.setData) {
    await self.params.setData(
      data,
      self.params.clientId,
      self.params.storageName
    );
  }
  if (self.params.callbacks?.onUpdate) {
    self.params.callbacks?.onUpdate(
      data,
      self.params.clientId,
      self.params.storageName
    );
  }
  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "remove",
    source: "storage-bus",
    input: {
      itemId,
    },
    output: {},
    context: {
      storageName: self.params.storageName,
    },
    clientId: self.params.clientId,
  });
};

/**
 * Clears all items from the storage and persists the empty state.
 * Invokes the onUpdate callback and emits an event if configured.
 * @param {ClientStorage} self - The ClientStorage instance.
 * @returns {Promise<void>}
 * @private
 */
const CLEAR_FN = async (self: ClientStorage): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientStorage storageName=${self.params.storageName} clientId=${self.params.clientId} shared=${self.params.shared} clear`
    );
  self._itemMap.clear();
  self._createEmbedding.clear();
  const data = [];
  if (self.params.setData) {
    await self.params.setData(
      data,
      self.params.clientId,
      self.params.storageName
    );
  }
  if (self.params.callbacks?.onUpdate) {
    self.params.callbacks?.onUpdate(
      data,
      self.params.clientId,
      self.params.storageName
    );
  }
  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "clear",
    source: "storage-bus",
    input: {},
    output: {},
    context: {
      storageName: self.params.storageName,
    },
    clientId: self.params.clientId,
  });
};

/**
 * Dispatches a storage action (upsert, remove, or clear).
 * @template T - The type of storage data, extending IStorageData.
 * @param {Action} action - The action to perform ("upsert", "remove", or "clear").
 * @param {ClientStorage<T>} self - The ClientStorage instance.
 * @param {Partial<Payload<T>>} payload - The payload for the action (item or itemId).
 * @returns {Promise<void>} A promise that resolves when the action is complete.
 * @throws {Error} If an unknown action is provided or required payload fields are missing.
 * @private
 */
const DISPATCH_FN = async <T extends IStorageData = IStorageData>(
  action: Action,
  self: ClientStorage<T>,
  payload: Partial<Payload<T>>
): Promise<void> => {
  if (action === "clear") {
    return await CLEAR_FN(self);
  }
  if (action === "remove") {
    console.assert(
      payload.itemId,
      `agent-swarm ClientStorage REMOVE_FN payload.itemId is required`
    );
    return await REMOVE_FN(payload.itemId!, self);
  }
  if (action === "upsert") {
    console.assert(
      payload.item,
      `agent-swarm ClientStorage UPSERT_FN payload.item is required`
    );
    return await UPSERT_FN(payload.item!, self);
  }
  throw new Error("agent-swarm ClientStorage unknown action");
};

/**
 * Class managing storage operations with embedding-based search capabilities.
 * Supports upserting, removing, and searching items with similarity scoring.
 * @template T - The type of storage data, extending IStorageData.
 * @implements {IStorage<T>}
 */
export class ClientStorage<T extends IStorageData = IStorageData>
  implements IStorage<T>
{
  /** Internal map to store items by their IDs. */
  _itemMap = new Map<IStorageData["id"], T>();

  /**
   * Creates an instance of ClientStorage.
   * Invokes the onInit callback if provided.
   * @param {IStorageParams<T>} params - The storage parameters, including client ID, storage name, and callback functions.
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
   * Dispatches a storage action (upsert, remove, or clear) in a queued manner.
   * @param {Action} action - The action to perform ("upsert", "remove", or "clear").
   * @param {Partial<Payload<T>>} payload - The payload for the action (item or itemId).
   * @returns {Promise<void>} A promise that resolves when the action is complete.
   */
  dispatch = queued(
    async (action, payload) => await DISPATCH_FN<T>(action, this, payload)
  ) as (action: Action, payload: Partial<Payload<T>>) => Promise<void>;

  /**
   * Creates embeddings for the given item, memoized by item ID to avoid redundant calculations.
   * @param {T} item - The item to create embeddings for.
   * @returns {Promise<readonly [any, any]>} A tuple of embeddings and index.
   * @private
   */
  _createEmbedding = memoize(
    ([{ id }]) => id,
    async (item: T) => await CREATE_EMBEDDING_FN(item, this)
  );

  /**
   * Waits for the initialization of the storage, loading initial data and creating embeddings.
   * Ensures initialization happens only once using singleshot.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  waitForInit = singleshot(async (): Promise<void> => await WAIT_FOR_INIT_FN(this));

  /**
   * Retrieves a specified number of items based on similarity to a search string.
   * Uses embeddings and similarity scoring to sort and filter results.
   * @param {string} search - The search string to compare against stored items.
   * @param {number} total - The maximum number of items to return.
   * @param {number} [score=GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY] - The minimum similarity score for items to be included (defaults to global config).
   * @returns {Promise<T[]>} An array of items sorted by similarity, limited to the specified total and score threshold.
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
   * Upserts an item into the storage via the dispatch queue.
   * @param {T} item - The item to upsert.
   * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
   */
  async upsert(item: T): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} upsert scheduled`,
        {
          item,
        }
      );
    return await this.dispatch("upsert", {
      item,
    });
  }

  /**
   * Removes an item from the storage by its ID via the dispatch queue.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @returns {Promise<void>} A promise that resolves when the remove operation is complete.
   */
  async remove(itemId: IStorageData["id"]): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} remove scheduled`,
        {
          id: itemId,
        }
      );
    return await this.dispatch("remove", {
      itemId,
    });
  }

  /**
   * Clears all items from the storage via the dispatch queue.
   * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
   */
  async clear(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} clear scheduled`
      );
    return await this.dispatch("clear", {});
  }

  /**
   * Retrieves an item from the storage by its ID.
   * Emits an event with the result.
   * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
   * @returns {Promise<T | null>} The item if found, or null if not found.
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
   * Emits an event with the filtered result if a filter is provided.
   * @param {(item: T) => boolean} [filter] - An optional predicate to filter items.
   * @returns {Promise<T[]>} An array of items, filtered if a predicate is provided.
   */
  async list(filter?: (item: T) => boolean): Promise<T[]> {
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
   * Disposes of the storage instance, invoking the onDispose callback if provided.
   * @returns {Promise<void>} A promise that resolves when disposal is complete.
   */
  async dispose(): Promise<void> {
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
