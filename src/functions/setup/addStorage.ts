import {
  IStorageData,
  IStorageSchema,
} from "../../interfaces/Storage.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";

const METHOD_NAME = "function.setup.addStorage";

/**
 * Adds a new storage engine to the storage registry for use within the swarm system.
 *
 * This function registers a new storage engine, enabling the swarm to manage and utilize it for persistent data storage across agents or sessions.
 * Only storages registered through this function are recognized by the swarm. If the storage is marked as shared, it initializes a connection to the
 * shared storage service and waits for its initialization. The execution is wrapped in `beginContext` to ensure it runs outside of existing method
 * and execution contexts, providing a clean execution environment. The function logs the operation if enabled and returns the storage's name upon
 * successful registration.
 *
 * @template T - The type of data stored in the storage, extending `IStorageData` (defaults to `IStorageData` if unspecified).
 * @param {IStorageSchema<T>} storageSchema - The schema defining the storage engine's properties, including its name (`storageName`), shared status (`shared`), and other configuration details.
 * @returns {string} The name of the newly added storage (`storageSchema.storageName`), confirming its registration.
 * @throws {Error} If the storage schema is invalid, registration fails (e.g., duplicate storage name), or shared storage initialization encounters an error.
 * @example
 * const storageSchema = { storageName: "UserData", shared: true, type: "key-value" };
 * const storageName = addStorage(storageSchema);
 * console.log(storageName); // Outputs "UserData"
 */
export const addStorage = beginContext((storageSchema: IStorageSchema<IStorageData>) => {
  // Log the operation details if logging is enabled in GLOBAL_CONFIG
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
    swarm.loggerService.log(METHOD_NAME, {
      storageSchema,
    });

  // Register the storage in the validation and schema services
  swarm.storageValidationService.addStorage(
    storageSchema.storageName,
    storageSchema
  );
  swarm.storageSchemaService.register(storageSchema.storageName, storageSchema);

  // If the storage is shared, initialize and wait for the shared storage connection
  if (storageSchema.shared) {
    swarm.sharedStorageConnectionService
      .getStorage(storageSchema.storageName)
      .waitForInit();
  }

  // Return the storage's name as confirmation of registration
  return storageSchema.storageName;
}) as <T extends IStorageData = IStorageData>(
  storageSchema: IStorageSchema<T>
) => string;
