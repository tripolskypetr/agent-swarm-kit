import { IStorageData, IStorageSchema } from "../interfaces/Storage.interface";
import swarm from "../lib";

/**
 * Adds a new storage to the storage registry. The swarm takes only those storages which was registered
 *
 * @param {IStorageSchema} storageSchema - The schema of the storage to be added.
 * @returns {string} The name of the added storage.
 */
export const addStorage = <T extends IStorageData = IStorageData>(
  storageSchema: IStorageSchema<T>
) => {
  swarm.loggerService.log("function addStorage", {
    storageSchema,
  });
  swarm.storageValidationService.addStorage(
    storageSchema.storageName,
    storageSchema
  );
  swarm.storageSchemaService.register(storageSchema.storageName, storageSchema);
  if (storageSchema.shared) {
    swarm.storageConnectionService
      .getSharedStorage("shared", storageSchema.storageName)
      .waitForInit();
  }
  return storageSchema.storageName;
};
