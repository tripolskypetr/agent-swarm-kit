import swarm from "../lib";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../interfaces/Storage.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";

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
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<T[]>} - A promise that resolves to an array of items.
   * @template T
   */
  public take = async <T extends IStorageData = IStorageData>(payload: {
    search: string;
    total: number;
    agentName: AgentName;
    storageName: StorageName;
    score?: number;
  }): Promise<T[]> => {
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
    if (
      !swarm.agentValidationService.hasStorage(
        payload.agentName,
        payload.storageName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStorageUtils ${payload.storageName} not registered in ${payload.agentName} (take)`
      );
    }
    return (await swarm.sharedStoragePublicService.take(
      payload.search,
      payload.total,
      METHOD_NAME_TAKE,
      payload.storageName,
      payload.score
    )) as T[];
  };

  /**
   * Upserts an item in the storage.
   * @param {T} item - The item to upsert.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   * @template T
   */
  public upsert = async <T extends IStorageData = IStorageData>(payload: {
    item: T;
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_UPSERT, {
        item: payload.item,
        storageName: payload.storageName,
      });
    swarm.storageValidationService.validate(
      payload.storageName,
      METHOD_NAME_UPSERT
    );
    if (
      !swarm.agentValidationService.hasStorage(
        payload.agentName,
        payload.storageName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStorageUtils ${payload.storageName} not registered in ${payload.agentName} (upsert)`
      );
    }
    return await swarm.sharedStoragePublicService.upsert(
      payload.item,
      METHOD_NAME_UPSERT,
      payload.storageName
    );
  };

  /**
   * Removes an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  public remove = async (payload: {
    itemId: IStorageData["id"];
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_REMOVE, {
        itemId: payload.itemId,
        storageName: payload.storageName,
      });
    swarm.storageValidationService.validate(
      payload.storageName,
      METHOD_NAME_REMOVE
    );
    if (
      !swarm.agentValidationService.hasStorage(
        payload.agentName,
        payload.storageName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStorageUtils ${payload.storageName} not registered in ${payload.agentName} (remove)`
      );
    }
    return await swarm.sharedStoragePublicService.remove(
      payload.itemId,
      METHOD_NAME_REMOVE,
      payload.storageName
    );
  };

  /**
   * Gets an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to get.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<T | null>} - A promise that resolves to the item or null if not found.
   * @template T
   */
  public get = async <T extends IStorageData = IStorageData>(payload: {
    itemId: IStorageData["id"];
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<T | null> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_GET, {
        itemId: payload.itemId,
        storageName: payload.storageName,
      });
    swarm.storageValidationService.validate(
      payload.storageName,
      METHOD_NAME_GET
    );
    if (
      !swarm.agentValidationService.hasStorage(
        payload.agentName,
        payload.storageName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStorageUtils ${payload.storageName} not registered in ${payload.agentName} (get)`
      );
    }
    return (await swarm.sharedStoragePublicService.get(
      payload.itemId,
      METHOD_NAME_GET,
      payload.storageName
    )) as T | null;
  };

  /**
   * Lists items from the storage.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @param {(item: T) => boolean} [filter] - Optional filter function.
   * @returns {Promise<T[]>} - A promise that resolves to an array of items.
   * @template T
   */
  public list = async <T extends IStorageData = IStorageData>(payload: {
    agentName: AgentName;
    storageName: StorageName;
    filter?: (item: T) => boolean;
  }): Promise<T[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_LIST, {
        storageName: payload.storageName,
      });
    swarm.storageValidationService.validate(
      payload.storageName,
      METHOD_NAME_LIST
    );
    if (
      !swarm.agentValidationService.hasStorage(
        payload.agentName,
        payload.storageName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStorageUtils ${payload.storageName} not registered in ${payload.agentName} (list)`
      );
    }
    return (await swarm.sharedStoragePublicService.list(
      METHOD_NAME_LIST,
      payload.storageName,
      payload.filter
    )) as T[];
  };

  /**
   * Clears the storage.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  public clear = async (payload: {
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CLEAR, {
        storageName: payload.storageName,
      });
    swarm.storageValidationService.validate(
      payload.storageName,
      METHOD_NAME_CLEAR
    );
    if (
      !swarm.agentValidationService.hasStorage(
        payload.agentName,
        payload.storageName
      )
    ) {
      throw new Error(
        `agent-swarm SharedStorageUtils ${payload.storageName} not registered in ${payload.agentName} (clear)`
      );
    }
    return await swarm.sharedStoragePublicService.clear(
      METHOD_NAME_CLEAR,
      payload.storageName
    );
  };
}

export const SharedStorage = new SharedStorageUtils();

export default SharedStorage;
