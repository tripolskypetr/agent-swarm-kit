import swarm from "../lib";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../interfaces/Storage.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";

type TStorage = {
  [key in keyof IStorage]: unknown;
};


const METHOD_NAME_TAKE = "StorageUtils.take";
const METHOD_NAME_UPSERT = "StorageUtils.upsert";
const METHOD_NAME_REMOVE = "StorageUtils.remove";
const METHOD_NAME_GET = "StorageUtils.get";
const METHOD_NAME_LIST = "StorageUtils.list";
const METHOD_NAME_CLEAR = "StorageUtils.clear";

export class StorageUtils implements TStorage {
  /**
   * Takes items from the storage.
   * @param {string} search - The search query.
   * @param {number} total - The total number of items to take.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<T[]>} - A promise that resolves to an array of items.
   * @template T
   */
  public take = async <T extends IStorageData = IStorageData>(payload: {
    search: string;
    total: number;
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
    score?: number;
  }): Promise<T[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_TAKE, {
        search: payload.search,
        total: payload.total,
        clientId: payload.clientId,
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
        `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (take)`
      );
    }
    return (await swarm.storagePublicService.take(
      payload.search,
      payload.total,
      METHOD_NAME_TAKE,
      payload.clientId,
      payload.storageName,
      payload.score
    )) as T[];
  };

  /**
   * Upserts an item in the storage.
   * @param {T} item - The item to upsert.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   * @template T
   */
  public upsert = async <T extends IStorageData = IStorageData>(payload: {
    item: T;
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_UPSERT, {
        item: payload.item,
        clientId: payload.clientId,
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
        `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (upsert)`
      );
    }
    return await swarm.storagePublicService.upsert(
      payload.item,
      METHOD_NAME_UPSERT,
      payload.clientId,
      payload.storageName
    );
  };

  /**
   * Removes an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  public remove = async (payload: {
    itemId: IStorageData["id"];
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_REMOVE, {
        itemId: payload.itemId,
        clientId: payload.clientId,
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
        `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (remove)`
      );
    }
    return await swarm.storagePublicService.remove(
      payload.itemId,
      METHOD_NAME_REMOVE,
      payload.clientId,
      payload.storageName
    );
  };

  /**
   * Gets an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to get.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<T | null>} - A promise that resolves to the item or null if not found.
   * @template T
   */
  public get = async <T extends IStorageData = IStorageData>(payload: {
    itemId: IStorageData["id"];
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<T | null> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_GET, {
        itemId: payload.itemId,
        clientId: payload.clientId,
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
        `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (get)`
      );
    }
    return (await swarm.storagePublicService.get(
      payload.itemId,
      METHOD_NAME_GET,
      payload.clientId,
      payload.storageName
    )) as T | null;
  };

  /**
   * Lists items from the storage.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @param {(item: T) => boolean} [filter] - Optional filter function.
   * @returns {Promise<T[]>} - A promise that resolves to an array of items.
   * @template T
   */
  public list = async <T extends IStorageData = IStorageData>(payload: {
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
    filter?: (item: T) => boolean;
  }): Promise<T[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_LIST, {
        clientId: payload.clientId,
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
        `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (list)`
      );
    }
    return (await swarm.storagePublicService.list(
      METHOD_NAME_LIST,
      payload.clientId,
      payload.storageName,
      payload.filter
    )) as T[];
  };

  /**
   * Clears the storage.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  public clear = async (payload: {
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
  }): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CLEAR, {
        clientId: payload.clientId,
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
        `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (clear)`
      );
    }
    return await swarm.storagePublicService.clear(
      METHOD_NAME_CLEAR,
      payload.clientId,
      payload.storageName
    );
  };
}

export const Storage = new StorageUtils();

export default Storage;
