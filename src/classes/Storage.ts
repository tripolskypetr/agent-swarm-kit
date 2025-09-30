import swarm from "../lib";
import {
  IStorage,
  IStorageData,
  StorageName,
} from "../interfaces/Storage.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import beginContext from "../utils/beginContext";

/**
 * Type definition for a storage object, mapping IStorage keys to unknown values.
 * Used for type-safe storage access within client context.
*/
type TStorage = {
  [key in keyof IStorage]: unknown;
};

/** @private Constant for logging the take method in StorageUtils*/
const METHOD_NAME_TAKE = "StorageUtils.take";

/** @private Constant for logging the upsert method in StorageUtils*/
const METHOD_NAME_UPSERT = "StorageUtils.upsert";

/** @private Constant for logging the remove method in StorageUtils*/
const METHOD_NAME_REMOVE = "StorageUtils.remove";

/** @private Constant for logging the get method in StorageUtils*/
const METHOD_NAME_GET = "StorageUtils.get";

/** @private Constant for logging the list method in StorageUtils*/
const METHOD_NAME_LIST = "StorageUtils.list";

/** @private Constant for logging the createNumericIndex method in SharedStorageUtils*/
const METHOD_NAME_CREATE_NUMERIC_INDEX = "StorageUtils.createNumericIndex";

/** @private Constant for logging the clear method in StorageUtils*/
const METHOD_NAME_CLEAR = "StorageUtils.clear";

