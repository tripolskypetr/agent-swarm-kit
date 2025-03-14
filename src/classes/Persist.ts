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

/** Identifier for an entity, can be string or number */
type EntityId = string | number;

/** Base interface for all persistent entities */
interface IEntity {}

/** Symbol for the wait-for-initialization operation */
const BASE_WAIT_FOR_INIT_SYMBOL = Symbol("wait-for-init");

/** Symbol for creating a new key in a persistent list */
const LIST_CREATE_KEY_SYMBOL = Symbol("create-key");
/** Symbol for getting the last key in a persistent list */
const LIST_GET_LAST_KEY_SYMBOL = Symbol("get-last-key");
/** Symbol for popping the last item from a persistent list */
const LIST_POP_SYMBOL = Symbol("pop");

// Logging method names for PersistBase
const PERSIST_BASE_METHOD_NAME_CTOR = "PersistBase.CTOR";
const PERSIST_BASE_METHOD_NAME_WAIT_FOR_INIT = "PersistBase.waitForInit";
const PERSIST_BASE_METHOD_NAME_READ_VALUE = "PersistBase.readValue";
const PERSIST_BASE_METHOD_NAME_WRITE_VALUE = "PersistBase.writeValue";
const PERSIST_BASE_METHOD_NAME_HAS_VALUE = "PersistBase.hasValue";
const PERSIST_BASE_METHOD_NAME_REMOVE_VALUE = "PersistBase.removeValue";
const PERSIST_BASE_METHOD_NAME_REMOVE_ALL = "PersistBase.removeAll";
const PERSIST_BASE_METHOD_NAME_VALUES = "PersistBase.values";
const PERSIST_BASE_METHOD_NAME_KEYS = "PersistBase.keys";

// Logging method names for PersistList
const PERSIST_LIST_METHOD_NAME_CTOR = "PersistList.CTOR";
const PERSIST_LIST_METHOD_NAME_PUSH = "PersistList.push";
const PERSIST_LIST_METHOD_NAME_POP = "PersistList.pop";

// Logging method names for PersistSwarmUtils
const PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_ACTIVE_AGENT_ADAPTER =
  "PersistSwarmUtils.usePersistActiveAgentAdapter";
const PERSIST_SWARM_UTILS_METHOD_NAME_USE_PERSIST_NAVIGATION_STACK_ADAPTER =
  "PersistSwarmUtils.usePersistNavigationStackAdapter";
const PERSIST_SWARM_UTILS_METHOD_NAME_GET_ACTIVE_AGENT =
  "PersistSwarmUtils.getActiveAgent";
const PERSIST_SWARM_UTILS_METHOD_NAME_SET_ACTIVE_AGENT =
  "PersistSwarmUtils.setActiveAgent";
const PERSIST_SWARM_UTILS_METHOD_NAME_GET_NAVIGATION_STACK =
  "PersistSwarmUtils.getNavigationStack";
const PERSIST_SWARM_UTILS_METHOD_NAME_SET_NAVIGATION_STACK =
  "PersistSwarmUtils.setNavigationStack";

// Logging method names for PersistStateUtils
const PERSIST_STATE_UTILS_METHOD_NAME_USE_PERSIST_STATE_ADAPTER =
  "PersistStateUtils.usePersistStateAdapter";
const PERSIST_STATE_UTILS_METHOD_NAME_SET_STATE = "PersistStateUtils.setState";
const PERSIST_STATE_UTILS_METHOD_NAME_GET_STATE = "PersistStateUtils.getState";

// Logging method names for PersistStorageUtils
const PERSIST_STORAGE_UTILS_METHOD_NAME_USE_PERSIST_STORAGE_ADAPTER =
  "PersistStorageUtils.usePersistStorageAdapter";
const PERSIST_STORAGE_UTILS_METHOD_NAME_GET_DATA =
  "PersistStorageUtils.getData";
const PERSIST_STORAGE_UTILS_METHOD_NAME_SET_DATA =
  "PersistStorageUtils.setData";

// Logging method names for the functions
const BASE_WAIT_FOR_INIT_FN_METHOD_NAME = "PersistBase.waitForInitFn";
const LIST_CREATE_KEY_FN_METHOD_NAME = "PersistList.createKeyFn";
const LIST_POP_FN_METHOD_NAME = "PersistList.popFn";
const LIST_GET_LAST_KEY_FN_METHOD_NAME = "PersistList.getLastKeyFn";

/**
 * Interface for PersistBase
 * @template Entity - The type of entity, defaults to IEntity
 */
