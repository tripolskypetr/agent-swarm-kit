import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  StorageName,
  IStorageSchema,
} from "../../../interfaces/Storage.interface";
import { memoize } from "functools-kit";
import EmbeddingValidationService from "./EmbeddingValidationService";

/**
 * Service for validating storages within the storage swarm.
 */
export class StorageValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly embeddingValidationService =
    inject<EmbeddingValidationService>(TYPES.embeddingValidationService);

  private _storageMap = new Map<StorageName, IStorageSchema>();

  /**
   * Adds a new storage to the validation service.
   * @param {StorageName} storageName - The name of the storage.
   * @param {IStorageSchema} storageSchema - The schema of the storage.
   * @throws {Error} If the storage already exists.
   */
  public addStorage = (storageName: StorageName, storageSchema: IStorageSchema) => {
    this.loggerService.info("storageValidationService addStorage", {
      storageName,
      storageSchema,
    });
    if (this._storageMap.has(storageName)) {
      throw new Error(`storage-swarm storage ${storageName} already exist`);
    }
    this._storageMap.set(storageName, storageSchema);
  };

  /**
   * Validates an storage by its name and source.
   * @param {StorageName} storageName - The name of the storage.
   * @param {string} source - The source of the validation request.
   * @throws {Error} If the storage is not found.
   */
  public validate = memoize(
    ([storageName]) => storageName,
    (storageName: StorageName, source: string) => {
      this.loggerService.info("storageValidationService validate", {
        storageName,
        source,
      });
      const storage = this._storageMap.get(storageName);
      if (!storage) {
        throw new Error(`storage-swarm storage ${storageName} not found source=${source}`);
      }
      this.embeddingValidationService.validate(storage.embedding, source);
      return {} as unknown as void;
    }
  ) as (storageName: StorageName, source: string) => void;
}

export default StorageValidationService;
