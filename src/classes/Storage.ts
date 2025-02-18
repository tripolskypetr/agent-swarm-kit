import swarm from "../lib";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../interfaces/Storage.interface";
import { AgentName } from "../interfaces/Agent.interface";

type TStorage = {
  [key in keyof IStorage]: unknown;
};

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
  public take = async <T extends IStorageData = IStorageData>(
    search: string,
    total: number,
    clientId: string,
    agentName: AgentName,
    storageName: StorageName,
    score?: number,
  ): Promise<T[]> => {
    swarm.loggerService.log("StorageStatic take", {
      search,
      total,
      clientId,
      storageName,
      score,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    if (!swarm.agentValidationService.hasStorage(agentName, storageName)) {
      throw new Error(`agent-swarm StorageUtils ${storageName} not registered in ${agentName} (take)`);
    }
    return (await swarm.storagePublicService.take(
      search,
      total,
      clientId,
      storageName,
      score,
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
  public upsert = async <T extends IStorageData = IStorageData>(
    item: T,
    clientId: string,
    agentName: AgentName,
    storageName: StorageName
  ): Promise<void> => {
    swarm.loggerService.log("StorageStatic upsert", {
      item,
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    if (!swarm.agentValidationService.hasStorage(agentName, storageName)) {
      throw new Error(`agent-swarm StorageUtils ${storageName} not registered in ${agentName} (upsert)`);
    }
    return await swarm.storagePublicService.upsert(item, clientId, storageName);
  };

  /**
   * Removes an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  public remove = async (
    itemId: IStorageData["id"],
    clientId: string,
    agentName: AgentName,
    storageName: StorageName
  ): Promise<void> => {
    swarm.loggerService.log("StorageStatic remove", {
      itemId,
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    if (!swarm.agentValidationService.hasStorage(agentName, storageName)) {
      throw new Error(`agent-swarm StorageUtils ${storageName} not registered in ${agentName} (remove)`);
    }
    return await swarm.storagePublicService.remove(
      itemId,
      clientId,
      storageName
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
  public get = async <T extends IStorageData = IStorageData>(
    itemId: IStorageData["id"],
    clientId: string,
    agentName: AgentName,
    storageName: StorageName
  ): Promise<T | null> => {
    swarm.loggerService.log("StorageStatic get", {
      itemId,
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    if (!swarm.agentValidationService.hasStorage(agentName, storageName)) {
      throw new Error(`agent-swarm StorageUtils ${storageName} not registered in ${agentName} (get)`);
    }
    return (await swarm.storagePublicService.get(
      itemId,
      clientId,
      storageName
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
  public list = async <T extends IStorageData = IStorageData>(
    clientId: string,
    agentName: AgentName,
    storageName: StorageName,
    filter?: (item: T) => boolean
  ): Promise<T[]> => {
    swarm.loggerService.log("StorageStatic list", {
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    if (!swarm.agentValidationService.hasStorage(agentName, storageName)) {
      throw new Error(`agent-swarm StorageUtils ${storageName} not registered in ${agentName} (list)`);
    }
    return (await swarm.storagePublicService.list(
      clientId,
      storageName,
      filter
    )) as T[];
  };

  /**
   * Clears the storage.
   * @param {string} clientId - The client ID.
   * @param {AgentName} agentName - The agent name.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  public clear = async (
    clientId: string,
    agentName: AgentName,
    storageName: StorageName
  ): Promise<void> => {
    swarm.loggerService.log("StorageStatic clear", {
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    if (!swarm.agentValidationService.hasStorage(agentName, storageName)) {
      throw new Error(`agent-swarm StorageUtils ${storageName} not registered in ${agentName} (clear)`);
    }
    return await swarm.storagePublicService.clear(clientId, storageName);
  };
}

export const Storage = new StorageUtils();

export default Storage;
