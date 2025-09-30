import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import { StorageName } from "../../interfaces/Storage.interface";

const METHOD_NAME = "function.dump.getStorage";

/**
 * Retrieves a storage schema by its name from the swarm's storage schema service.
 * Logs the operation if logging is enabled in the global configuration.
 *
 * @function getStorage
 * @param {StorageName} storageName - The name of the storage.
*/
export function getStorage(storageName: StorageName) {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      storageName,
    });
  return swarm.storageSchemaService.get(storageName);
}
