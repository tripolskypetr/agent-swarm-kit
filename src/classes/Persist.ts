import fs from "fs/promises";
import {
  getErrorMessage,
  makeExtendable,
  memoize,
  not,
  queued,
  retry,
  singleshot,
  trycatch,
} from "functools-kit";
import { join } from "path";
import { SwarmName } from "../interfaces/Swarm.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { StateName } from "../interfaces/State.interface";
import { IStorageData, StorageName } from "../interfaces/Storage.interface";
import { writeFileAtomic } from "../utils/writeFileAtomic";
import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";
import { SessionId } from "../interfaces/Session.interface";
import { PolicyName } from "../interfaces/Policy.interface";
import { EmbeddingName } from "../interfaces/Embedding.interface";

/**
 * Represents an identifier for an entity, which can be either a string or a number.
 * Used across persistence classes to uniquely identify stored entities such as agents, states, or memory records.
 */
export type EntityId = string | number;

/**
 * Base interface for all persistent entities in the swarm system.
 * Extended by specific entity types (e.g., `IPersistAliveData`, `IPersistStateData`) to define their structure.
 * @interface IEntity
 */
export interface IEntity {}

/** @private Symbol for memoizing the wait-for-initialization operation in PersistBase*/
const BASE_WAIT_FOR_INIT_SYMBOL = Symbol("wait-for-init");

/** @private Symbol for creating a new key in a persistent list*/
const LIST_CREATE_KEY_SYMBOL = Symbol("create-key");

/** @private Symbol for getting the last key in a persistent list*/
const LIST_GET_LAST_KEY_SYMBOL = Symbol("get-last-key");

/** @private Symbol for popping the last item from a persistent list*/
const LIST_POP_SYMBOL = Symbol("pop");

// Logging method names for PersistBase
/** @private Constant for logging the constructor in PersistBase*/
const PERSIST_BASE_METHOD_NAME_CTOR = "PersistBase.CTOR";
/** @private Constant for logging the waitForInit method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_WAIT_FOR_INIT = "PersistBase.waitForInit";
/** @private Constant for logging the readValue method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_READ_VALUE = "PersistBase.readValue";
/** @private Constant for logging the writeValue method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_WRITE_VALUE = "PersistBase.writeValue";
/** @private Constant for logging the hasValue method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_HAS_VALUE = "PersistBase.hasValue";
/** @private Constant for logging the removeValue method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_REMOVE_VALUE = "PersistBase.removeValue";
/** @private Constant for logging the removeAll method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_REMOVE_ALL = "PersistBase.removeAll";
/** @private Constant for logging the values method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_VALUES = "PersistBase.values";
/** @private Constant for logging the keys method in PersistBase*/
const PERSIST_BASE_METHOD_NAME_KEYS = "PersistBase.keys";

// Logging method names for PersistList
/** @private Constant for logging the constructor in PersistList*/
const PERSIST_LIST_METHOD_NAME_CTOR = "PersistList.CTOR";
/** @private Constant for logging the push method in PersistList*/
const PERSIST_LIST_METHOD_NAME_PUSH = "PersistList.push";
/** @private Constant for logging the pop method in PersistList*/
const PERSIST_LIST_METHOD_NAME_POP = "PersistList.pop";

// Logging method names for PersistSwarmUtils
/** @private Constant for logging the usePersistActiveAgentAdapter method in PersistSwarmUtils*/
const PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_ACTIVE_AGENT_ADAPTER =
  "PersistSwarmUtils.usePersistActiveAgentAdapter";
/** @private Constant for logging the usePersistNavigationStackAdapter method in PersistSwarmUtils*/
const PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_NAVIGATION_STACK_ADAPTER =
  "PersistSwarmUtils.usePersistNavigationStackAdapter";
/** @private Constant for logging the getActiveAgent method in PersistSwarmUtils*/
const PERSIST_SWARM_UTILS_METHOD_NAME_GET_ACTIVE_AGENT =
  "PersistSwarmUtils.getActiveAgent";
/** @private Constant for logging the setActiveAgent method in PersistSwarmUtils*/
const PERSIST_SWARM_UTILS_METHOD_NAME_SET_ACTIVE_AGENT =
  "PersistSwarmUtils.setActiveAgent";
/** @private Constant for logging the getNavigationStack method in PersistSwarmUtils*/
const PERSIST_SWARM_UTILS_METHOD_NAME_GET_NAVIGATION_STACK =
  "PersistSwarmUtils.getNavigationStack";
/** @private Constant for logging the setNavigationStack method in PersistSwarmUtils*/
const PERSIST_SWARM_UTILS_METHOD_NAME_SET_NAVIGATION_STACK =
  "PersistSwarmUtils.setNavigationStack";

// Logging method names for PersistStateUtils
/** @private Constant for logging the usePersistStateAdapter method in PersistStateUtils*/
const PERSIST_STATE_UTILS_METHOD_NAME_USE_PERSIST_STATE_ADAPTER =
  "PersistStateUtils.usePersistStateAdapter";
/** @private Constant for logging the setState method in PersistStateUtils*/
const PERSIST_STATE_UTILS_METHOD_NAME_SET_STATE = "PersistStateUtils.setState";
/** @private Constant for logging the getState method in PersistStateUtils*/
const PERSIST_STATE_UTILS_METHOD_NAME_GET_STATE = "PersistStateUtils.getState";

// Logging method names for PersistEmbeddingUtils
/** @private Constant for logging the usePersistEmbeddingAdapter method in PersistEmbeddingUtils*/
const PERSIST_EMBEDDING_UTILS_METHOD_NAME_USE_PERSIST_EMBEDDING_ADAPTER =
  "PersistEmbeddingUtils.usePersistEmbeddingAdapter";
/** @private Constant for logging the readEmbeddingCache method in PersistEmbeddingUtils*/
const PERSIST_EMBEDDING_UTILS_METHOD_NAME_READ_EMBEDDING_CACHE =
  "PersistEmbeddingUtils.readEmbeddingCache";
/** @private Constant for logging the writeEmbeddingCache method in PersistEmbeddingUtils*/
const PERSIST_EMBEDDING_UTILS_METHOD_NAME_WRITE_EMBEDDING_CACHE =
  "PersistEmbeddingUtils.writeEmbeddingCache";

// Logging method names for PersistMemoryUtils
/** @private Constant for logging the usePersistMemoryAdapter method in PersistMemoryUtils*/
const PERSIST_MEMORY_UTILS_METHOD_NAME_USE_PERSIST_MEMORY_ADAPTER =
  "PersistMemoryUtils.usePersistMemoryAdapter";
/** @private Constant for logging the setMemory method in PersistMemoryUtils*/
const PERSIST_MEMORY_UTILS_METHOD_NAME_SET_MEMORY =
  "PersistMemoryUtils.setMemory";
/** @private Constant for logging the getMemory method in PersistMemoryUtils*/
const PERSIST_MEMORY_UTILS_METHOD_NAME_GET_MEMORY =
  "PersistMemoryUtils.getMemory";
/** @private Constant for logging the dispose method in PersistMemoryUtils*/
const PERSIST_MEMORY_UTILS_METHOD_NAME_DISPOSE = "PersistMemoryUtils.dispose";

// Logging method names for PersistAliveUtils
/** @private Constant for logging the usePersistAliveAdapter method in PersistAliveUtils*/
const PERSIST_ALIVE_UTILS_METHOD_NAME_USE_PERSIST_ALIVE_ADAPTER =
  "PersistAliveUtils.usePersistAliveAdapter";
/** @private Constant for logging the markOnline method in PersistAliveUtils*/
const PERSIST_ALIVE_UTILS_METHOD_NAME_MARK_ONLINE =
  "PersistAliveUtils.markOnline";
/** @private Constant for logging the markOffline method in PersistAliveUtils*/
const PERSIST_ALIVE_UTILS_METHOD_NAME_MARK_OFFLINE =
  "PersistAliveUtils.markOffline";
