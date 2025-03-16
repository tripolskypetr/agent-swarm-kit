import fs from "fs/promises";
import { getErrorMessage, memoize, queued, singleshot } from "functools-kit";
import { join } from "path";
import { SwarmName } from "../interfaces/Swarm.interface";
import { AgentName } from "../interfaces/Agent.interface";
import { StateName } from "../interfaces/State.interface";
import { IStorageData, StorageName } from "../interfaces/Storage.interface";
import { writeFileAtomic } from "../utils/writeFileAtomic";
import { GLOBAL_CONFIG } from "../config/params";
import swarm from "../lib";
import { SessionId } from "../interfaces/Session.interface";

/**
 * Identifier for an entity, can be a string or number.
 * @typedef {string | number} EntityId
 */
type EntityId = string | number;

/**
 * Base interface for all persistent entities.
 * @interface IEntity
 */
interface IEntity {}

/** @private Symbol for memoizing the wait-for-initialization operation in PersistBase */
const BASE_WAIT_FOR_INIT_SYMBOL = Symbol("wait-for-init");

/** @private Symbol for creating a new key in a persistent list */
const LIST_CREATE_KEY_SYMBOL = Symbol("create-key");

/** @private Symbol for getting the last key in a persistent list */
const LIST_GET_LAST_KEY_SYMBOL = Symbol("get-last-key");

/** @private Symbol for popping the last item from a persistent list */
const LIST_POP_SYMBOL = Symbol("pop");

// Logging method names for PersistBase
/** @private Constant for logging the constructor in PersistBase */
const PERSIST_BASE_METHOD_NAME_CTOR = "PersistBase.CTOR";
/** @private Constant for logging the waitForInit method in PersistBase */
const PERSIST_BASE_METHOD_NAME_WAIT_FOR_INIT = "PersistBase.waitForInit";
/** @private Constant for logging the readValue method in PersistBase */
const PERSIST_BASE_METHOD_NAME_READ_VALUE = "PersistBase.readValue";
/** @private Constant for logging the writeValue method in PersistBase */
const PERSIST_BASE_METHOD_NAME_WRITE_VALUE = "PersistBase.writeValue";
/** @private Constant for logging the hasValue method in PersistBase */
const PERSIST_BASE_METHOD_NAME_HAS_VALUE = "PersistBase.hasValue";
/** @private Constant for logging the removeValue method in PersistBase */
const PERSIST_BASE_METHOD_NAME_REMOVE_VALUE = "PersistBase.removeValue";
/** @private Constant for logging the removeAll method in PersistBase */
const PERSIST_BASE_METHOD_NAME_REMOVE_ALL = "PersistBase.removeAll";
/** @private Constant for logging the values method in PersistBase */
const PERSIST_BASE_METHOD_NAME_VALUES = "PersistBase.values";
/** @private Constant for logging the keys method in PersistBase */
const PERSIST_BASE_METHOD_NAME_KEYS = "PersistBase.keys";

// Logging method names for PersistList
/** @private Constant for logging the constructor in PersistList */
const PERSIST_LIST_METHOD_NAME_CTOR = "PersistList.CTOR";
/** @private Constant for logging the push method in PersistList */
const PERSIST_LIST_METHOD_NAME_PUSH = "PersistList.push";
/** @private Constant for logging the pop method in PersistList */
const PERSIST_LIST_METHOD_NAME_POP = "PersistList.pop";

// Logging method names for PersistSwarmUtils
/** @private Constant for logging the usePersistActiveAgentAdapter method in PersistSwarmUtils */
const PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_ACTIVE_AGENT_ADAPTER =
  "PersistSwarmUtils.usePersistActiveAgentAdapter";
/** @private Constant for logging the usePersistNavigationStackAdapter method in PersistSwarmUtils */
const PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_NAVIGATION_STACK_ADAPTER =
  "PersistSwarmUtils.usePersistNavigationStackAdapter";
/** @private Constant for logging the getActiveAgent method in PersistSwarmUtils */
const PERSIST_SWARM_UTILS_METHOD_NAME_GET_ACTIVE_AGENT =
  "PersistSwarmUtils.getActiveAgent";
