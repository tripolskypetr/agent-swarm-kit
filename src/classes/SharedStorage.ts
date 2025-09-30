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
*/
type TSharedStorage = {
  [key in keyof IStorage]: unknown;
};

/** @private Constant for logging the take method in SharedStorageUtils*/
const METHOD_NAME_TAKE = "SharedStorageUtils.take";

/** @private Constant for logging the upsert method in SharedStorageUtils*/
const METHOD_NAME_UPSERT = "SharedStorageUtils.upsert";

/** @private Constant for logging the remove method in SharedStorageUtils*/
const METHOD_NAME_REMOVE = "SharedStorageUtils.remove";

/** @private Constant for logging the get method in SharedStorageUtils*/
const METHOD_NAME_GET = "SharedStorageUtils.get";

/** @private Constant for logging the list method in SharedStorageUtils*/
const METHOD_NAME_LIST = "SharedStorageUtils.list";

/** @private Constant for logging the createNumericIndex method in SharedStorageUtils*/
const METHOD_NAME_CREATE_NUMERIC_INDEX =
  "SharedStorageUtils.createNumericIndex";

/** @private Constant for logging the clear method in SharedStorageUtils*/
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
   * Clears all items from the storage.
   * Executes within a context for logging and validation, ensuring the storage name is valid.
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
*/
export const SharedStorage = new SharedStorageUtils();

export default SharedStorage;