/** @private Constant for logging the getOnline method in PersistAliveUtils*/
const PERSIST_ALIVE_UTILS_METHOD_NAME_GET_ONLINE =
  "PersistAliveUtils.getOnline";

// Logging method names for PersistStorageUtils
/** @private Constant for logging the usePersistStorageAdapter method in PersistStorageUtils*/
const PERSIST_STORAGE_UTILS_METHOD_NAME_USE_PERSIST_STORAGE_ADAPTER =
  "PersistStorageUtils.usePersistStorageAdapter";
/** @private Constant for logging the getData method in PersistStorageUtils*/
const PERSIST_STORAGE_UTILS_METHOD_NAME_GET_DATA =
  "PersistStorageUtils.getData";
/** @private Constant for logging the setData method in PersistStorageUtils*/
const PERSIST_STORAGE_UTILS_METHOD_NAME_SET_DATA =
  "PersistStorageUtils.setData";

const PERSIST_POLICY_UTILS_METHOD_NAME_USE_PERSIST_POLICY_ADAPTER =
  "PersistPolicyUtils.usePersistPolicyAdapter";
const PERSIST_POLICY_UTILS_METHOD_NAME_GET_BANNED_CLIENTS =
  "PersistPolicyUtils.getBannedClients";
const PERSIST_POLICY_UTILS_METHOD_NAME_SET_BANNED_CLIENTS =
  "PersistPolicyUtils.setBannedClients";

// Logging method names for private functions
/** @private Constant for logging the waitForInitFn function*/
const BASE_WAIT_FOR_INIT_FN_METHOD_NAME = "PersistBase.waitForInitFn";
/** @private Constant for logging the createKeyFn function*/
const LIST_CREATE_KEY_FN_METHOD_NAME = "PersistList.createKeyFn";
/** @private Constant for logging the popFn function*/
const LIST_POP_FN_METHOD_NAME = "PersistList.popFn";
/** @private Constant for logging the getLastKeyFn function*/
const LIST_GET_LAST_KEY_FN_METHOD_NAME = "PersistList.getLastKeyFn";

/** @private Count of retry attempts for unlink in waitForInit*/
const BASE_UNLINK_RETRY_COUNT = 5;
/** @private Delay for retry attempts for unlink in waitForInit (in milliseconds)*/
const BASE_UNLINK_RETRY_DELAY = 1_000;

/**
 * Defines the core interface for persistent storage operations in the swarm system.
 * Provides methods for managing entities stored as JSON files in the file system, used across swarm utilities.
 * @template Entity - The type of entity stored, defaults to `IEntity` (e.g., `IPersistAliveData`, `IPersistStateData`).
 * @interface IPersistBase
 */
export interface IPersistBase<Entity extends IEntity = IEntity> {
  /**
   * Initializes the storage directory, creating it if needed and validating existing data by removing invalid entities.
   * Ensures the persistence layer is ready for use, handling corrupt files during setup.
   * @throws {Error} If directory creation, file access, or validation fails.
   */
  waitForInit(initial: boolean): Promise<void>;

  /**
   * Reads an entity from persistent storage by its ID, parsing it from a JSON file.
   * Used to retrieve persisted data such as agent states, memory, or alive status.
   * @throws {Error} If the entity is not found (`ENOENT`) or reading/parsing fails (e.g., invalid JSON).
   */
  readValue(entityId: EntityId): Promise<Entity>;

  /**
   * Checks if an entity exists in persistent storage by its ID.
   * Useful for conditional operations without reading the full entity (e.g., checking session memory existence).
   * @throws {Error} If checking existence fails for reasons other than the entity not existing.
   */
  hasValue(entityId: EntityId): Promise<boolean>;

  /**
   * Writes an entity to persistent storage with the specified ID, serializing it to JSON.
   * Uses atomic writes to ensure data integrity, critical for reliable state persistence across swarm operations.
   * @throws {Error} If writing to the file system fails (e.g., permissions or disk issues).
   */
  writeValue(entityId: EntityId, entity: Entity): Promise<void>;
}

/**
 * Defines a constructor type for creating `PersistBase` instances, parameterized by entity name and type.
 * Enables customization of persistence behavior through subclassing or adapter injection (e.g., for swarm or state persistence).
 * @template EntityName - The type of entity name (e.g., `SwarmName`, `SessionId`), defaults to `string`.
 * @template Entity - The type of entity (e.g., `IPersistAliveData`), defaults to `IEntity`.
 */
export type TPersistBaseCtor<
  EntityName extends string = string,
  Entity extends IEntity = IEntity
> = new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>;

/**
 * Attempts to remove a file if invalid JSON is detected during initialization.
 * Retries the operation multiple times with delays to handle transient errors, ensuring robust setup.
 * @private
 */
const BASE_WAIT_FOR_INIT_UNLINK_FN = async (filePath: string) =>
  trycatch(
    retry(
      async () => {
        try {
          await fs.unlink(filePath);
          return true;
        } catch (error) {
          console.error(
            `agent-swarm PersistBase unlink failed for filePath=${filePath} error=${getErrorMessage(
              error
            )}`
          );
          throw error;
        }
      },
      BASE_UNLINK_RETRY_COUNT,
      BASE_UNLINK_RETRY_DELAY
    ),
    {
      defaultValue: false,
    }
  );

/**
 * Initializes the storage directory and validates existing entities, removing invalid ones.
 * Ensures the persistence layer is robust by cleaning up corrupted files during setup (e.g., for swarm or session data).
 * @private
 * @throws {Error} If directory creation or file validation fails (e.g., permissions or I/O errors).
 */
const BASE_WAIT_FOR_INIT_FN = async (self: TPersistBase): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    swarm.loggerService.debug(BASE_WAIT_FOR_INIT_FN_METHOD_NAME, {
      entityName: self.entityName,
      directory: self._directory,
    });
  await fs.mkdir(self._directory, { recursive: true });
  for await (const key of self.keys()) {
    try {
      await self.readValue(key);
    } catch {
      const filePath = self._getFilePath(key);
      console.error(
        `agent-swarm PersistBase found invalid document for filePath=${filePath} entityName=${self.entityName}`
      );
      if (await not(BASE_WAIT_FOR_INIT_UNLINK_FN(filePath))) {
        console.error(
          `agent-swarm PersistBase failed to remove invalid document for filePath=${filePath} entityName=${self.entityName}`
        );
      }
    }
  }
};

/**
 * Generates a new unique key for a list item by incrementing the last used key.
 * Initializes the last count by scanning existing keys if not already set, used in `PersistList` for ordered storage.
 * @private
 * @throws {Error} If key generation fails due to underlying storage issues (e.g., directory access).
 */
const LIST_CREATE_KEY_FN = async (self: TPersistList): Promise<string> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    swarm.loggerService.debug(LIST_CREATE_KEY_FN_METHOD_NAME, {
      entityName: self.entityName,
      lastCount: self._lastCount,
    });
  if (self._lastCount === null) {
    for await (const key of self.keys()) {
      const numericKey = Number(key);
      if (!isNaN(numericKey)) {
        self._lastCount = Math.max(numericKey, self._lastCount || 0);
      }
    }
  }
  if (self._lastCount === null) {
    self._lastCount = 0;
  }
  return String((self._lastCount += 1));
};

/**
 * Removes and returns the last item from the persistent list.
 * Uses the last key to fetch and delete the item atomically, ensuring consistency in list operations.
 * @private
 * @throws {Error} If reading or removing the item fails (e.g., file not found or permissions).
 */