/** @private Constant for logging the setActiveAgent method in PersistSwarmUtils */
const PERSIST_SWARM_UTILS_METHOD_NAME_SET_ACTIVE_AGENT =
  "PersistSwarmUtils.setActiveAgent";
/** @private Constant for logging the getNavigationStack method in PersistSwarmUtils */
const PERSIST_SWARM_UTILS_METHOD_NAME_GET_NAVIGATION_STACK =
  "PersistSwarmUtils.getNavigationStack";
/** @private Constant for logging the setNavigationStack method in PersistSwarmUtils */
const PERSIST_SWARM_UTILS_METHOD_NAME_SET_NAVIGATION_STACK =
  "PersistSwarmUtils.setNavigationStack";

// Logging method names for PersistStateUtils
/** @private Constant for logging the usePersistStateAdapter method in PersistStateUtils */
const PERSIST_STATE_UTILS_METHOD_NAME_USE_PERSIST_STATE_ADAPTER =
  "PersistStateUtils.usePersistStateAdapter";
/** @private Constant for logging the setState method in PersistStateUtils */
const PERSIST_STATE_UTILS_METHOD_NAME_SET_STATE = "PersistStateUtils.setState";
/** @private Constant for logging the getState method in PersistStateUtils */
const PERSIST_STATE_UTILS_METHOD_NAME_GET_STATE = "PersistStateUtils.getState";

const PERSIST_MEMORY_UTILS_METHOD_NAME_USE_PERSIST_MEMORY_ADAPTER =
  "PersistMemoryUtils.usePersistMemoryAdapter";
const PERSIST_MEMORY_UTILS_METHOD_NAME_SET_MEMORY =
  "PersistMemoryUtils.setMemory";
const PERSIST_MEMORY_UTILS_METHOD_NAME_GET_MEMORY =
  "PersistMemoryUtils.getMemory";

// Logging method names for PersistStorageUtils
/** @private Constant for logging the usePersistStorageAdapter method in PersistStorageUtils */
const PERSIST_STORAGE_UTILS_METHOD_NAME_USE_PERSIST_STORAGE_ADAPTER =
  "PersistStorageUtils.usePersistStorageAdapter";
/** @private Constant for logging the getData method in PersistStorageUtils */
const PERSIST_STORAGE_UTILS_METHOD_NAME_GET_DATA =
  "PersistStorageUtils.getData";
/** @private Constant for logging the setData method in PersistStorageUtils */
const PERSIST_STORAGE_UTILS_METHOD_NAME_SET_DATA =
  "PersistStorageUtils.setData";

// Logging method names for the functions
/** @private Constant for logging the waitForInitFn function */
const BASE_WAIT_FOR_INIT_FN_METHOD_NAME = "PersistBase.waitForInitFn";
/** @private Constant for logging the createKeyFn function */
const LIST_CREATE_KEY_FN_METHOD_NAME = "PersistList.createKeyFn";
/** @private Constant for logging the popFn function */
const LIST_POP_FN_METHOD_NAME = "PersistList.popFn";
/** @private Constant for logging the getLastKeyFn function */
const LIST_GET_LAST_KEY_FN_METHOD_NAME = "PersistList.getLastKeyFn";

/**
 * Interface defining methods for persistent storage operations.
 * @template Entity - The type of entity, defaults to IEntity.
 */
export interface IPersistBase<Entity extends IEntity = IEntity> {
  /**
   * Initializes the storage, creating directories and validating existing data.
   * @param {boolean} initial - Whether this is the initial setup (affects caching behavior).
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  waitForInit(initial: boolean): Promise<void>;

  /**
   * Reads an entity from storage by its ID.
   * @param {EntityId} entityId - The ID of the entity to read.
   * @returns {Promise<Entity>} A promise resolving to the entity.
   * @throws {Error} If the entity is not found or reading fails.
   */
  readValue(entityId: EntityId): Promise<Entity>;