/**
 * Utility class for managing client-specific storage within an agent swarm.
 * Provides methods to manipulate and query storage data for specific clients, agents, and storage names,
 * interfacing with the swarm's storage service and enforcing agent-storage registration.
 * @implements {TStorage}
*/
export class StorageUtils implements TStorage {
  /**
   * Retrieves a specified number of items from storage matching a search query for a given client and agent.
   * Validates the client session, storage name, and agent-storage registration before querying the storage service.
   * Executes within a context for logging.
   * @template T - The type of the storage data items, defaults to IStorageData.
   * @throws {Error} If the client session is invalid, storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
  */
  public take = beginContext(
    async (payload: {
      search: string;
      total: number;
      clientId: string;
      agentName: AgentName;
      storageName: StorageName;
      score?: number;
    }): Promise<IStorageData[]> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_TAKE, {
          search: payload.search,
          total: payload.total,
          clientId: payload.clientId,
          storageName: payload.storageName,
          score: payload.score,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_TAKE
      );
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_TAKE
      );
      if (
        !swarm.agentValidationService.hasStorage(
          payload.agentName,
          payload.storageName
        )
      ) {
        throw new Error(
          `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (take)`
        );
      }
      return await swarm.storagePublicService.take(
        payload.search,
        payload.total,
        METHOD_NAME_TAKE,
        payload.clientId,
        payload.storageName,
        payload.score
      );
    }
  ) as <T extends IStorageData = IStorageData>(payload: {
    search: string;
    total: number;
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
    score?: number;
  }) => Promise<T[]>;

  /**
   * Inserts or updates an item in the storage for a given client and agent.
   * Validates the client session, storage name, and agent-storage registration before updating via the storage service.
   * Executes within a context for logging.
   * @template T - The type of the storage data item, defaults to IStorageData.
   * @throws {Error} If the client session is invalid, storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
  */
  public upsert = beginContext(
    async (payload: {
      item: IStorageData;
      clientId: string;
      agentName: AgentName;
      storageName: StorageName;
    }): Promise<void> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_UPSERT, {
          item: payload.item,
          clientId: payload.clientId,
          storageName: payload.storageName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_UPSERT
      );
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_UPSERT
      );
      if (
        !swarm.agentValidationService.hasStorage(
          payload.agentName,
          payload.storageName
        )
      ) {
        throw new Error(
          `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (upsert)`
        );
      }
      return await swarm.storagePublicService.upsert(
        payload.item,
        METHOD_NAME_UPSERT,
        payload.clientId,
        payload.storageName
      );
    }
  ) as <T extends IStorageData = IStorageData>(payload: {
    item: T;
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
  }) => Promise<void>;

  /**
   * Removes an item from the storage by its ID for a given client and agent.
   * Validates the client session, storage name, and agent-storage registration before removing via the storage service.
   * Executes within a context for logging.
   * @throws {Error} If the client session is invalid, storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
  */
  public remove = beginContext(
    async (payload: {
      itemId: IStorageData["id"];
      clientId: string;
      agentName: AgentName;
      storageName: StorageName;
    }): Promise<void> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_REMOVE, {
          itemId: payload.itemId,
          clientId: payload.clientId,
          storageName: payload.storageName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_REMOVE
      );
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_REMOVE
      );
      if (
        !swarm.agentValidationService.hasStorage(
          payload.agentName,
          payload.storageName
        )
      ) {
        throw new Error(
          `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (remove)`
        );
      }
      return await swarm.storagePublicService.remove(
        payload.itemId,
        METHOD_NAME_REMOVE,
        payload.clientId,
        payload.storageName
      );
    }
  );

  /**
   * Retrieves an item from the storage by its ID for a given client and agent.
   * Validates the storage name and agent-storage registration before querying the storage service.
   * Executes within a context for logging.
   * @template T - The type of the storage data item, defaults to IStorageData.
   * @throws {Error} If storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
  */
  public get = beginContext(
    async (payload: {
      itemId: IStorageData["id"];
      clientId: string;
      agentName: AgentName;
      storageName: StorageName;
    }) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_GET, {
          itemId: payload.itemId,
          clientId: payload.clientId,
          storageName: payload.storageName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_GET
      );
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_GET
      );
      if (
        !swarm.agentValidationService.hasStorage(
          payload.agentName,
          payload.storageName
        )
      ) {
        throw new Error(
          `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (get)`
        );
      }
      return await swarm.storagePublicService.get(
        payload.itemId,
        METHOD_NAME_GET,
        payload.clientId,
        payload.storageName
      );
    }
  ) as <T extends IStorageData = IStorageData>(payload: {
    itemId: IStorageData["id"];
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
  }) => Promise<T | null>;

  /**
   * Lists all items in the storage for a given client and agent, optionally filtered by a predicate.
   * Validates the storage name and agent-storage registration before querying the storage service.
   * Executes within a context for logging.
   * @template T - The type of the storage data items, defaults to IStorageData.
   * @throws {Error} If storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
  */
  public list = beginContext(
    async (payload: {
      clientId: string;
      agentName: AgentName;
      storageName: StorageName;
      filter?: (item: IStorageData) => boolean;
    }) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_LIST, {
          clientId: payload.clientId,
          storageName: payload.storageName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_LIST
      );
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_LIST
      );
      if (
        !swarm.agentValidationService.hasStorage(
          payload.agentName,
          payload.storageName
        )
      ) {
        throw new Error(
          `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (list)`
        );
      }
      return await swarm.storagePublicService.list(
        METHOD_NAME_LIST,
        payload.clientId,
        payload.storageName,
        payload.filter
      );
    }
  ) as <T extends IStorageData = IStorageData>(payload: {
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
    filter?: (item: T) => boolean;
  }) => Promise<T[]>;

  /**
   * Creates a numeric index for the storage of a given client and agent.
   * Validates the storage name and agent-storage registration before calculating the index.
   * Executes within a context for logging.
   * The numeric index is determined based on the current number of items in the storage.
   * @throws {Error} If storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
  */
  public createNumericIndex = beginContext(
    async (payload: {
      clientId: string;
      agentName: AgentName;
      storageName: StorageName;
    }) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_CREATE_NUMERIC_INDEX, {
          clientId: payload.clientId,
          storageName: payload.storageName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_CREATE_NUMERIC_INDEX
      );
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_CREATE_NUMERIC_INDEX
      );
      if (
        !swarm.agentValidationService.hasStorage(
          payload.agentName,
          payload.storageName
        )
      ) {
        throw new Error(
          `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (createNumericIndex)`
        );
      }
      const { length } = await swarm.storagePublicService.list(
        METHOD_NAME_CREATE_NUMERIC_INDEX,
        payload.clientId,
        payload.storageName
      );
      return length + 1;
    }
  );

  /**
   * Clears all items from the storage for a given client and agent.
   * Validates the storage name and agent-storage registration before clearing via the storage service.
   * Executes within a context for logging.
   * @throws {Error} If storage validation fails, the storage is not registered in the agent, or the storage service encounters an error.
  */
  public clear = beginContext(
    async (payload: {
      clientId: string;
      agentName: AgentName;
      storageName: StorageName;
    }): Promise<void> => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
        swarm.loggerService.log(METHOD_NAME_CLEAR, {
          clientId: payload.clientId,
          storageName: payload.storageName,
        });
      swarm.sessionValidationService.validate(
        payload.clientId,
        METHOD_NAME_CLEAR
      );
      swarm.storageValidationService.validate(
        payload.storageName,
        METHOD_NAME_CLEAR
      );
      if (
        !swarm.agentValidationService.hasStorage(
          payload.agentName,
          payload.storageName
        )
      ) {
        throw new Error(
          `agent-swarm StorageUtils ${payload.storageName} not registered in ${payload.agentName} (clear)`
        );
      }
      return await swarm.storagePublicService.clear(
        METHOD_NAME_CLEAR,
        payload.clientId,
        payload.storageName
      );
    }
  ) as (payload: {
    clientId: string;
    agentName: AgentName;
    storageName: StorageName;
  }) => Promise<void>;
}

/**
 * Singleton instance of StorageUtils for managing client-specific storage operations.
*/
export const Storage = new StorageUtils();

export default Storage;
