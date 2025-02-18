import swarm from "../lib";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../interfaces/Storage.interface";

type TStorage = {
  [key in keyof IStorage]: unknown;
};

export class StorageUtils implements TStorage {

  public take = async <T extends IStorageData = IStorageData>(
    search: string,
    total: number,
    clientId: string,
    storageName: StorageName
  ): Promise<T[]> => {
    swarm.loggerService.log("StorageStatic take", {
      search,
      total,
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    return (await swarm.storagePublicService.take(
      search,
      total,
      clientId,
      storageName
    )) as T[];
  };

  public upsert = async <T extends IStorageData = IStorageData>(
    item: T,
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    swarm.loggerService.log("StorageStatic upsert", {
      item,
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    return await swarm.storagePublicService.upsert(item, clientId, storageName);
  };

  public remove = async (
    itemId: IStorageData["id"],
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    swarm.loggerService.log("StorageStatic remove", {
      itemId,
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    return await swarm.storagePublicService.remove(
      itemId,
      clientId,
      storageName
    );
  };

  public get = async <T extends IStorageData = IStorageData>(
    itemId: IStorageData["id"],
    clientId: string,
    storageName: StorageName
  ): Promise<T | null> => {
    swarm.loggerService.log("StorageStatic get", {
      itemId,
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    return (await swarm.storagePublicService.get(
      itemId,
      clientId,
      storageName
    )) as T | null;
  };

  public list = async <T extends IStorageData = IStorageData>(
    clientId: string,
    storageName: StorageName,
    filter?: (item: T) => boolean
  ): Promise<T[]> => {
    swarm.loggerService.log("StorageStatic list", {
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    return (await swarm.storagePublicService.list(
      clientId,
      storageName,
      filter
    )) as T[];
  };

  public clear = async (
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    swarm.loggerService.log("StorageStatic clear", {
      clientId,
      storageName,
    });
    swarm.storageValidationService.validate(storageName, "StorageStatic");
    return await swarm.storagePublicService.clear(clientId, storageName);
  };
}

export const Storage = new StorageUtils();

export default Storage;
