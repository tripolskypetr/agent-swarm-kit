import swarm from "../lib";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../interfaces/Storage.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import beginContext from "../utils/beginContext";

/**
 * Type definition for a shared storage object, mapping IStorage keys to unknown values.
 * @typedef {{ [key in keyof IStorage]: unknown }} TSharedStorage
 */
type TSharedStorage = {
  [key in keyof IStorage]: unknown;
};

/** @private Constant for logging the take method in SharedStorageUtils */
const METHOD_NAME_TAKE = "SharedStorageUtils.take";

/** @private Constant for logging the upsert method in SharedStorageUtils */
const METHOD_NAME_UPSERT = "SharedStorageUtils.upsert";

/** @private Constant for logging the remove method in SharedStorageUtils */
const METHOD_NAME_REMOVE = "SharedStorageUtils.remove";

/** @private Constant for logging the get method in SharedStorageUtils */
const METHOD_NAME_GET = "SharedStorageUtils.get";

/** @private Constant for logging the list method in SharedStorageUtils */
const METHOD_NAME_LIST = "SharedStorageUtils.list";

/** @private Constant for logging the createNumericIndex method in SharedStorageUtils */
const METHOD_NAME_CREATE_NUMERIC_INDEX =
  "SharedStorageUtils.createNumericIndex";

/** @private Constant for logging the clear method in SharedStorageUtils */
const METHOD_NAME_CLEAR = "SharedStorageUtils.clear";

/**
 * Utility class for managing shared storage within an agent swarm.
 * Provides methods to manipulate and query storage data, interfacing with the swarm's shared storage service.
 * @implements {TSharedStorage}
 */
