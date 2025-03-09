import swarm from "../lib";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../interfaces/Storage.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import beginContext from "../utils/beginContext";

type TSharedStorage = {
  [key in keyof IStorage]: unknown;
};

const METHOD_NAME_TAKE = "SharedStorageUtils.take";
const METHOD_NAME_UPSERT = "SharedStorageUtils.upsert";
const METHOD_NAME_REMOVE = "SharedStorageUtils.remove";
const METHOD_NAME_GET = "SharedStorageUtils.get";
const METHOD_NAME_LIST = "SharedStorageUtils.list";
const METHOD_NAME_CLEAR = "SharedStorageUtils.clear";

export class SharedStorageUtils implements TSharedStorage {
  /**
   * Takes items from the storage.
   * @param {string} search - The search query.
   * @param {number} total - The total number of items to take.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<T[]>} - A promise that resolves to an array of items.
   * @template T
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
   * Upserts an item in the storage.
   * @param {T} item - The item to upsert.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   * @template T
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
   * Removes an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
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
   * Gets an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to get.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<T | null>} - A promise that resolves to the item or null if not found.
   * @template T
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
   * Lists items from the storage.
   * @param {StorageName} storageName - The storage name.
   * @param {(item: T) => boolean} [filter] - Optional filter function.
   * @returns {Promise<T[]>} - A promise that resolves to an array of items.
   * @template T
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
   * Clears the storage.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
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

export const SharedStorage = new SharedStorageUtils();

export default SharedStorage;
