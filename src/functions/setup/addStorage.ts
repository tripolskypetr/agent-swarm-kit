import { IStorageData, IStorageSchema } from "../../interfaces/Storage.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";

const METHOD_NAME = "function.addStorage";

/**
 * Adds a new storage to the storage registry. The swarm takes only those storages which was registered
 *
 * @param {IStorageSchema} storageSchema - The schema of the storage to be added.
 * @returns {string} The name of the added storage.
 */
export const addStorage = <T extends IStorageData = IStorageData>(
  storageSchema: IStorageSchema<T>
) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      storageSchema,
    });
  swarm.storageValidationService.addStorage(
    storageSchema.storageName,
    storageSchema
  );
  swarm.storageSchemaService.register(storageSchema.storageName, storageSchema);
  if (storageSchema.shared) {
    swarm.sharedStorageConnectionService
      .getStorage(storageSchema.storageName)
      .waitForInit();
  }
  return storageSchema.storageName;
};