export class SharedStorageUtils implements TSharedStorage {
  /**
   * Retrieves a specified number of items from storage matching a search query.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
   * @template T - The type of the storage data items, defaults to IStorageData.
   * @param {Object} payload - The payload containing search and storage details.
   * @param {string} payload.search - The search query to filter items.
   * @param {number} payload.total - The maximum number of items to retrieve.
   * @param {StorageName} payload.storageName - The name of the storage to query.
   * @param {number} [payload.score] - Optional relevance score threshold for filtering items.
   * @returns {Promise<T[]>} A promise resolving to an array of matching storage items.
   * @throws {Error} If storage validation fails or the shared storage service encounters an error.
   */
  public take = beginContext(
    async (payload: {
      search: string;
      total: number;
      storageName: StorageName;
      score?: number;
    }) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_TAKE, {
          search: payload.search,
          total: payload.total,
          storageName: payload.storageName,
          score: payload.score,
        });
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_TAKE
      );
      return await swarm.sharedStoragePublicService.take(
        payload.search,
        payload.total,
        METHOD_NAME_TAKE,
        payload.storageName,
        payload.score
      );
    }
  ) as <T extends IStorageData = IStorageData>(payload: {
    search: string;
    total: number;
    storageName: StorageName;
    score?: number;
  }) => Promise<T[]>;

  /**
   * Inserts or updates an item in the storage.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
   * @template T - The type of the storage data item, defaults to IStorageData.
   * @param {T} item - The item to upsert into the storage.
   * @param {StorageName} storageName - The name of the storage to update.
   * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
   * @throws {Error} If storage validation fails or the shared storage service encounters an error.
   */
  public upsert = beginContext(
    async (item: IStorageData, storageName: StorageName): Promise<void> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_UPSERT, {
          item,
          storageName,
        });
      swarm.storageValidationService.validate(storageName, METHOD_NAME_UPSERT);
      return await swarm.sharedStoragePublicService.upsert(
        item,
        METHOD_NAME_UPSERT,
        storageName
      );
    }
  ) as <T extends IStorageData = IStorageData>(
    item: T,
    storageName: StorageName
  ) => Promise<void>;

  /**
   * Removes an item from the storage by its ID.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @param {StorageName} storageName - The name of the storage to modify.
   * @returns {Promise<void>} A promise that resolves when the removal operation is complete.
   * @throws {Error} If storage validation fails or the shared storage service encounters an error.
   */
  public remove = beginContext(
    async (
      itemId: IStorageData["id"],
      storageName: StorageName
    ): Promise<void> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_REMOVE, {
          itemId,
          storageName,
        });
      swarm.storageValidationService.validate(storageName, METHOD_NAME_REMOVE);
      return await swarm.sharedStoragePublicService.remove(
        itemId,
        METHOD_NAME_REMOVE,
        storageName
      );
    }
  ) as (itemId: IStorageData["id"], storageName: StorageName) => Promise<void>;

  /**
   * Retrieves an item from the storage by its ID.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
   * @template T - The type of the storage data item, defaults to IStorageData.
   * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
   * @param {StorageName} storageName - The name of the storage to query.
   * @returns {Promise<T | null>} A promise resolving to the item if found, or null if not found.
   * @throws {Error} If storage validation fails or the shared storage service encounters an error.
   */
  public get = beginContext(
    async (
      itemId: IStorageData["id"],
      storageName: StorageName
    ): Promise<IStorageData | null> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_GET, {
          itemId: itemId,
          storageName: storageName,
        });
      swarm.storageValidationService.validate(storageName, METHOD_NAME_GET);
      return await swarm.sharedStoragePublicService.get(
        itemId,
        METHOD_NAME_GET,
        storageName
      );
    }
  ) as <T extends IStorageData = IStorageData>(
    itemId: IStorageData["id"],
    storageName: StorageName
  ) => Promise<T | null>;

  /**
   * Lists all items in the storage, optionally filtered by a predicate.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
   * @template T - The type of the storage data items, defaults to IStorageData.
   * @param {StorageName} storageName - The name of the storage to query.
   * @param {(item: T) => boolean} [filter] - Optional function to filter items; only items returning true are included.
   * @returns {Promise<T[]>} A promise resolving to an array of storage items.
   * @throws {Error} If storage validation fails or the shared storage service encounters an error.
   */
  public list = beginContext(
    async (
      storageName: StorageName,
      filter?: (item: IStorageData) => boolean
    ) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_LIST, {
          storageName,
        });
      swarm.storageValidationService.validate(storageName, METHOD_NAME_LIST);
      return await swarm.sharedStoragePublicService.list(
        METHOD_NAME_LIST,
        storageName,
        filter
      );
    }
  ) as <T extends IStorageData = IStorageData>(
    storageName: StorageName,
    filter?: (item: T) => boolean
  ) => Promise<T[]>;

  /**
   * Creates a new numeric index for the specified storage.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
   * The numeric index is determined based on the current number of items in the storage.
   *
   * @param {StorageName} storageName - The name of the storage for which to create the numeric index.
   * @returns {Promise<number>} A promise resolving to the newly created numeric index.
   * @throws {Error} If storage validation fails or the shared storage service encounters an error.
   */
  public createNumericIndex = beginContext(async (storageName: StorageName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CREATE_NUMERIC_INDEX, {
        storageName,
      });
    swarm.storageValidationService.validate(storageName, METHOD_NAME_CREATE_NUMERIC_INDEX);
    const { length } = await swarm.sharedStoragePublicService.list(
      METHOD_NAME_CREATE_NUMERIC_INDEX,
      storageName
    );
    return length + 1;
  });

  /**
   * Clears all items from the storage.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
   * @param {StorageName} storageName - The name of the storage to clear.
   * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
   * @throws {Error} If storage validation fails or the shared storage service encounters an error.
   */
  public clear = beginContext(
    async (storageName: StorageName): Promise<void> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_CLEAR, {
          storageName,
        });
      swarm.storageValidationService.validate(storageName, METHOD_NAME_CLEAR);
      return await swarm.sharedStoragePublicService.clear(
        METHOD_NAME_CLEAR,
        storageName
      );
    }
  );
}

/**
 * Singleton instance of SharedStorageUtils for managing shared storage operations.
 * @type {SharedStorageUtils}
 */
export const SharedStorage = new SharedStorageUtils();

export default SharedStorage;