  /**
   * Checks if an entity exists in storage.
   * @param {EntityId} entityId - The ID of the entity to check.
   * @returns {Promise<boolean>} A promise resolving to true if the entity exists, false otherwise.
   * @throws {Error} If checking existence fails (other than not found).
   */
  hasValue(entityId: EntityId): Promise<boolean>;

  /**
   * Writes an entity to storage with the specified ID.
   * @param {EntityId} entityId - The ID of the entity to write.
   * @param {Entity} entity - The entity data to write.
   * @returns {Promise<void>} A promise that resolves when writing is complete.
   * @throws {Error} If writing fails.
   */
  writeValue(entityId: EntityId, entity: Entity): Promise<void>;
}

/**
 * Constructor type for creating PersistBase instances.
 * @template EntityName - The type of entity name, defaults to string.
 * @template Entity - The type of entity, defaults to IEntity.
 * @typedef {new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>} TPersistBaseCtor
 */
export type TPersistBaseCtor<
  EntityName extends string = string,
  Entity extends IEntity = IEntity
> = new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>;

/**
 * Initializes the storage directory and validates existing entities, removing invalid ones.
 * @param {PersistBase} self - The PersistBase instance.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 * @private
 */
const BASE_WAIT_FOR_INIT_FN = async (self: PersistBase): Promise<void> => {
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
      await fs.unlink(filePath);
    }
  }
};

/**
 * Generates a new unique key for a list item by incrementing the last used key.
 * @param {PersistList} self - The PersistList instance.
 * @returns {Promise<string>} A promise resolving to the new key as a string.
 * @private
 */
