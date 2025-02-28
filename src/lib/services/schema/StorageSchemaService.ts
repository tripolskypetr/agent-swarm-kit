import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import {
  IStorageSchema,
  StorageName,
} from "../../../interfaces/Storage.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for managing storage schemas.
 */
export class StorageSchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<StorageName, IStorageSchema>>(
    "storageSchemaService"
  );

  /**
   * Registers a new storage schema.
   * @param {StorageName} key - The key for the schema.
   * @param {IStorageSchema} value - The schema to register.
   */
  public register = (key: StorageName, value: IStorageSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageSchemaService register`, { key });
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a storage schema by key.
   * @param {StorageName} key - The key of the schema to retrieve.
   * @returns {IStorageSchema} The retrieved schema.
   */
  public get = (key: StorageName): IStorageSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`storageSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default StorageSchemaService;