export interface IPersistBase<Entity extends IEntity = IEntity> {
  waitForInit(initial: boolean): Promise<void>;
  readValue(entityId: EntityId): Promise<Entity>;
  hasValue(entityId: EntityId): Promise<boolean>;
  writeValue(entityId: EntityId, entity: Entity): Promise<void>;
}

/**
 * Type definition for PersistBase constructor
 * @template EntityName - The type of entity name, defaults to string
 * @template Entity - The type of entity, defaults to IEntity
 */
export type TPersistBaseCtor<
  EntityName extends string = string,
  Entity extends IEntity = IEntity
> = new (entityName: EntityName, baseDir: string) => IPersistBase<Entity>;

/**
 * Wait for storage initialization
 * @param self - The PersistBase instance
 * @returns A Promise that resolves when initialization is complete
 */
const BASE_WAIT_FOR_INIT_FN = async (self: PersistBase) => {
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
 * Creates a new key for a list item
 * @param self - The PersistList instance
 * @returns A Promise resolving to a string key
 */
const LIST_CREATE_KEY_FN = async (self: PersistList) => {
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
 * Removes and returns the last item in the list
 * @param self - The PersistList instance
 * @returns A Promise resolving to the removed item or null if list is empty
 */
const LIST_POP_FN = async (self: PersistList) => {
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
 * Gets the key of the last item in the list
 * @param self - The PersistList instance
 * @returns A Promise resolving to the last key or null if list is empty
 */
const LIST_GET_LAST_KEY_FN = async (self: PersistList) => {
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
 * Base class for persistent storage of entities in a file system
 * @template EntityName - The type of entity name, defaults to string
 */
export class PersistBase<EntityName extends string = string>
  implements IPersistBase
{
  /** The directory path where entity files are stored */
  _directory: string;

  /**
   * Creates a new PersistBase instance
   * @param entityName - The name of the entity type
   * @param baseDir - The base directory for storing entity files
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
   * Gets the file path for an entity
   * @param entityId - The ID of the entity
   * @returns The full file path for the entity
   */
  _getFilePath(entityId: EntityId) {
    return join(this.baseDir, this.entityName, `${entityId}.json`);
  }

  /**
   * Initializes the storage directory
   * @returns A Promise that resolves when initialization is complete
   */
  private [BASE_WAIT_FOR_INIT_SYMBOL] = singleshot(
    async () => await BASE_WAIT_FOR_INIT_FN(this)
  );

  /**
   * Waits for initialization to complete
   * @param initial - Whether this is the initial initialization
   * @returns A Promise that resolves when initialization is complete
   */
  public async waitForInit(initial: boolean) {
    await this[BASE_WAIT_FOR_INIT_SYMBOL]();
  }

  /**
   * Gets the count of entities in the storage
   * @returns A Promise resolving to the number of entities
   */
  public async getCount(): Promise<number> {
    const files = await fs.readdir(this._directory);
    const { length } = files.filter((file) => file.endsWith(".json"));
    return length;
  }

  /**
   * Reads an entity from storage
   * @template T - The type of the entity
   * @param entityId - The ID of the entity to read
   * @returns A Promise resolving to the entity
   * @throws Error if the entity is not found or reading fails
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
    } catch (error) {
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
   * Checks if an entity exists in storage
   * @param entityId - The ID of the entity to check
   * @returns A Promise resolving to true if the entity exists, false otherwise
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
    } catch (error) {
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
   * Writes an entity to storage
   * @template T - The type of the entity
   * @param entityId - The ID of the entity to write
   * @param entity - The entity data to write
   * @returns A Promise that resolves when writing is complete
   * @throws Error if writing fails
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
   * Removes an entity from storage
   * @param entityId - The ID of the entity to remove
   * @returns A Promise that resolves when removal is complete
   * @throws Error if the entity is not found or removal fails
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
        `Failed to remove entity ${this.entityName}:${entityId}: ${error.message}`
      );
    }
  }

  /**
   * Removes all entities from storage
   * @returns A Promise that resolves when all entities are removed
   * @throws Error if removal fails
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
        await fs.unlink(file);
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
   * Iterates over all entities in storage
   * @template T - The type of the entities
   * @returns An AsyncGenerator yielding entities
   * @throws Error if reading fails
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
   * Iterates over all entity IDs in storage
   * @returns An AsyncGenerator yielding entity IDs
   * @throws Error if reading fails
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
   * Implements the Symbol.asyncIterator protocol
   * @returns An AsyncIterableIterator of entities
   */
  public async *[Symbol.asyncIterator](): AsyncIterableIterator<any> {
    for await (const entity of this.values()) {
      yield entity;
    }
  }

  /**
   * Filters entities based on a predicate
   * @template T - The type of the entities
   * @param predicate - A function to test each entity
   * @returns An AsyncGenerator yielding entities that pass the predicate
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
   * Takes a limited number of entities, optionally filtered
   * @template T - The type of the entities
   * @param total - The maximum number of entities to take
   * @param predicate - Optional function to test each entity
   * @returns An AsyncGenerator yielding up to total entities
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
 * Class for persistent storage of entities in a list structure
 * @template EntityName - The type of entity name, defaults to string
 * @extends PersistBase<EntityName>
 */
export class PersistList<
  EntityName extends string = string
> extends PersistBase<EntityName> {
  /** Tracks the last used numeric key */
  _lastCount: number | null = null;

  constructor(entityName: EntityName, baseDir?: string) {
    super(entityName, baseDir);
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_LIST_METHOD_NAME_CTOR, {
        entityName: this.entityName,
        baseDir,
      });
  }

  /**
   * Creates a new unique key for a list item
   * @returns A Promise resolving to a string key
   */
  private [LIST_CREATE_KEY_SYMBOL] = queued(
    async () => await LIST_CREATE_KEY_FN(this)
  ) as () => Promise<string>;

  /**
   * Gets the key of the last item in the list
   * @returns A Promise resolving to the last key or null if list is empty
   */
  private [LIST_GET_LAST_KEY_SYMBOL] = async () =>
    await LIST_GET_LAST_KEY_FN(this);

  /**
   * Removes and returns the last item in the list
   * @template T - The type of the entity
   * @returns A Promise resolving to the removed item or null if list is empty
   */
  private [LIST_POP_SYMBOL] = queued(async () => await LIST_POP_FN(this)) as <
    T extends IEntity = IEntity
  >() => Promise<T | null>;

  /**
   * Adds an entity to the end of the list
   * @template T - The type of the entity
   * @param entity - The entity to add
   * @returns A Promise that resolves when the entity is added
   */
  public async push<T extends IEntity = IEntity>(entity: T): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(PERSIST_LIST_METHOD_NAME_PUSH, {
        entityName: this.entityName,
      });
    return await this.writeValue(await this[LIST_CREATE_KEY_SYMBOL](), entity);
  }

  /**
   * Removes and returns the last entity in the list
   * @template T - The type of the entity
   * @returns A Promise resolving to the removed entity or null if list is empty
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
 * Interface for data stored in active agent persistence
 */
interface IPersistActiveAgentData {
  agentName: AgentName;
}

/**
 * Interface for data stored in navigation stack persistence
 */
interface IPersistNavigationStackData {
  agentStack: AgentName[];
}

/**
 * Interface for swarm control persistence operations
 */
interface IPersistSwarmControl {
  usePersistActiveAgentAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistActiveAgentData>
  ): void;
  usePersistNavigationStackAdapter(
    Ctor: TPersistBaseCtor<SwarmName, IPersistNavigationStackData>
  ): void;
}

/**
 * Utility class for managing swarm-related persistence
 */
export class PersistSwarmUtils implements IPersistSwarmControl {
  private PersistActiveAgentFactory: TPersistBaseCtor<
    SwarmName,
    IPersistActiveAgentData
  > = PersistBase;
  private PersistNavigationStackFactory: TPersistBaseCtor<
    SwarmName,
    IPersistNavigationStackData
  > = PersistBase;

  /**
   * Memoized function to get storage for active agents
   * @param swarmName - The name of the swarm
   * @returns A PersistBase instance for the active agent storage
   */
  private getActiveAgentStorage = memoize(
    ([swarmName]) => `${swarmName}`,
    (swarmName: SwarmName) =>
      new this.PersistActiveAgentFactory(
        swarmName,
        `./logs/data/_swarm_active_agent/`
      )
  );

  /**
   * Sets the factory for active agent persistence
   * @param Ctor - The constructor for active agent persistence
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
   * Sets the factory for navigation stack persistence
   * @param Ctor - The constructor for navigation stack persistence
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
   * Memoized function to get storage for navigation stacks
   * @param swarmName - The name of the swarm
   * @returns A PersistBase instance for the navigation stack storage
   */
  private getNavigationStackStorage = memoize(
    ([swarmName]) => `${swarmName}`,
    (swarmName: SwarmName) =>
      new this.PersistNavigationStackFactory(
        swarmName,
        `./logs/data/_swarm_navigation_stack/`
      )
  );

  /**
   * Gets the active agent for a client in a swarm
   * @param clientId - The client identifier
   * @param swarmName - The name of the swarm
   * @param defaultAgent - The default agent to return if no active agent is set
   * @returns A Promise resolving to the active agent name
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
   * Sets the active agent for a client in a swarm
   * @param clientId - The client identifier
   * @param agentName - The name of the agent to set as active
   * @param swarmName - The name of the swarm
   * @returns A Promise that resolves when the active agent is set
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
   * Gets the navigation stack for a client in a swarm
   * @param clientId - The client identifier
   * @param swarmName - The name of the swarm
   * @returns A Promise resolving to the navigation stack (array of agent names)
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
   * Sets the navigation stack for a client in a swarm
   * @param clientId - The client identifier
   * @param agentStack - The navigation stack (array of agent names)
   * @param swarmName - The name of the swarm
   * @returns A Promise that resolves when the navigation stack is set
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
 * Singleton instance of PersistSwarmUtils for managing swarm persistence
 */
export const PersistSwarmAdapter = new PersistSwarmUtils();

/**
 * Exported singleton for swarm persistence operations
 */
export const PersistSwarm = PersistSwarmAdapter as IPersistSwarmControl;

/**
 * Interface for state data persistence
 * @template T - The type of the state
 */
interface IPersistStateData<T = unknown> {
  state: T;
}

/**
 * Interface for state persistence control operations
 */
interface IPersistStateControl {
  usePersistStateAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistStateData>
  ): void;
}

/**
 * Utility class for managing state persistence
 */
export class PersistStateUtils implements IPersistStateControl {
  private PersistStateFactory: TPersistBaseCtor<StateName, IPersistStateData> =
    PersistBase;

  /**
   * Memoized function to get storage for a specific state
   * @param stateName - The name of the state
   * @returns A PersistBase instance for the state storage
   */
  private getStateStorage = memoize(
    ([stateName]) => `${stateName}`,
    (stateName: StateName) =>
      new this.PersistStateFactory(stateName, `./logs/data/state/`)
  );

  /**
   * Sets the factory for state persistence
   * @param Ctor - The constructor for state persistence
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
   * Sets the state for a client
   * @template T - The type of the state
   * @param state - The state data to set
   * @param clientId - The client identifier
   * @param stateName - The name of the state
   * @returns A Promise that resolves when the state is set
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
   * Gets the state for a client
   * @template T - The type of the state
   * @param clientId - The client identifier
   * @param stateName - The name of the state
   * @param defaultState - The default state to return if no state is set
   * @returns A Promise resolving to the state data
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
 * Singleton instance of PersistStateUtils for managing state persistence
 */
export const PersistStateAdapter = new PersistStateUtils();

/**
 * Exported singleton for state persistence operations
 */
export const PersistState = PersistStateAdapter as IPersistStateControl;

/**
 * Interface for storage data persistence
 * @template T - The type of storage data
 */
interface IPersistStorageData<T extends IStorageData = IStorageData> {
  data: T[];
}

/**
 * Interface for storage persistence control operations
 */
interface IPersistStorageControl {
  usePersistStorageAdapter(
    Ctor: TPersistBaseCtor<StorageName, IPersistStorageData>
  ): void;
}

/**
 * Utility class for managing storage persistence
 */
export class PersistStorageUtils implements IPersistStorageControl {
  private PersistStorageFactory: TPersistBaseCtor<
    StorageName,
    IPersistStorageData
  > = PersistBase;

  /**
   * Memoized function to get storage for a specific storage name
   * @param storageName - The name of the storage
   * @returns A PersistBase instance for the storage
   */
  private getPersistStorage = memoize(
    ([storageName]) => `${storageName}`,
    (storageName: StorageName) =>
      new this.PersistStorageFactory(storageName, `./logs/data/storage/`)
  );

  /**
   * Sets the factory for storage persistence
   * @param Ctor - The constructor for storage persistence
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
   * Gets the data for a client from a specific storage
   * @template T - The type of the storage data
   * @param clientId - The client identifier
   * @param storageName - The name of the storage
   * @param defaultValue - The default value to return if no data is set
   * @returns A Promise resolving to the storage data
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
   * Sets the data for a client in a specific storage
   * @template T - The type of the storage data
   * @param data - The data to set
   * @param clientId - The client identifier
   * @param storageName - The name of the storage
   * @returns A Promise that resolves when the data is set
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
 * Singleton instance of PersistStorageUtils for managing storage persistence
 */
export const PersistStorageAdapter = new PersistStorageUtils();

/**
 * Exported singleton for storage persistence operations
 */
export const PersistStorage = PersistStorageAdapter as IPersistStorageControl;