const LIST_CREATE_KEY_FN = async (self: PersistList): Promise<string> => {
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
 * @param {PersistList} self - The PersistList instance.
 * @returns {Promise<any | null>} A promise resolving to the removed item or null if the list is empty.
 * @private
 */
const LIST_POP_FN = async (self: PersistList): Promise<any | null> => {
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
 * Retrieves the key of the last item in the persistent list.
 * @param {PersistList} self - The PersistList instance.
 * @returns {Promise<string | null>} A promise resolving to the last key or null if the list is empty.
 * @private
 */
const LIST_GET_LAST_KEY_FN = async (
  self: PersistList
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
 * Base class for persistent storage of entities in the file system.
 * @template EntityName - The type of entity name, defaults to string.
 * @implements {IPersistBase}
 */
export class PersistBase<EntityName extends string = string>
  implements IPersistBase
{
  /** @private The directory path where entity files are stored */
  _directory: string;

  /**
   * Creates a new PersistBase instance for managing persistent storage.
   * @param {EntityName} entityName - The name of the entity type (used as a subdirectory).
   * @param {string} [baseDir=join(process.cwd(), "logs/data")] - The base directory for storing entity files.
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
   * Computes the file path for an entity based on its ID.
   * @param {EntityId} entityId - The ID of the entity.
   * @returns {string} The full file path for the entity (e.g., `<baseDir>/<entityName>/<entityId>.json`).
   * @private
   */
  _getFilePath(entityId: EntityId): string {
    return join(this.baseDir, this.entityName, `${entityId}.json`);
  }

  /**
   * Memoized initialization function to ensure it runs only once.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   * @private
   */
  private [BASE_WAIT_FOR_INIT_SYMBOL] = singleshot(
    async (): Promise<void> => await BASE_WAIT_FOR_INIT_FN(this)
  );

  /**
   * Initializes the storage directory and validates existing entities.
   * Creates the directory if it doesn't exist and removes invalid files.
   * @param {boolean} initial - Whether this is the initial setup (unused in this implementation).
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  public async waitForInit(initial: boolean): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_BASE_METHOD_NAME_WAIT_FOR_INIT, {
        entityName: this.entityName,
        initial,
      });
    await this[BASE_WAIT_FOR_INIT_SYMBOL]();
  }

  /**
   * Retrieves the number of entities stored in the directory.
   * @returns {Promise<number>} A promise resolving to the count of `.json` files.
   * @throws {Error} If reading the directory fails.
   */
  public async getCount(): Promise<number> {
    const files = await fs.readdir(this._directory);
    const { length } = files.filter((file) => file.endsWith(".json"));
    return length;
  }

  /**
   * Reads an entity from storage by its ID.
   * @template T - The type of the entity, defaults to IEntity.
   * @param {EntityId} entityId - The ID of the entity to read.
   * @returns {Promise<T>} A promise resolving to the entity data.
   * @throws {Error} If the file is not found (`ENOENT`) or parsing fails.
   */
  public async readValue<T extends IEntity = IEntity>(
    entityId: EntityId
  ): Promise<T> {
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
   * @param {EntityId} entityId - The ID of the entity to check.
   * @returns {Promise<boolean>} A promise resolving to true if the entity exists, false otherwise.
   * @throws {Error} If checking existence fails (other than not found).
   */
  public async hasValue(entityId: EntityId): Promise<boolean> {
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
   * Writes an entity to storage with the specified ID.
   * @template T - The type of the entity, defaults to IEntity.
   * @param {EntityId} entityId - The ID of the entity to write.
   * @param {T} entity - The entity data to write.
   * @returns {Promise<void>} A promise that resolves when writing is complete.
   * @throws {Error} If writing to the file fails.
   */
  public async writeValue<T extends IEntity = IEntity>(
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
   * @param {EntityId} entityId - The ID of the entity to remove.
   * @returns {Promise<void>} A promise that resolves when removal is complete.
   * @throws {Error} If the entity is not found or removal fails.
   */
  public async removeValue(entityId: EntityId): Promise<void> {
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
   * Removes all entities from storage.
   * @returns {Promise<void>} A promise that resolves when all entities are removed.
   * @throws {Error} If reading the directory or removing files fails.
   */
  public async removeAll(): Promise<void> {
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
   * @template T - The type of the entities, defaults to IEntity.
   * @returns {AsyncGenerator<T>} An async generator yielding entities.
   * @throws {Error} If reading the directory or entity files fails.
   */
  public async *values<T extends IEntity = IEntity>(): AsyncGenerator<T> {
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
   * @returns {AsyncGenerator<EntityId>} An async generator yielding entity IDs.
   * @throws {Error} If reading the directory fails.
   */
  public async *keys(): AsyncGenerator<EntityId> {
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
   * @returns {AsyncIterableIterator<any>} An async iterator yielding entities.
   */
  public async *[Symbol.asyncIterator](): AsyncIterableIterator<any> {
    for await (const entity of this.values()) {
      yield entity;
    }
  }

  /**
   * Filters entities based on a predicate function.
   * @template T - The type of the entities, defaults to IEntity.
   * @param {(value: T) => boolean} predicate - A function to test each entity.
   * @returns {AsyncGenerator<T>} An async generator yielding entities that pass the predicate.
   */
  public async *filter<T extends IEntity = IEntity>(
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
   * @template T - The type of the entities, defaults to IEntity.
   * @param {number} total - The maximum number of entities to yield.
   * @param {(value: T) => boolean} [predicate] - Optional function to filter entities.
   * @returns {AsyncGenerator<T>} An async generator yielding up to `total` entities.
   */
  public async *take<T extends IEntity = IEntity>(
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

/**
 * Extends PersistBase to provide a persistent list structure with push/pop operations.
 * @template EntityName - The type of entity name, defaults to string.
 * @extends {PersistBase<EntityName>}
 */
export class PersistList<
  EntityName extends string = string
> extends PersistBase<EntityName> {
  /** @private Tracks the last used numeric key for the list, null until initialized */
  _lastCount: number | null = null;

  /**
   * Creates a new PersistList instance for managing a persistent list.
   * @param {EntityName} entityName - The name of the entity type (used as a subdirectory).
   * @param {string} [baseDir] - The base directory for storing list files (defaults to parent class).
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
   * Ensures sequential key generation even under concurrent calls.
   * @returns {Promise<string>} A promise resolving to the new key as a string.
   * @private
   */
  private [LIST_CREATE_KEY_SYMBOL] = queued(
    async (): Promise<string> => await LIST_CREATE_KEY_FN(this)
  ) as () => Promise<string>;

  /**
   * Retrieves the key of the last item in the list.
   * @returns {Promise<string | null>} A promise resolving to the last key or null if the list is empty.
   * @private
   */
  private [LIST_GET_LAST_KEY_SYMBOL] = async (): Promise<string | null> =>
    await LIST_GET_LAST_KEY_FN(this);

  /**
   * Queued function to remove and return the last item in the list.
   * Ensures atomic pop operations under concurrent calls.
   * @template T - The type of the entity, defaults to IEntity.
   * @returns {Promise<T | null>} A promise resolving to the removed item or null if the list is empty.
   * @private
   */
  private [LIST_POP_SYMBOL] = queued(
    async (): Promise<any | null> => await LIST_POP_FN(this)
  ) as <T extends IEntity = IEntity>() => Promise<T | null>;

  /**
   * Adds an entity to the end of the persistent list with a new unique key.
   * @template T - The type of the entity, defaults to IEntity.
   * @param {T} entity - The entity to add to the list.
   * @returns {Promise<void>} A promise that resolves when the entity is written.
   * @throws {Error} If writing to the file fails.
   */
  public async push<T extends IEntity = IEntity>(entity: T): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_LIST_METHOD_NAME_PUSH, {
        entityName: this.entityName,
      });
    return await this.writeValue(await this[LIST_CREATE_KEY_SYMBOL](), entity);
  }

  /**
   * Removes and returns the last entity from the persistent list.
   * @template T - The type of the entity, defaults to IEntity.
   * @returns {Promise<T | null>} A promise resolving to the removed entity or null if the list is empty.
   * @throws {Error} If reading or removing the entity fails.
   */
  public async pop<T extends IEntity = IEntity>(): Promise<T | null> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_LIST_METHOD_NAME_POP, {
        entityName: this.entityName,
      });
    return await this[LIST_POP_SYMBOL]();
  }
}

/**
 * Interface for data stored in active agent persistence.
 */
interface IPersistActiveAgentData {
  /** The name of the active agent */
  agentName: AgentName;
}

/**
 * Interface for data stored in navigation stack persistence.
 */
interface IPersistNavigationStackData {
  /** The stack of agent names representing navigation history */
  agentStack: AgentName[];
}

/**
 * Interface defining control methods for swarm persistence operations.
 */
interface IPersistSwarmControl {
  /**
   * Sets a custom persistence adapter for active agent storage.
   * @param {TPersistBaseCtor<SwarmName, IPersistActiveAgentData>} Ctor - The constructor for active agent persistence.
   */
  usePersistActiveAgentAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>
  ): void;

  /**
   * Sets a custom persistence adapter for navigation stack storage.
   * @param {TPersistBaseCtor<SwarmName, IPersistNavigationStackData>} Ctor - The constructor for navigation stack persistence.
   */
  usePersistNavigationStackAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>
  ): void;
}

/**
 * Utility class for managing swarm-related persistence (active agents and navigation stacks).
 * @implements {IPersistSwarmControl}
 */
export class PersistSwarmUtils implements IPersistSwarmControl {
  /** @private Default constructor for active agent persistence, defaults to PersistBase */
  private PersistActiveAgentFactory: TPersistBaseCtor<
    SwarmName,
    IPersistActiveAgentData
  > = PersistBase;

  /** @private Default constructor for navigation stack persistence, defaults to PersistBase */
  private PersistNavigationStackFactory: TPersistBaseCtor<
    SwarmName,
    IPersistNavigationStackData
  > = PersistBase;

  /**
   * Memoized function to create or retrieve storage for active agents.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {IPersistBase<IPersistActiveAgentData>} A persistence instance for active agents.
   * @private
   */
  private getActiveAgentStorage = memoize(
    ([swarmName]: [SwarmName]): string => `${swarmName}`,
    (swarmName: SwarmName): IPersistBase<IPersistActiveAgentData> =>
      new this.PersistActiveAgentFactory(
        swarmName,
        `./logs/data/_swarm_active_agent/`
      )
  );

  /**
   * Sets a custom constructor for active agent persistence.
   * @param {TPersistBaseCtor<SwarmName, IPersistActiveAgentData>} Ctor - The constructor to use.
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
   * Sets a custom constructor for navigation stack persistence.
   * @param {TPersistBaseCtor<SwarmName, IPersistNavigationStackData>} Ctor - The constructor to use.
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
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {IPersistBase<IPersistNavigationStackData>} A persistence instance for navigation stacks.
   * @private
   */
  private getNavigationStackStorage = memoize(
    ([swarmName]: [SwarmName]): string => `${swarmName}`,
    (swarmName: SwarmName): IPersistBase<IPersistNavigationStackData> =>
      new this.PersistNavigationStackFactory(
        swarmName,
        `./logs/data/_swarm_navigation_stack/`
      )
  );

  /**
   * Retrieves the active agent for a client in a swarm.
   * @param {string} clientId - The client identifier.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {AgentName} defaultAgent - The default agent name to return if none is set.
   * @returns {Promise<AgentName>} A promise resolving to the active agent name.
   * @throws {Error} If reading from storage fails.
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
    const isInitial = this.getActiveAgentStorage.has(swarmName);
    const activeAgentStorage = this.getActiveAgentStorage(swarmName);
    await activeAgentStorage.waitForInit(isInitial);
    if (await activeAgentStorage.hasValue(clientId)) {
      const { agentName } = await activeAgentStorage.readValue(clientId);
      return agentName;
    }
    return defaultAgent;
  };

  /**
   * Sets the active agent for a client in a swarm.
   * @param {string} clientId - The client identifier.
   * @param {AgentName} agentName - The name of the agent to set as active.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the active agent is written.
   * @throws {Error} If writing to storage fails.
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
    const isInitial = this.getActiveAgentStorage.has(swarmName);
    const activeAgentStorage = this.getActiveAgentStorage(swarmName);
    await activeAgentStorage.waitForInit(isInitial);
    await activeAgentStorage.writeValue(clientId, { agentName });
  };

  /**
   * Retrieves the navigation stack for a client in a swarm.
   * @param {string} clientId - The client identifier.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<AgentName[]>} A promise resolving to the navigation stack (array of agent names).
   * @throws {Error} If reading from storage fails.
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
    const isInitial = this.getNavigationStackStorage.has(swarmName);
    const navigationStackStorage = this.getNavigationStackStorage(swarmName);
    await navigationStackStorage.waitForInit(isInitial);
    if (await navigationStackStorage.hasValue(clientId)) {
      const { agentStack } = await navigationStackStorage.readValue(clientId);
      return agentStack;
    }
    return [];
  };

  /**
   * Sets the navigation stack for a client in a swarm.
   * @param {string} clientId - The client identifier.
   * @param {AgentName[]} agentStack - The navigation stack (array of agent names) to set.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {Promise<void>} A promise that resolves when the navigation stack is written.
   * @throws {Error} If writing to storage fails.
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
    const isInitial = this.getNavigationStackStorage.has(swarmName);
    const navigationStackStorage = this.getNavigationStackStorage(swarmName);
    await navigationStackStorage.waitForInit(isInitial);
    await navigationStackStorage.writeValue(clientId, { agentStack });
  };
}

/**
 * Singleton instance of PersistSwarmUtils for managing swarm persistence.
 * @type {PersistSwarmUtils}
 */
export const PersistSwarmAdapter = new PersistSwarmUtils();

/**
 * Exported singleton for swarm persistence operations, cast as the control interface.
 * @type {IPersistSwarmControl}
 */
export const PersistSwarm = PersistSwarmAdapter as IPersistSwarmControl;

/**
 * Interface for state data persistence.
 * @template T - The type of the state data, defaults to unknown.
 */
interface IPersistStateData<T = unknown> {
  /** The state data to persist */
  state: T;
}

/**
 * Interface defining control methods for state persistence operations.
 */
interface IPersistStateControl {
  /**
   * Sets a custom persistence adapter for state storage.
   * @param {TPersistBaseCtor<StorageName, IPersistStateData>} Ctor - The constructor for state persistence.
   */
  usePersistStateAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistStateData>
  ): void;
}

/**
 * Utility class for managing state persistence.
 * @implements {IPersistStateControl}
 */
export class PersistStateUtils implements IPersistStateControl {
  /** @private Default constructor for state persistence, defaults to PersistBase */
  private PersistStateFactory: TPersistBaseCtor<StateName, IPersistStateData> =
    PersistBase;

  /**
   * Memoized function to create or retrieve storage for a specific state.
   * @param {StateName} stateName - The name of the state.
   * @returns {IPersistBase<IPersistStateData>} A persistence instance for the state.
   * @private
   */
  private getStateStorage = memoize(
    ([stateName]: [StateName]): string => `${stateName}`,
    (stateName: StateName): IPersistBase<IPersistStateData> =>
      new this.PersistStateFactory(stateName, `./logs/data/state/`)
  );

  /**
   * Sets a custom constructor for state persistence.
   * @param {TPersistBaseCtor<StorageName, IPersistStateData>} Ctor - The constructor to use.
   */
  public usePersistStateAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistStateData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_STATE_UTILS_METHOD_NAME_USE_PERSIST_STATE_ADAPTER
      );
    this.PersistStateFactory = Ctor;
  }

  /**
   * Sets the state for a client under a specific state name.
   * @template T - The type of the state data, defaults to unknown.
   * @param {T} state - The state data to persist.
   * @param {string} clientId - The client identifier.
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<void>} A promise that resolves when the state is written.
   * @throws {Error} If writing to storage fails.
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
    const isInitial = this.getStateStorage.has(stateName);
    const stateStorage = this.getStateStorage(stateName);
    await stateStorage.waitForInit(isInitial);
    await stateStorage.writeValue(clientId, { state });
  };

  /**
   * Retrieves the state for a client under a specific state name.
   * @template T - The type of the state data, defaults to unknown.
   * @param {string} clientId - The client identifier.
   * @param {StateName} stateName - The name of the state.
   * @param {T} defaultState - The default state to return if none is set.
   * @returns {Promise<T>} A promise resolving to the state data.
   * @throws {Error} If reading from storage fails.
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
    const isInitial = this.getStateStorage.has(stateName);
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
 * Singleton instance of PersistStateUtils for managing state persistence.
 * @type {PersistStateUtils}
 */
export const PersistStateAdapter = new PersistStateUtils();

/**
 * Exported singleton for state persistence operations, cast as the control interface.
 * @type {IPersistStateControl}
 */
export const PersistState = PersistStateAdapter as IPersistStateControl;

/**
 * Interface for storage data persistence.
 * @template T - The type of storage data, defaults to IStorageData.
 */
interface IPersistStorageData<T extends IStorageData = IStorageData> {
  /** The array of storage data to persist */
  data: T[];
}

/**
 * Interface defining control methods for storage persistence operations.
 */
interface IPersistStorageControl {
  /**
   * Sets a custom persistence adapter for storage.
   * @param {TPersistBaseCtor<StorageName, IPersistStorageData>} Ctor - The constructor for storage persistence.
   */
  usePersistStorageAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>
  ): void;
}

/**
 * Utility class for managing storage persistence.
 * @implements {IPersistStorageControl}
 */
export class PersistStorageUtils implements IPersistStorageControl {
  /** @private Default constructor for storage persistence, defaults to PersistBase */
  private PersistStorageFactory: TPersistBaseCtor<
    StorageName,
    IPersistStorageData
  > = PersistBase;

  /**
   * Memoized function to create or retrieve storage for a specific storage name.
   * @param {StorageName} storageName - The name of the storage.
   * @returns {IPersistBase<IPersistStorageData>} A persistence instance for the storage.
   * @private
   */
  private getPersistStorage = memoize(
    ([storageName]: [StorageName]): string => `${storageName}`,
    (storageName: StorageName): IPersistBase<IPersistStorageData> =>
      new this.PersistStorageFactory(storageName, `./logs/data/storage/`)
  );

  /**
   * Sets a custom constructor for storage persistence.
   * @param {TPersistBaseCtor<StorageName, IPersistStorageData>} Ctor - The constructor to use.
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
   * Retrieves the data for a client from a specific storage.
   * @template T - The type of the storage data, defaults to IStorageData.
   * @param {string} clientId - The client identifier.
   * @param {StorageName} storageName - The name of the storage.
   * @param {T[]} defaultValue - The default value to return if no data is set.
   * @returns {Promise<T[]>} A promise resolving to the storage data array.
   * @throws {Error} If reading from storage fails.
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
    const isInitial = this.getPersistStorage.has(storageName);
    const persistStorage = this.getPersistStorage(storageName);
    await persistStorage.waitForInit(isInitial);
    if (await persistStorage.hasValue(clientId)) {
      const { data } = await persistStorage.readValue(clientId);
      return data as T[];
    }
    return defaultValue;
  };

  /**
   * Sets the data for a client in a specific storage.
   * @template T - The type of the storage data, defaults to IStorageData.
   * @param {T[]} data - The array of data to persist.
   * @param {string} clientId - The client identifier.
   * @param {StorageName} storageName - The name of the storage.
   * @returns {Promise<void>} A promise that resolves when the data is written.
   * @throws {Error} If writing to storage fails.
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
    const isInitial = this.getPersistStorage.has(storageName);
    const persistStorage = this.getPersistStorage(storageName);
    await persistStorage.waitForInit(isInitial);
    await persistStorage.writeValue(clientId, { data });
  };
}

/**
 * Singleton instance of PersistStorageUtils for managing storage persistence.
 * @type {PersistStorageUtils}
 */
export const PersistStorageAdapter = new PersistStorageUtils();

/**
 * Exported singleton for storage persistence operations, cast as the control interface.
 * @type {IPersistStorageControl}
 */
export const PersistStorage = PersistStorageAdapter as IPersistStorageControl;

interface IPersistMemoryData<T = unknown> {
  /** The state data to persist */
  data: T;
}

interface IPersistMemoryControl {
  usePersistMemoryAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistMemoryData>
  ): void;
}

export class PersistMemoryUtils implements IPersistMemoryControl {
  private PersistMemoryFactory: TPersistBaseCtor<
    SessionId,
    IPersistMemoryData
  > = PersistBase;

  private getMemoryStorage = memoize(
    ([clientId]: [SessionId]): string => `${clientId}`,
    (clientId: SessionId): IPersistBase<IPersistMemoryData> =>
      new this.PersistMemoryFactory(clientId, `./logs/data/memory/`)
  );

  public usePersistMemoryAdapter(
    Ctor: TPersistBaseCtor<SessionId, IPersistMemoryData>
  ): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(
        PERSIST_MEMORY_UTILS_METHOD_NAME_USE_PERSIST_MEMORY_ADAPTER
      );
    this.PersistMemoryFactory = Ctor;
  }

  public setMemory = async <T = unknown>(
    data: T,
    clientId: string
  ): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_MEMORY_UTILS_METHOD_NAME_SET_MEMORY, {
        clientId,
      });
    const isInitial = this.getMemoryStorage.has(clientId);
    const stateStorage = this.getMemoryStorage(clientId);
    await stateStorage.waitForInit(isInitial);
    await stateStorage.writeValue(clientId, { data });
  };

  public getMemory = async <T = unknown>(
    clientId: string,
    defaultState: T
  ): Promise<T> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(PERSIST_MEMORY_UTILS_METHOD_NAME_GET_MEMORY, {
        clientId,
      });
    const isInitial = this.getMemoryStorage.has(clientId);
    const stateStorage = this.getMemoryStorage(clientId);
    await stateStorage.waitForInit(isInitial);
    if (await stateStorage.hasValue(clientId)) {
      const { data } = await stateStorage.readValue(clientId);
      return data as T;
    }
    return defaultState;
  };

  public async dispose(clientId: string) {
    this.getMemoryStorage.clear(clientId);
  }
}

export const PersistMemoryAdapter = new PersistMemoryUtils();

export const PersistMemory = PersistMemoryAdapter as IPersistMemoryControl;