const LIST_POP_FN = async (self: TPersistList): Promise<any | null> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    swarm.loggerService.debug(LIST_POP_FN_METHOD_NAME, {
      entityName: self.entityName,
    });
  const lastKey = await self[LIST_GET_LAST_KEY_SYMBOL]();
  if (lastKey === null) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(LIST_POP_FN_METHOD_NAME, {
        entityName: self.entityName,
        result: "No last key found, returning null",
      });
    return null;
  }
  const value = await self.readValue(lastKey);
  await self.removeValue(lastKey);
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    swarm.loggerService.debug(LIST_POP_FN_METHOD_NAME, {
      entityName: self.entityName,
      lastKey,
      value,
    });
  return value;
};

/**
 * Retrieves the key of the last item in the persistent list by scanning all keys.
 * Determines the highest numeric key value for ordered list management (e.g., dequeuing events).
 * @private
 * @throws {Error} If key retrieval fails due to underlying storage issues (e.g., directory access).
 */
const LIST_GET_LAST_KEY_FN = async (
  self: TPersistList
): Promise<string | null> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    swarm.loggerService.debug(LIST_GET_LAST_KEY_FN_METHOD_NAME, {
      entityName: self.entityName,
    });
  let lastKey = 0;
  for await (const key of self.keys()) {
    const numericKey = Number(key);
    if (!isNaN(numericKey)) {
      lastKey = Math.max(numericKey, lastKey);
    }
  }
  if (lastKey === 0) {
    return null;
  }
  return String(lastKey);
};

/**
 * Base class for persistent storage of entities in the swarm system, using the file system.
 * Provides foundational methods for reading, writing, and managing entities as JSON files, supporting swarm utilities like `PersistAliveUtils`.
 * @template EntityName - The type of entity name (e.g., `SwarmName`, `SessionId`), defaults to `string`, used as a subdirectory.
 * @implements {IPersistBase}
 */
class PersistBase<EntityName extends string = string> implements IPersistBase {
  /** @private The directory path where entity files are stored (e.g., `./logs/data/alive/` for alive status)*/
  _directory: string;

