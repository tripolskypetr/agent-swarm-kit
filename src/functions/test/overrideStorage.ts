import {
  IStorageData,
  IStorageSchema,
} from "../../interfaces/Storage.interface";
import swarm from "../../lib";
import { GLOBAL_CONFIG } from "../../config/params";
import beginContext from "../../utils/beginContext";
import removeUndefined from "../../helpers/removeUndefined";

const METHOD_NAME = "function.test.overrideStorage";

/**
 * Type representing a partial storage schema configuration.
 * Used for storage service configuration with optional properties.
 */
type TStorageSchema<T extends IStorageData = IStorageData> = {
  storageName: IStorageSchema<T>["storageName"];
} & Partial<IStorageSchema<T>>;

/**
 * Function implementation
 */
const overrideStorageInternal = beginContext(
  (publicStorageSchema: TStorageSchema<IStorageData>): IStorageSchema<any> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME, {
        storageSchema: publicStorageSchema,
      });

    const storageSchema = removeUndefined(publicStorageSchema);

    return swarm.storageSchemaService.override(
      storageSchema.storageName,
      storageSchema
    );
  }
);

/**
 * Overrides an existing storage schema in the swarm system with a new or partial schema.
 * This function updates the configuration of a storage identified by its `storageName`, applying the provided schema properties.
 * It operates outside any existing method or execution contexts to ensure isolation, leveraging `beginContext` for a clean execution scope.
 * Logs the override operation if logging is enabled in the global configuration.
 *
 * @template T - The type of the storage data, defaults to `IStorageData`.
 * @throws {Error} If the storage schema service encounters an error during the override operation (e.g., invalid storageName or schema).
 *
 * @example
 * // Override a storage’s schema with new properties
 * overrideStorage({
 *   storageName: "UserData",
 *   persist: true,
 *   embedding: "TextEmbedding",
 *   createIndex: (item) => item.id.toString(),
 * });
 * // Logs the operation (if enabled) and updates the storage schema in the swarm.
 */
export function overrideStorage<T extends IStorageData = IStorageData>(
  storageSchema: TStorageSchema<T>
): IStorageSchema<T> {
  return overrideStorageInternal(storageSchema);
}
