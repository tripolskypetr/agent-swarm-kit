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
 * @template T - The type of storage data, extending IStorageData.
 * @param {T} item - The item to create embeddings for.
 * @param {ClientStorage<T>} self - The ClientStorage instance.
 * @returns {Promise<readonly [any, any]>} A promise resolving to a tuple containing the embeddings and index.
 */
const CREATE_EMBEDDING_FN = async <T extends IStorageData = IStorageData>(
  item: T,
  self: ClientStorage<T>
) => {
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
 * Waits for the ClientStorage instance to initialize by loading initial data.
 * @param {ClientStorage} self - The ClientStorage instance.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 */
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
 * Upserts an item into the storage and updates related data.
 * @template T - The type of storage data, extending IStorageData.
 * @param {T} item - The item to upsert.
 * @param {ClientStorage<T>} self - The ClientStorage instance.
 * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
 */
const UPSERT_FN = async <T extends IStorageData = IStorageData>(
  item: T,
  self: ClientStorage<T>
) => {
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
 * Removes an item from the storage by its ID.
 * @param {IStorageData["id"]} itemId - The ID of the item to remove.
 * @param {ClientStorage} self - The ClientStorage instance.
 * @returns {Promise<void>} A promise that resolves when the remove operation is complete.
 */
const REMOVE_FN = async (itemId: IStorageData["id"], self: ClientStorage) => {
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
 * Clears all items from the storage.
 * @param {ClientStorage} self - The ClientStorage instance.
 * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
 */
const CLEAR_FN = async (self: ClientStorage) => {
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
 * @param {Partial<Payload<T>>} payload - The payload for the action.
 * @returns {Promise<void>} A promise that resolves when the action is complete.
 * @throws {Error} If an unknown action is provided.
 */
const DISPATCH_FN = async <T extends IStorageData = IStorageData>(
  action: Action,
  self: ClientStorage<T>,
  payload: Partial<Payload<T>>
) => {
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
 * ClientStorage class to manage storage operations with embedding-based search capabilities.
 * @template T - The type of storage data, extending IStorageData.
 */
export class ClientStorage<T extends IStorageData = IStorageData>
  implements IStorage<T>
{
  /** Internal map to store items by their IDs. */
  _itemMap = new Map<IStorageData["id"], T>();

  /**
   * Creates an instance of ClientStorage.
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
   * @param {Partial<Payload<T>>} payload - The payload for the action.
   * @returns {Promise<void>} A promise that resolves when the action is complete.
   */
  dispatch = queued(
    async (action, payload) => await DISPATCH_FN<T>(action, this, payload)
  ) as (action: Action, payload: Partial<Payload<T>>) => Promise<void>;

  /**
   * Creates embeddings for the given item, memoized by item ID.
   * @param {T} item - The item to create embeddings for.
   * @returns {Promise<readonly [any, any]>} A promise resolving to a tuple of embeddings and index.
   */
  _createEmbedding = memoize(
    ([{ id }]) => id,
    async (item: T) => await CREATE_EMBEDDING_FN(item, this)
  );

  /**
   * Waits for the initialization of the storage, loading initial data if available.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  waitForInit = singleshot(async () => await WAIT_FOR_INIT_FN(this));

  /**
   * Takes a specified number of items based on similarity to a search string.
   * @param {string} search - The search string to compare against stored items.
   * @param {number} total - The maximum number of items to return.
   * @param {number} [score=GLOBAL_CONFIG.CC_STORAGE_SEARCH_SIMILARITY] - The minimum similarity score for items to be included.
   * @returns {Promise<T[]>} A promise resolving to an array of items sorted by similarity.
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
   * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
   */
  async upsert(item: T) {
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
   * Removes an item from the storage by its ID.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @returns {Promise<void>} A promise that resolves when the remove operation is complete.
   */
  async remove(itemId: IStorageData["id"]) {
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
   * Clears all items from the storage.
   * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
   */
  async clear() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientStorage storageName=${this.params.storageName} clientId=${this.params.clientId} shared=${this.params.shared} clear scheduled`
      );
    return await this.dispatch("clear", {});
  }

  /**
   * Retrieves an item from the storage by its ID.
   * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
   * @returns {Promise<T | null>} A promise resolving to the item if found, or null if not found.
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
   * @param {(item: T) => boolean} [filter] - An optional predicate to filter items.
   * @returns {Promise<T[]>} A promise resolving to an array of items.
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
   * Disposes of the storage instance, invoking the onDispose callback if provided.
   * @returns {Promise<void>} A promise that resolves when disposal is complete.
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