  /**
   * Creates a new `PersistBase` instance for managing persistent storage of entities.
   * Sets up the storage directory based on the entity name (e.g., `SwarmName` for swarm-specific data) and base directory.
   */
  constructor(
    readonly entityName: EntityName,
    readonly baseDir = join(process.cwd(), "logs/data")
  ) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_CTOR, {
        entityName: this.entityName,
        baseDir,
      });
    this._directory = join(this.baseDir, this.entityName);
  }

  /**
   * Computes the full file path for an entity based on its ID.
   * @private
   */
  _getFilePath(entityId: EntityId): string {
    return join(this.baseDir, this.entityName, `${entityId}.json`);
  }

  /**
   * Memoized initialization function ensuring it runs only once per instance.
   * Uses `singleshot` to prevent redundant initialization calls, critical for swarm setup efficiency.
   * @private
   */
  [BASE_WAIT_FOR_INIT_SYMBOL] = singleshot(
    async (): Promise<void> => await BASE_WAIT_FOR_INIT_FN(this)
  );

  /**
   * Initializes the storage directory, creating it if it doesn’t exist, and validates existing entities.
   * Removes invalid JSON files during initialization to ensure data integrity (e.g., for `SwarmName`-based alive status).
   * @throws {Error} If directory creation or entity validation fails (e.g., permissions or I/O errors).
   */
  async waitForInit(initial: boolean): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_WAIT_FOR_INIT, {
        entityName: this.entityName,
        initial,
      });
    await this[BASE_WAIT_FOR_INIT_SYMBOL]();
  }

  /**
   * Retrieves the number of entities stored in the directory.
   * Counts only files with a `.json` extension, useful for monitoring storage usage (e.g., active sessions).
   * @throws {Error} If reading the directory fails (e.g., permissions or directory not found).
   */
  async getCount(): Promise<number> {
    const files = await fs.readdir(this._directory);
    const { length } = files.filter((file) => file.endsWith(".json"));
    return length;
  }

  /**
   * Reads an entity from storage by its ID, parsing it from a JSON file.
   * Core method for retrieving persisted data (e.g., alive status for a `SessionId` in a `SwarmName` context).
   * @template T - The specific type of the entity (e.g., `IPersistAliveData`), defaults to `IEntity`.
   * @throws {Error} If the file is not found (`ENOENT`) or parsing fails (e.g., invalid JSON).
   */
  async readValue<T extends IEntity = IEntity>(entityId: EntityId): Promise<T> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_READ_VALUE, {
        entityName: this.entityName,
        entityId,
      });
    try {
      const filePath = this._getFilePath(entityId);
      const fileContent = await fs.readFile(filePath, "utf-8");
      return JSON.parse(fileContent) as T;
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        throw new Error(`Entity ${this.entityName}:${entityId} not found`);
      }
      throw new Error(
        `Failed to read entity ${
          this.entityName
        }:${entityId}: ${getErrorMessage(error)}`
      );
    }
  }

  /**
   * Checks if an entity exists in storage by its ID.
   * Efficiently verifies presence without reading the full entity (e.g., checking if a `SessionId` has memory).
   * @throws {Error} If checking existence fails for reasons other than the file not existing.
   */
  async hasValue(entityId: EntityId): Promise<boolean> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_HAS_VALUE, {
        entityName: this.entityName,
        entityId,
      });
    try {
      const filePath = this._getFilePath(entityId);
      await fs.access(filePath);
      return true;
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        return false;
      }
      throw new Error(
        `Failed to check existence of entity ${
          this.entityName
        }:${entityId}: ${getErrorMessage(error)}`
      );
    }
  }

  /**
   * Writes an entity to storage with the specified ID, serializing it to JSON.
   * Uses atomic file writing via `writeFileAtomic` to ensure data integrity (e.g., persisting `AgentName` for a `SwarmName`).
   * @template T - The specific type of the entity (e.g., `IPersistActiveAgentData`), defaults to `IEntity`.
   * @throws {Error} If writing to the file system fails (e.g., permissions or disk space).
   */
  async writeValue<T extends IEntity = IEntity>(
    entityId: EntityId,
    entity: T
  ): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_WRITE_VALUE, {
        entityName: this.entityName,
        entityId,
      });
    try {
      const filePath = this._getFilePath(entityId);
      const serializedData = JSON.stringify(entity);
      await writeFileAtomic(filePath, serializedData, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to write entity ${
          this.entityName
        }:${entityId}: ${getErrorMessage(error)}`
      );
    }
  }

  /**
   * Removes an entity from storage by its ID.
   * Deletes the corresponding JSON file, used for cleanup (e.g., removing a `SessionId`’s memory).
   * @throws {Error} If the entity is not found (`ENOENT`) or deletion fails (e.g., permissions).
   */
  async removeValue(entityId: EntityId): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_REMOVE_VALUE, {
        entityName: this.entityName,
        entityId,
      });
    try {
      const filePath = this._getFilePath(entityId);
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        throw new Error(
          `Entity ${this.entityName}:${entityId} not found for deletion`
        );
      }
      throw new Error(
        `Failed to remove entity ${
          this.entityName
        }:${entityId}: ${getErrorMessage(error)}`
      );
    }
  }

  /**
   * Removes all entities from storage under this entity name.
   * Deletes all `.json` files in the directory, useful for resetting persistence (e.g., clearing a `SwarmName`’s data).
   * @throws {Error} If reading the directory or deleting files fails (e.g., permissions).
   */
  async removeAll(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_REMOVE_ALL, {
        entityName: this.entityName,
      });
    try {
      const files = await fs.readdir(this._directory);
      const entityFiles = files.filter((file) => file.endsWith(".json"));
      for (const file of entityFiles) {
        await fs.unlink(join(this._directory, file));
      }
    } catch (error) {
      throw new Error(
        `Failed to remove values for ${this.entityName}: ${getErrorMessage(
          error
        )}`
      );
    }
  }

  /**
   * Iterates over all entities in storage, sorted numerically by ID.
   * Yields entities in ascending order, useful for batch processing (e.g., listing all `SessionId`s in a `SwarmName`).
   * @template T - The specific type of the entities (e.g., `IPersistAliveData`), defaults to `IEntity`.
   * @throws {Error} If reading the directory or entity files fails (e.g., permissions or invalid JSON).
   */
  async *values<T extends IEntity = IEntity>(): AsyncGenerator<T> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_VALUES, {
        entityName: this.entityName,
      });
    try {
      const files = await fs.readdir(this._directory);
      const entityIds = files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.slice(0, -5))
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      for (const entityId of entityIds) {
        const entity = await this.readValue<T>(entityId);
        yield entity;
      }
    } catch (error) {
      throw new Error(
        `Failed to read values for ${this.entityName}: ${getErrorMessage(
          error
        )}`
      );
    }
  }

  /**
   * Iterates over all entity IDs in storage, sorted numerically.
   * Yields IDs in ascending order, useful for key enumeration (e.g., listing `SessionId`s in a `SwarmName`).
   * @throws {Error} If reading the directory fails (e.g., permissions or directory not found).
   */
  async *keys(): AsyncGenerator<EntityId> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_KEYS, {
        entityName: this.entityName,
      });
    try {
      const files = await fs.readdir(this._directory);
      const entityIds = files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.slice(0, -5))
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      for (const entityId of entityIds) {
        yield entityId;
      }
    } catch (error) {
      throw new Error(
        `Failed to read keys for ${this.entityName}: ${getErrorMessage(error)}`
      );
    }
  }

  /**
   * Implements the async iterator protocol for iterating over entities.
   * Delegates to the `values` method for iteration, enabling `for await` loops over entities.
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<any> {
    for await (const entity of this.values()) {
      yield entity;
    }
  }

  /**
   * Filters entities based on a predicate function, yielding only matching entities.
   * Useful for selective retrieval (e.g., finding online `SessionId`s in a `SwarmName`).
   * @template T - The specific type of the entities (e.g., `IPersistAliveData`), defaults to `IEntity`.
   * @throws {Error} If reading entities fails during iteration (e.g., invalid JSON).
   */
  async *filter<T extends IEntity = IEntity>(
    predicate: (value: T) => boolean
  ): AsyncGenerator<T> {
    for await (const entity of this.values<T>()) {
      if (predicate(entity)) {
        yield entity;
      }
    }
  }

  /**
   * Takes a limited number of entities, optionally filtered by a predicate.
   * Stops yielding after reaching the specified total, useful for pagination (e.g., sampling `SessionId`s).
   * @template T - The specific type of the entities (e.g., `IPersistStateData`), defaults to `IEntity`.
   * @throws {Error} If reading entities fails during iteration (e.g., permissions).
   */
  async *take<T extends IEntity = IEntity>(
    total: number,
    predicate?: (value: T) => boolean
  ): AsyncGenerator<T> {
    let count = 0;
    if (predicate) {
      for await (const entity of this.values<T>()) {
        if (!predicate(entity)) {
          continue;
        }
        count += 1;
        yield entity;
        if (count >= total) {
          break;
        }
      }
    } else {
      for await (const entity of this.values<T>()) {
        count += 1;
        yield entity;
        if (count >= total) {
          break;
        }
      }
    }
  }
}

// @ts-ignore
PersistBase = makeExtendable(PersistBase);

/**
 * Type alias for an instance of `PersistBase`, used for type safety in extensions and utilities (e.g., `PersistAliveUtils`).
 */
export type TPersistBase = InstanceType<typeof PersistBase>;

/**
 * Extends `PersistBase` to provide a persistent list structure with push/pop operations.
 * Manages entities with numeric keys for ordered access, suitable for queues or logs in the swarm system.
 * @template EntityName - The type of entity name (e.g., `SwarmName`), defaults to `string`, used as a subdirectory.
 * @extends {PersistBase<EntityName>}
 */
class PersistList<
  EntityName extends string = string
> extends PersistBase<EntityName> {
  /** @private Tracks the last used numeric key for the list, initialized to `null` until computed*/
  _lastCount: number | null = null;

  /**
   * Creates a new `PersistList` instance for managing a persistent list of entities.
   * Inherits directory setup from `PersistBase` and adds list-specific functionality (e.g., for `SwarmName`-based event logs).
   */
  constructor(entityName: EntityName, baseDir?: string) {
    super(entityName, baseDir);
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_LIST_METHOD_NAME_CTOR, {
        entityName: this.entityName,
        baseDir,
      });
  }

  /**
   * Queued function to create a new unique key for a list item.
   * Ensures sequential key generation under concurrent calls using `queued` decorator.
   * @private
   * @throws {Error} If key generation fails due to underlying storage issues.
   */
  [LIST_CREATE_KEY_SYMBOL] = queued(
    async (): Promise<string> => await LIST_CREATE_KEY_FN(this)
  ) as () => Promise<string>;

  /**
   * Retrieves the key of the last item in the list.
   * Scans all keys to find the highest numeric value, used for pop operations (e.g., dequeuing from a `SwarmName` log).
   * @private
   * @throws {Error} If key retrieval fails due to underlying storage issues.
   */
  [LIST_GET_LAST_KEY_SYMBOL] = async (): Promise<string | null> =>
    await LIST_GET_LAST_KEY_FN(this);

  /**
   * Queued function to remove and return the last item in the list.
   * Ensures atomic pop operations under concurrent calls using `queued` decorator.
   * @private
   * @template T - The specific type of the entity (e.g., `IPersistStateData`), defaults to `IEntity`.
   * @throws {Error} If reading or removing the item fails.
   */
  [LIST_POP_SYMBOL] = queued(
    async (): Promise<any | null> => await LIST_POP_FN(this)
  ) as <T extends IEntity = IEntity>() => Promise<T | null>;

  /**
   * Adds an entity to the end of the persistent list with a new unique numeric key.
   * Useful for appending items like messages or events in swarm operations (e.g., within a `SwarmName`).
   * @template T - The specific type of the entity (e.g., `IPersistStateData`), defaults to `IEntity`.
   * @throws {Error} If writing to the file system fails (e.g., permissions or disk space).
   */
  async push<T extends IEntity = IEntity>(entity: T): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_LIST_METHOD_NAME_PUSH, {
        entityName: this.entityName,
      });
    return await this.writeValue(await this[LIST_CREATE_KEY_SYMBOL](), entity);
  }

  /**
   * Removes and returns the last entity from the persistent list.
   * Useful for dequeuing items or retrieving recent entries (e.g., latest event in a `SwarmName` log).
   * @template T - The specific type of the entity (e.g., `IPersistStateData`), defaults to `IEntity`.
   * @throws {Error} If reading or removing the entity fails (e.g., file not found).
   */
  async pop<T extends IEntity = IEntity>(): Promise<T | null> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_LIST_METHOD_NAME_POP, {
        entityName: this.entityName,
      });
    return await this[LIST_POP_SYMBOL]();
  }
}

// @ts-ignore
PersistList = makeExtendable(PersistList);

/**
 * Type alias for an instance of `PersistList`, used for type safety in list-based operations (e.g., swarm event logs).
 */
export type TPersistList = InstanceType<typeof PersistList>;

/**
 * Defines the structure for data stored in active agent persistence.
 * Used by `PersistSwarmUtils` to track the currently active agent per client and swarm.
 * @interface IPersistActiveAgentData
 */
export interface IPersistActiveAgentData {
  /**
   * The name of the active agent for a given client within a swarm.
   * `AgentName` is a string identifier (e.g., "agent1") representing an agent instance in the swarm system,
   * tied to specific functionality or role within a `SwarmName`.
   */
  agentName: AgentName;
}

/**
 * Defines the structure for data stored in navigation stack persistence.
 * Used by `PersistSwarmUtils` to maintain a stack of agent names for navigation history.
 * @interface IPersistNavigationStackData
 */
export interface IPersistNavigationStackData {
  /**
   * The stack of agent names representing navigation history for a client within a swarm.
   * `AgentName` is a string identifier (e.g., "agent1", "agent2") for agents in the swarm system,
   * tracking the sequence of active agents for a `SessionId` within a `SwarmName`.
   */
  agentStack: AgentName[];
}

/**
 * Defines control methods for customizing swarm persistence operations.
 * Allows injection of custom persistence adapters for active agents and navigation stacks tied to `SwarmName`.
 * @interface IPersistSwarmControl
 */
export interface IPersistSwarmControl {
  /**
   * Sets a custom persistence adapter for active agent storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory storage for `SwarmName`).
   */
  usePersistActiveAgentAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>
  ): void;

  /**
   * Sets a custom persistence adapter for navigation stack storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `SwarmName`).
   */
  usePersistNavigationStackAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>
  ): void;
}

/**
 * Utility class for managing swarm-related persistence, including active agents and navigation stacks.
 * Provides methods to get/set active agents and navigation stacks per client (`SessionId`) and swarm (`SwarmName`), with customizable adapters.
 * @implements {IPersistSwarmControl}
 */
export class PersistSwarmUtils implements IPersistSwarmControl {
  /** @private Default constructor for active agent persistence, defaults to `PersistBase`*/
  private PersistActiveAgentFactory: TPersistBaseCtor<
    SwarmName,
    IPersistActiveAgentData
  > = PersistBase;

  /** @private Default constructor for navigation stack persistence, defaults to `PersistBase`*/
  private PersistNavigationStackFactory: TPersistBaseCtor<
    SwarmName,
    IPersistNavigationStackData
  > = PersistBase;

  /**
   * Memoized function to create or retrieve storage for active agents.
   * Ensures a single persistence instance per `SwarmName`, improving efficiency.
   * @private
   */
  private getActiveAgentStorage = memoize(
    ([swarmName]: [SwarmName]): string => `${swarmName}`,
    (swarmName: SwarmName): IPersistBase<IPersistActiveAgentData> =>
      Reflect.construct(this.PersistActiveAgentFactory, [
        swarmName,
        `./logs/data/swarm/active_agent/`,
      ])
  );

  /**
   * Configures a custom constructor for active agent persistence, overriding the default `PersistBase`.
   * Allows advanced use cases like in-memory storage for `SwarmName`-specific active agents.
   */
  public usePersistActiveAgentAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_ACTIVE_AGENT_ADAPTER
      );
    this.PersistActiveAgentFactory = Ctor;
  }

  /**
   * Configures a custom constructor for navigation stack persistence, overriding the default `PersistBase`.
   * Enables customization for navigation tracking within a `SwarmName` (e.g., alternative storage backends).
   */
  public usePersistNavigationStackAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_NAVIGATION_STACK_ADAPTER
      );
    this.PersistNavigationStackFactory = Ctor;
  }

  /**
   * Memoized function to create or retrieve storage for navigation stacks.
   * Ensures a single persistence instance per `SwarmName`, optimizing resource use.
   * @private
   */
  private getNavigationStackStorage = memoize(
    ([swarmName]: [SwarmName]): string => `${swarmName}`,
    (swarmName: SwarmName): IPersistBase<IPersistNavigationStackData> =>
      Reflect.construct(this.PersistNavigationStackFactory, [
        swarmName,
        `./logs/data/swarm/navigation_stack/`,
      ])
  );

  /**
   * Retrieves the active agent for a client within a swarm, falling back to a default if not set.
   * Used to determine the current `AgentName` for a `SessionId` in a `SwarmName` context.
   * @throws {Error} If reading from storage fails (e.g., file corruption or permissions).
   */
  public getActiveAgent = async (
    clientId: string,
    swarmName: SwarmName,
    defaultAgent: AgentName
  ): Promise<AgentName> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_SWARM_UTILS_METHOD_NAME_GET_ACTIVE_AGENT,
        {
          clientId,
          swarmName,
        }
      );
    const isInitial = !this.getActiveAgentStorage.has(swarmName);
    const activeAgentStorage = this.getActiveAgentStorage(swarmName);
    await activeAgentStorage.waitForInit(isInitial);
    if (await activeAgentStorage.hasValue(clientId)) {
      const { agentName } = await activeAgentStorage.readValue(clientId);
      return agentName;
    }
    return defaultAgent;
  };

  /**
   * Sets the active agent for a client within a swarm, persisting it for future retrieval.
   * Links a `SessionId` to an `AgentName` within a `SwarmName` for runtime agent switching.
   * @throws {Error} If writing to storage fails (e.g., disk space or permissions).
   */
  public setActiveAgent = async (
    clientId: string,
    agentName: AgentName,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_SWARM_UTILS_METHOD_NAME_SET_ACTIVE_AGENT,
        {
          clientId,
          agentName,
          swarmName,
        }
      );
    const isInitial = !this.getActiveAgentStorage.has(swarmName);
    const activeAgentStorage = this.getActiveAgentStorage(swarmName);
    await activeAgentStorage.waitForInit(isInitial);
    await activeAgentStorage.writeValue(clientId, { agentName });
  };

  /**
   * Retrieves the navigation stack for a client within a swarm, returning an empty array if unset.
   * Tracks navigation history as a stack of `AgentName`s for a `SessionId` within a `SwarmName`.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  public getNavigationStack = async (
    clientId: string,
    swarmName: SwarmName
  ): Promise<AgentName[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_SWARM_UTILS_METHOD_NAME_GET_NAVIGATION_STACK,
        {
          clientId,
          swarmName,
        }
      );
    const isInitial = !this.getNavigationStackStorage.has(swarmName);
    const navigationStackStorage = this.getNavigationStackStorage(swarmName);
    await navigationStackStorage.waitForInit(isInitial);
    if (await navigationStackStorage.hasValue(clientId)) {
      const { agentStack } = await navigationStackStorage.readValue(clientId);
      return agentStack;
    }
    return [];
  };

  /**
   * Sets the navigation stack for a client within a swarm, persisting it for future retrieval.
   * Stores a stack of `AgentName`s for a `SessionId` within a `SwarmName` to track navigation history.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public setNavigationStack = async (
    clientId: string,
    agentStack: AgentName[],
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_SWARM_UTILS_METHOD_NAME_SET_NAVIGATION_STACK,
        {
          clientId,
          swarmName,
        }
      );
    const isInitial = !this.getNavigationStackStorage.has(swarmName);
    const navigationStackStorage = this.getNavigationStackStorage(swarmName);
    await navigationStackStorage.waitForInit(isInitial);
    await navigationStackStorage.writeValue(clientId, { agentStack });
  };
}

/**
 * Singleton instance of `PersistSwarmUtils` for managing swarm persistence globally.
 */
export const PersistSwarmAdapter = new PersistSwarmUtils();

/**
 * Exported singleton for swarm persistence operations, cast as the control interface.
 * Provides a global point of access for managing active agents and navigation stacks tied to `SwarmName`.
 */
export const PersistSwarm = PersistSwarmAdapter as IPersistSwarmControl;

/**
 * Defines the structure for state data persistence in the swarm system.
 * Wraps arbitrary state data for storage, used by `PersistStateUtils`.
 * @template T - The type of the state data, defaults to `unknown`.
 * @interface IPersistStateData
 */
export interface IPersistStateData<T = unknown> {
  /** The state data to persist (e.g., agent configuration or session state)*/
  state: T;
}

/**
 * Defines control methods for customizing state persistence operations.
 * Allows injection of a custom persistence adapter for states tied to `StateName`.
 * @interface IPersistStateControl
 */
export interface IPersistStateControl {
  /**
   * Sets a custom persistence adapter for state storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `StateName`).
   */
  usePersistStateAdapter(
    Ctor: TPersistBaseCtor<StateName, IPersistStateData>
  ): void;
}

/**
 * Utility class for managing state persistence per client (`SessionId`) and state name (`StateName`) in the swarm system.
 * Provides methods to get/set state data with a customizable persistence adapter.
 * @implements {IPersistStateControl}
 */
export class PersistStateUtils implements IPersistStateControl {
  /** @private Default constructor for state persistence, defaults to `PersistBase`*/
  private PersistStateFactory: TPersistBaseCtor<StateName, IPersistStateData> =
    PersistBase;

  /**
   * Memoized function to create or retrieve storage for a specific state.
   * Ensures a single persistence instance per `StateName`, optimizing resource use.
   * @private
   */
  private getStateStorage = memoize(
    ([stateName]: [StateName]): string => `${stateName}`,
    (stateName: StateName): IPersistBase<IPersistStateData> =>
      Reflect.construct(this.PersistStateFactory, [
        stateName,
        `./logs/data/state/`,
      ])
  );

  /**
   * Configures a custom constructor for state persistence, overriding the default `PersistBase`.
   * Enables advanced state storage for `StateName` (e.g., in-memory or database-backed persistence).
   */
  public usePersistStateAdapter(
    Ctor: TPersistBaseCtor<StateName, IPersistStateData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_STATE_UTILS_METHOD_NAME_USE_PERSIST_STATE_ADAPTER
      );
    this.PersistStateFactory = Ctor;
  }

  /**
   * Sets the state for a client under a specific state name, persisting it for future retrieval.
   * Stores state data for a `SessionId` under a `StateName` (e.g., agent variables).
   * @template T - The specific type of the state data, defaults to `unknown`.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public setState = async <T = unknown>(
    state: T,
    clientId: string,
    stateName: StateName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_STATE_UTILS_METHOD_NAME_SET_STATE, {
        clientId,
        stateName,
      });
    const isInitial = !this.getStateStorage.has(stateName);
    const stateStorage = this.getStateStorage(stateName);
    await stateStorage.waitForInit(isInitial);
    await stateStorage.writeValue(clientId, { state });
  };

  /**
   * Retrieves the state for a client under a specific state name, falling back to a default if unset.
   * Restores state for a `SessionId` under a `StateName` (e.g., resuming agent context).
   * @template T - The specific type of the state data, defaults to `unknown`.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  public getState = async <T = unknown>(
    clientId: string,
    stateName: StateName,
    defaultState: T
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_STATE_UTILS_METHOD_NAME_GET_STATE, {
        clientId,
        stateName,
      });
    const isInitial = !this.getStateStorage.has(stateName);
    const stateStorage = this.getStateStorage(stateName);
    await stateStorage.waitForInit(isInitial);
    if (await stateStorage.hasValue(clientId)) {
      const { state } = await stateStorage.readValue(clientId);
      return state as T;
    }
    return defaultState;
  };
}

/**
 * Singleton instance of `PersistStateUtils` for managing state persistence globally.
 */
export const PersistStateAdapter = new PersistStateUtils();

/**
 * Exported singleton for state persistence operations, cast as the control interface.
 * Provides a global point of access for managing state persistence tied to `StateName` and `SessionId`.
 */
export const PersistState = PersistStateAdapter as IPersistStateControl;

/**
 * Defines the structure for storage data persistence in the swarm system.
 * Wraps an array of storage data for persistence, used by `PersistStorageUtils`.
 * @template T - The type of storage data, defaults to `IStorageData`.
 * @interface IPersistStorageData
 */
export interface IPersistStorageData<T extends IStorageData = IStorageData> {
  /** The array of storage data to persist (e.g., key-value pairs or records)*/
  data: T[];
}

/**
 * Defines control methods for customizing storage persistence operations.
 * Allows injection of a custom persistence adapter for storage tied to `StorageName`.
 * @interface IPersistStorageControl
 */
export interface IPersistStorageControl {
  /**
   * Sets a custom persistence adapter for storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., database storage for `StorageName`).
   */
  usePersistStorageAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>
  ): void;
}

/**
 * Utility class for managing storage persistence per client (`SessionId`) and storage name (`StorageName`) in the swarm system.
 * Provides methods to get/set storage data with a customizable persistence adapter.
 * @implements {IPersistStorageControl}
 */
export class PersistStorageUtils implements IPersistStorageControl {
  /** @private Default constructor for storage persistence, defaults to `PersistBase`*/
  private PersistStorageFactory: TPersistBaseCtor<
    StorageName,
    IPersistStorageData
  > = PersistBase;

  /**
   * Memoized function to create or retrieve storage for a specific storage name.
   * Ensures a single persistence instance per `StorageName`, optimizing resource use.
   * @private
   */
  private getPersistStorage = memoize(
    ([storageName]: [StorageName]): string => `${storageName}`,
    (storageName: StorageName): IPersistBase<IPersistStorageData> =>
      Reflect.construct(this.PersistStorageFactory, [
        storageName,
        `./logs/data/storage/`,
      ])
  );

  /**
   * Configures a custom constructor for storage persistence, overriding the default `PersistBase`.
   * Enables advanced storage options for `StorageName` (e.g., database-backed persistence).
   */
  public usePersistStorageAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_STORAGE_UTILS_METHOD_NAME_USE_PERSIST_STORAGE_ADAPTER
      );
    this.PersistStorageFactory = Ctor;
  }

  /**
   * Retrieves the data for a client from a specific storage, falling back to a default if unset.
   * Accesses persistent storage for a `SessionId` under a `StorageName` (e.g., user records).
   * @template T - The specific type of the storage data, defaults to `IStorageData`.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  public getData = async <T extends IStorageData = IStorageData>(
    clientId: string,
    storageName: StorageName,
    defaultValue: T[]
  ): Promise<T[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_STORAGE_UTILS_METHOD_NAME_GET_DATA, {
        clientId,
        storageName,
      });
    const isInitial = !this.getPersistStorage.has(storageName);
    const persistStorage = this.getPersistStorage(storageName);
    await persistStorage.waitForInit(isInitial);
    if (await persistStorage.hasValue(clientId)) {
      const { data } = await persistStorage.readValue(clientId);
      return data as T[];
    }
    return defaultValue;
  };

  /**
   * Sets the data for a client in a specific storage, persisting it for future retrieval.
   * Stores data for a `SessionId` under a `StorageName` (e.g., user logs).
   * @template T - The specific type of the storage data, defaults to `IStorageData`.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public setData = async <T extends IStorageData = IStorageData>(
    data: T[],
    clientId: string,
    storageName: StorageName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_STORAGE_UTILS_METHOD_NAME_SET_DATA, {
        clientId,
        storageName,
      });
    const isInitial = !this.getPersistStorage.has(storageName);
    const persistStorage = this.getPersistStorage(storageName);
    await persistStorage.waitForInit(isInitial);
    await persistStorage.writeValue(clientId, { data });
  };
}

/**
 * Singleton instance of `PersistStorageUtils` for managing storage persistence globally.
 */
export const PersistStorageAdapter = new PersistStorageUtils();

/**
 * Exported singleton for storage persistence operations, cast as the control interface.
 * Provides a global point of access for managing storage persistence tied to `StorageName` and `SessionId`.
 */
export const PersistStorage = PersistStorageAdapter as IPersistStorageControl;

/**
 * Defines the structure for memory data persistence in the swarm system.
 * Wraps arbitrary memory data for storage, used by `PersistMemoryUtils`.
 * @template T - The type of the memory data, defaults to `unknown`.
 * @interface IPersistMemoryData
 */
export interface IPersistMemoryData<T = unknown> {
  /** The memory data to persist (e.g., session context or temporary state)*/
  data: T;
}

/**
 * Defines control methods for customizing memory persistence operations.
 * Allows injection of a custom persistence adapter for memory tied to `SessionId`.
 * @interface IPersistMemoryControl
 */
export interface IPersistMemoryControl {
  /**
   * Sets a custom persistence adapter for memory storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory storage for `SessionId`).
   */
  usePersistMemoryAdapter(
    Ctor: TPersistBaseCtor<SessionId, IPersistMemoryData>
  ): void;
}

/**
 * Utility class for managing memory persistence per client (`SessionId`) in the swarm system.
 * Provides methods to get/set memory data with a customizable persistence adapter.
 * @implements {IPersistMemoryControl}
 */
export class PersistMemoryUtils implements IPersistMemoryControl {
  /** @private Default constructor for memory persistence, defaults to `PersistBase`*/
  private PersistMemoryFactory: TPersistBaseCtor<
    SessionId,
    IPersistMemoryData
  > = PersistBase;

  /**
   * Memoized function to create or retrieve storage for a specific client’s memory.
   * Ensures a single persistence instance per `SessionId`, optimizing resource use.
   * @private
   */
  private getMemoryStorage = memoize(
    ([clientId]: [SessionId]): string => `${clientId}`,
    (clientId: SessionId): IPersistBase<IPersistMemoryData> =>
      Reflect.construct(this.PersistMemoryFactory, [
        clientId,
        `./logs/data/memory/`,
      ])
  );

  /**
   * Configures a custom constructor for memory persistence, overriding the default `PersistBase`.
   * Enables advanced memory storage for `SessionId` (e.g., in-memory or database-backed persistence).
   */
  public usePersistMemoryAdapter(
    Ctor: TPersistBaseCtor<SessionId, IPersistMemoryData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_MEMORY_UTILS_METHOD_NAME_USE_PERSIST_MEMORY_ADAPTER
      );
    this.PersistMemoryFactory = Ctor;
  }

  /**
   * Sets the memory data for a client, persisting it for future retrieval.
   * Stores session-specific memory for a `SessionId` (e.g., temporary context).
   * @template T - The specific type of the memory data, defaults to `unknown`.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public setMemory = async <T = unknown>(
    data: T,
    clientId: string
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_MEMORY_UTILS_METHOD_NAME_SET_MEMORY, {
        clientId,
      });
    const isInitial = !this.getMemoryStorage.has(clientId);
    const stateStorage = this.getMemoryStorage(clientId);
    await stateStorage.waitForInit(isInitial);
    await stateStorage.writeValue(clientId, { data });
  };

  /**
   * Retrieves the memory data for a client, falling back to a default if unset.
   * Restores session-specific memory for a `SessionId` (e.g., resuming context).
   * @template T - The specific type of the memory data, defaults to `unknown`.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  public getMemory = async <T = unknown>(
    clientId: string,
    defaultState: T
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_MEMORY_UTILS_METHOD_NAME_GET_MEMORY, {
        clientId,
      });
    const isInitial = !this.getMemoryStorage.has(clientId);
    const stateStorage = this.getMemoryStorage(clientId);
    await stateStorage.waitForInit(isInitial);
    if (await stateStorage.hasValue(clientId)) {
      const { data } = await stateStorage.readValue(clientId);
      return data as T;
    }
    return defaultState;
  };

  /**
   * Disposes of the memory storage for a client by clearing its memoized instance.
   * Useful for cleanup when a `SessionId` ends or memory is no longer needed.
   */
  public dispose = (clientId: string) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_MEMORY_UTILS_METHOD_NAME_DISPOSE, {
        clientId,
      });
    this.getMemoryStorage.clear(clientId);
  };
}

/**
 * Singleton instance of `PersistMemoryUtils` for managing memory persistence globally.
 */
export const PersistMemoryAdapter = new PersistMemoryUtils();

/**
 * Exported singleton for memory persistence operations, cast as the control interface.
 * Provides a global point of access for managing memory persistence tied to `SessionId`.
 */
export const PersistMemory = PersistMemoryAdapter as IPersistMemoryControl;

/**
 * Defines the structure for alive status persistence in the swarm system.
 * Tracks whether a client (`SessionId`) is online or offline within a `SwarmName`.
 * @interface IPersistAliveData
 */
export interface IPersistAliveData {
  /** Indicates whether the client is online (`true`) or offline (`false`)*/
  online: boolean;
}

/**
 * Defines control methods for customizing alive status persistence operations.
 * Allows injection of a custom persistence adapter for alive status tied to `SwarmName`.
 * @interface IPersistAliveControl
 */
export interface IPersistAliveControl {
  /**
   * Sets a custom persistence adapter for alive status storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
   */
  usePersistAliveAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistAliveData>
  ): void;
}

/**
 * Utility class for managing alive status persistence per client (`SessionId`) in the swarm system.
 * Provides methods to mark clients as online/offline and check their status within a `SwarmName`, with a customizable adapter.
 * @implements {IPersistAliveControl}
 */
export class PersistAliveUtils implements IPersistAliveControl {
  /** @private Default constructor for alive status persistence, defaults to `PersistBase`*/
  private PersistAliveFactory: TPersistBaseCtor<
    SwarmName,
    IPersistAliveData
  > = class extends PersistBase {
    public waitForInit = singleshot(async (initial: boolean) => {
      await super.waitForInit(initial);
      for await (const entityKey of this.keys()) {
        await this.writeValue<IPersistAliveData>(entityKey, { online: false });
      }
    });
  };

  /**
   * Memoized function to create or retrieve storage for a specific client’s alive status.
   * Ensures a single persistence instance per client ID, optimizing resource use.
   * @private
   */
  private getAliveStorage = memoize(
    ([swarmName]: [SwarmName]): string => `${swarmName}`,
    (swarmName: SwarmName): IPersistBase<IPersistAliveData> =>
      Reflect.construct(this.PersistAliveFactory, [
        swarmName,
        `./logs/data/alive/`,
      ])
  );

  /**
   * Configures a custom constructor for alive status persistence, overriding the default `PersistBase`.
   * Enables advanced tracking (e.g., in-memory or database-backed persistence).
   */
  public usePersistAliveAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistAliveData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_ALIVE_UTILS_METHOD_NAME_USE_PERSIST_ALIVE_ADAPTER
      );
    this.PersistAliveFactory = Ctor;
  }

  /**
   * Marks a client as online, persisting the status for future retrieval.
   * Used to track client availability in swarm operations.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public markOnline = async (
    clientId: string,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_ALIVE_UTILS_METHOD_NAME_MARK_ONLINE, {
        clientId,
      });
    const isInitial = !this.getAliveStorage.has(swarmName);
    const stateStorage = this.getAliveStorage(swarmName);
    await stateStorage.waitForInit(isInitial);
    await stateStorage.writeValue(clientId, { online: true });
  };

  /**
   * Marks a client as offline, persisting the status for future retrieval.
   * Used to track client availability in swarm operations.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public markOffline = async (
    clientId: string,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_ALIVE_UTILS_METHOD_NAME_MARK_OFFLINE, {
        clientId,
      });
    const isInitial = !this.getAliveStorage.has(swarmName);
    const stateStorage = this.getAliveStorage(swarmName);
    await stateStorage.waitForInit(isInitial);
    await stateStorage.writeValue(clientId, { online: false });
  };

  /**
   * Retrieves the online status for a client, defaulting to `false` if unset.
   * Used to check client availability in swarm workflows.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  public getOnline = async (
    clientId: string,
    swarmName: SwarmName
  ): Promise<boolean> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_ALIVE_UTILS_METHOD_NAME_GET_ONLINE, {
        clientId,
      });
    const isInitial = !this.getAliveStorage.has(swarmName);
    const stateStorage = this.getAliveStorage(swarmName);
    await stateStorage.waitForInit(isInitial);
    if (await stateStorage.hasValue(clientId)) {
      const { online } = await stateStorage.readValue(clientId);
      return online;
    }
    return false;
  };
}

/**
 * Singleton instance of `PersistAliveUtils` for managing alive status persistence globally.
 */
export const PersistAliveAdapter = new PersistAliveUtils();

/**
 * Exported singleton for alive status persistence operations, cast as the control interface.
 * Provides a global point of access for managing client online/offline status in the swarm.
 */
export const PersistAlive = PersistAliveAdapter as IPersistAliveControl;
/**
 * Defines the structure for policy data persistence in the swarm system.
 * Tracks banned clients (`SessionId`) within a `SwarmName` under a specific policy.
 * @interface IPersistPolicyData
 */
export interface IPersistPolicyData {
  /** Array of session IDs that are banned under this policy*/
  bannedClients: SessionId[];
}

/**
 * Defines control methods for customizing policy persistence operations.
 * Allows injection of a custom persistence adapter for policy data tied to `SwarmName`.
 * @interface IPersistPolicyControl
 */
export interface IPersistPolicyControl {
  /**
   * Sets a custom persistence adapter for policy data storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
   */
  usePersistPolicyAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistPolicyData>
  ): void;
}

/**
 * Utility class for managing policy data persistence in the swarm system.
 * Provides methods to get and set banned clients within a `SwarmName`, with a customizable adapter.
 * @implements {IPersistPolicyControl}
 */
export class PersistPolicyUtils implements IPersistPolicyControl {
  /** @private Default constructor for policy data persistence, defaults to `PersistBase`*/
  private PersistPolicyFactory: TPersistBaseCtor<
    SwarmName,
    IPersistPolicyData
  > = PersistBase;

  /**
   * Memoized function to create or retrieve storage for a specific policy data.
   * Ensures a single persistence instance per swarm, optimizing resource use.
   * @private
   */
  private getPolicyStorage = memoize(
    ([swarmName]: [SwarmName]): string => `${swarmName}`,
    (swarmName: SwarmName): IPersistBase<IPersistPolicyData> =>
      Reflect.construct(this.PersistPolicyFactory, [
        swarmName,
        `./logs/data/policy/`,
      ])
  );

  /**
   * Configures a custom constructor for policy data persistence, overriding the default `PersistBase`.
   * Enables advanced tracking (e.g., in-memory or database-backed persistence).
   */
  public usePersistPolicyAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistPolicyData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_POLICY_UTILS_METHOD_NAME_USE_PERSIST_POLICY_ADAPTER
      );
    this.PersistPolicyFactory = Ctor;
  }

  /**
   * Retrieves the list of banned clients for a specific policy, defaulting to an empty array if unset.
   * Used to check client ban status in swarm workflows.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  public getBannedClients = async (
    policyName: PolicyName,
    swarmName: SwarmName,
    defaultValue: SessionId[] = []
  ): Promise<SessionId[]> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_POLICY_UTILS_METHOD_NAME_GET_BANNED_CLIENTS
      );

    const isInitial = !this.getPolicyStorage.has(swarmName);
    const stateStorage = this.getPolicyStorage(swarmName);
    await stateStorage.waitForInit(isInitial);

    if (await stateStorage.hasValue(policyName)) {
      const { bannedClients } = await stateStorage.readValue(policyName);
      return bannedClients;
    }

    return defaultValue;
  };

  /**
   * Sets the list of banned clients for a specific policy, persisting the status for future retrieval.
   * Used to manage client bans in swarm operations.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public setBannedClients = async (
    bannedClients: SessionId[],
    policyName: PolicyName,
    swarmName: SwarmName
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_POLICY_UTILS_METHOD_NAME_SET_BANNED_CLIENTS
      );

    const isInitial = !this.getPolicyStorage.has(swarmName);
    const stateStorage = this.getPolicyStorage(swarmName);
    await stateStorage.waitForInit(isInitial);

    await stateStorage.writeValue(policyName, { bannedClients });
  };
}

/**
 * Singleton instance of `PersistPolicyUtils` for managing policy data persistence globally.
 */
export const PersistPolicyAdapter = new PersistPolicyUtils();

/**
 * Exported singleton for policy persistence operations, cast as the control interface.
 * Provides a global point of access for managing client bans in the swarm.
 */
export const PersistPolicy = PersistPolicyAdapter as IPersistPolicyControl;

/**
 * Defines the structure for embedding data persistence in the swarm system.
 * Stores numerical embeddings for a `stringHash` within an `EmbeddingName`.
 * @interface IPersistEmbeddingData
 */
export interface IPersistEmbeddingData {
  /** Array of numerical values representing the embedding vector*/
  embeddings: number[];
}

/**
 * Defines control methods for customizing embedding persistence operations.
 * Allows injection of a custom persistence adapter for embedding data tied to `EmbeddingName`.
 * @interface IPersistEmbeddingControl
 */
export interface IPersistEmbeddingControl {
  /**
   * Sets a custom persistence adapter for embedding data storage.
   * Overrides the default `PersistBase` implementation for specialized behavior (e.g., in-memory tracking for `SwarmName`).
   */
  usePersistEmbeddingAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistEmbeddingData>
  ): void;
}

/**
 * Utility class for managing embedding data persistence in the swarm system.
 * Provides methods to read and write embedding vectors with a customizable adapter.
 * @implements {IPersistEmbeddingControl}
 */
export class PersistEmbeddingUtils implements IPersistEmbeddingControl {
  /** @private Default constructor for embedding data persistence, defaults to `PersistBase`*/
  private PersistEmbeddingFactory: TPersistBaseCtor<
    SwarmName,
    IPersistEmbeddingData
  > = PersistBase;

  /**
   * Memoized function to create or retrieve storage for specific embedding data.
   * Ensures a single persistence instance per embedding name, optimizing resource use.
   * @private
   */
  private getEmbeddingStorage = memoize(
    ([embeddingName]: [EmbeddingName]): string => `${embeddingName}`,
    (embeddingName: SwarmName): IPersistBase<IPersistEmbeddingData> =>
      Reflect.construct(this.PersistEmbeddingFactory, [
        embeddingName,
        `./logs/data/embedding/`,
      ])
  );

  /**
   * Configures a custom constructor for embedding data persistence, overriding the default `PersistBase`.
   * Enables advanced tracking (e.g., in-memory or database-backed persistence).
   */
  public usePersistEmbeddingAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistEmbeddingData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_EMBEDDING_UTILS_METHOD_NAME_USE_PERSIST_EMBEDDING_ADAPTER
      );
    this.PersistEmbeddingFactory = Ctor;
  }

  /**
   * Retrieves the embedding vector for a specific string hash, returning null if not found.
   * Used to check if a precomputed embedding exists in the cache.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  public readEmbeddingCache = async (
    embeddingName: EmbeddingName,
    stringHash: string
  ): Promise<number[] | null> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_EMBEDDING_UTILS_METHOD_NAME_READ_EMBEDDING_CACHE
      );

    const isInitial = !this.getEmbeddingStorage.has(embeddingName);
    const stateStorage = this.getEmbeddingStorage(embeddingName);
    await stateStorage.waitForInit(isInitial);

    if (await stateStorage.hasValue(stringHash)) {
      const { embeddings } = await stateStorage.readValue(stringHash);
      return embeddings;
    }

    return null;
  };

  /**
   * Stores an embedding vector for a specific string hash, persisting it for future retrieval.
   * Used to cache computed embeddings to avoid redundant processing.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  public writeEmbeddingCache = async (
    embeddings: number[],
    embeddingName: EmbeddingName,
    stringHash: string
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_EMBEDDING_UTILS_METHOD_NAME_WRITE_EMBEDDING_CACHE
      );

    const isInitial = !this.getEmbeddingStorage.has(embeddingName);
    const stateStorage = this.getEmbeddingStorage(embeddingName);
    await stateStorage.waitForInit(isInitial);

    await stateStorage.writeValue(stringHash, { embeddings });
  };
}

/**
 * Singleton instance of `PersistEmbeddingUtils` for managing embedding data persistence globally.
 */
export const PersistEmbeddingAdapter = new PersistEmbeddingUtils();

/**
 * Exported singleton for embedding persistence operations, cast as the control interface.
 * Provides a global point of access for managing embedding cache in the system.
 */
export const PersistEmbedding =
  PersistEmbeddingAdapter as IPersistEmbeddingControl;

export { PersistBase, PersistList };
