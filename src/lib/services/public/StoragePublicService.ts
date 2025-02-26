import { inject } from "../../core/di";
import { StorageConnectionService } from "../connection/StorageConnectionService";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import ContextService from "../base/ContextService";
import {
  IStorageData,
  StorageName,
} from "../../../interfaces/Storage.interface";

interface IStorageConnectionService extends StorageConnectionService {}

type InternalKeys = keyof {
  getStorage: never;
  getSharedStorage: never;
};

type TStorageConnectionService = {
  [key in Exclude<keyof IStorageConnectionService, InternalKeys>]: unknown;
};

/**
 * Service for managing public storage interactions.
 */
export class StoragePublicService implements TStorageConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly storageConnectionService = inject<StorageConnectionService>(
    TYPES.storageConnectionService
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
    requestId: string,
    clientId: string,
    storageName: StorageName,
    score?: number,
  ): Promise<IStorageData[]> => {
    this.loggerService.log(`storagePublicService take`, {
      requestId,
      search,
      total,
      clientId,
      storageName,
      score,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.storageConnectionService.take(search, total, score);
      },
      {
        requestId,
        clientId,
        storageName,
        agentName: "",
        swarmName: "",
        stateName: "",
      }
    );
  };

  /**
   * Upserts an item in the storage.
   * @param {IStorageData} item - The item to upsert.
   * @returns {Promise<void>}
   */
  public upsert = async (
    item: IStorageData,
    requestId: string,
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    this.loggerService.log(`storagePublicService upsert`, {
      item,
      clientId,
      storageName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.storageConnectionService.upsert(item);
      },
      {
        requestId,
        clientId,
        storageName,
        agentName: "",
        swarmName: "",
        stateName: "",
      }
    );
  };

  /**
   * Removes an item from the storage.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @returns {Promise<void>}
   */
  public remove = async (
    itemId: IStorageData["id"],
    requestId: string,
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    this.loggerService.log(`storagePublicService remove`, {
      itemId,
      clientId,
      storageName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.storageConnectionService.remove(itemId);
      },
      {
        requestId,
        clientId,
        storageName,
        agentName: "",
        swarmName: "",
        stateName: "",
      }
    );
  };

  /**
   * Retrieves an item from the storage by its ID.
   * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
   * @returns {Promise<IStorageData>} The retrieved item.
   */
  public get = async (
    itemId: IStorageData["id"],
    requestId: string,
    clientId: string,
    storageName: StorageName
  ): Promise<IStorageData | null> => {
    this.loggerService.log(`storagePublicService get`, {
      requestId,
      itemId,
      clientId,
      storageName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.storageConnectionService.get(itemId);
      },
      {
        requestId,
        clientId,
        storageName,
        agentName: "",
        swarmName: "",
        stateName: "",
      }
    );
  };

  /**
   * Retrieves a list of items from the storage, optionally filtered by a predicate function.
   * @param {function(IStorageData): boolean} [filter] - The optional filter function.
   * @returns {Promise<IStorageData[]>} The list of items.
   */
  public list = async (
    requestId: string,
    clientId: string,
    storageName: StorageName,
    filter?: (item: IStorageData) => boolean
  ): Promise<IStorageData[]> => {
    this.loggerService.log(`storagePublicService list`, {
      requestId,
      clientId,
      storageName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.storageConnectionService.list(filter);
      },
      {
        requestId,
        clientId,
        storageName,
        agentName: "",
        swarmName: "",
        stateName: "",
      }
    );
  };

  /**
   * Clears all items from the storage.
   * @returns {Promise<void>}
   */
  public clear = async (
    requestId: string,
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    this.loggerService.log(`storagePublicService clear`, {
      requestId,
      clientId,
      storageName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.storageConnectionService.clear();
      },
      {
        requestId,
        clientId,
        storageName,
        agentName: "",
        swarmName: "",
        stateName: "",
      }
    );
  };

  /**
   * Disposes of the storage.
   * @param {string} clientId - The client ID.
   * @param {StorageName} storageName - The storage name.
   * @returns {Promise<void>}
   */
  public dispose = async (requestId: string, clientId: string, storageName: StorageName) => {
    this.loggerService.log("storagePublicService dispose", {
      clientId,
      storageName,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.storageConnectionService.dispose();
      },
      {
        requestId,
        clientId,
        storageName,
        agentName: "",
        swarmName: "",
        stateName: "",
      }
    );
  };
}

export default StoragePublicService;
