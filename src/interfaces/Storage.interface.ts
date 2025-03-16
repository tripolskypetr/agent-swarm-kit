import { SortedArray } from "functools-kit";
import {
  EmbeddingName,
  IEmbeddingCallbacks,
  IEmbeddingSchema,
} from "./Embedding.interface";
import { ILogger } from "./Logger.interface";
import { IBus } from "./Bus.interface";

/**
 * Type representing the unique identifier for storage items.
 * @typedef {string | number} StorageId
 */
type StorageId = string | number;

/**
 * Interface representing the data structure stored in the storage.
 * Defines the minimum required properties for storage items.
 */
export interface IStorageData {
  /** The unique identifier for the storage item, used for retrieval and removal. */
  id: StorageId;
}

/**
 * Interface representing the schema for storage configuration.
 * Defines how storage behaves, including persistence, indexing, and data access.
 * @template T - The type of the storage data, defaults to IStorageData.
 */
export interface IStorageSchema<T extends IStorageData = IStorageData> {
  /** Optional flag to enable serialization of storage data to persistent storage (e.g., hard drive). */
  persist?: boolean;

  /** Optional description for documentation purposes, aiding in storage usage understanding. */
  docDescription?: string;

  /** Optional flag indicating whether the storage instance is shared across all agents for a client. */
  shared?: boolean;

  /**
   * Optional function to retrieve data from the storage, overriding default behavior.
   * @param {string} clientId - The unique ID of the client requesting the data.
   * @param {StorageName} storageName - The unique name of the storage.
   * @param {T[]} defaultValue - The default data to return if no data is found.
   * @returns {Promise<T[]> | T[]} The stored data, synchronously or asynchronously.
   */
  getData?: (
    clientId: string,
    storageName: StorageName,
    defaultValue: T[]
  ) => Promise<T[]> | T[];

  /**
   * Optional function to persist storage data to the hard drive, overriding default behavior.
   * @param {T[]} data - The data to persist.
   * @param {string} clientId - The unique ID of the client updating the storage.
   * @param {StorageName} storageName - The unique name of the storage.
   * @returns {Promise<void> | void} A promise that resolves when data is persisted, or void if synchronous.
   * @throws {Error} If persistence fails (e.g., due to disk errors).
   */
  setData?: (
    data: T[],
    clientId: string,
    storageName: StorageName
  ) => Promise<void> | void;

  /**
   * Function to generate an index for a storage item, used for search and retrieval.
   * @param {T} item - The storage item to index.
   * @returns {Promise<string> | string} The index string for the item, synchronously or asynchronously.
   */
  createIndex(item: T): Promise<string> | string;

  /** The name of the embedding mechanism used for indexing and searching storage data. */
  embedding: EmbeddingName;

  /** The unique name of the storage within the swarm. */
  storageName: StorageName;

  /** Optional partial set of lifecycle callbacks for storage events, allowing customization. */
  callbacks?: Partial<IStorageCallbacks<T>>;

  /**
   * Optional function to provide the default data for the storage, resolved in persistence logic.
   * @param {string} clientId - The unique ID of the client requesting the default data.
   * @param {StorageName} storageName - The unique name of the storage.
   * @returns {Promise<T[]> | T[]} The default data array, synchronously or asynchronously.
   */
  getDefaultData?: (clientId: string, storageName: StorageName) => Promise<T[]> | T[];
}

/**
 * Interface representing callbacks for storage lifecycle and operational events.
 * Provides hooks for updates, searches, initialization, and disposal.
 * @template T - The type of the storage data, defaults to IStorageData.
 */
export interface IStorageCallbacks<T extends IStorageData = IStorageData> {
  /**
   * Callback triggered when storage data is updated (e.g., via upsert or remove).
   * Useful for logging or synchronizing state.
   * @param {T[]} items - The updated array of storage items.
   * @param {string} clientId - The unique ID of the client associated with the storage.
   * @param {StorageName} storageName - The unique name of the storage.
   */
  onUpdate: (items: T[], clientId: string, storageName: StorageName) => void;

  /**
   * Callback triggered during a search operation on the storage.
   * @param {string} search - The search query used to filter items.
   * @param {SortedArray<T>} index - The sorted array of storage items based on the search.
   * @param {string} clientId - The unique ID of the client performing the search.
   * @param {StorageName} storageName - The unique name of the storage.
   */
  onSearch: (
    search: string,
    index: SortedArray<T>,
    clientId: string,
    storageName: StorageName
  ) => void;

  /**
   * Callback triggered when the storage is initialized.
   * Useful for setup or logging.
   * @param {string} clientId - The unique ID of the client associated with the storage.
   * @param {StorageName} storageName - The unique name of the storage.
   */
  onInit: (clientId: string, storageName: StorageName) => void;

  /**
   * Callback triggered when the storage is disposed of.
   * Useful for cleanup or logging.
   * @param {string} clientId - The unique ID of the client associated with the storage.
   * @param {StorageName} storageName - The unique name of the storage.
   */
  onDispose: (clientId: string, storageName: StorageName) => void;
}

/**
 * Interface representing the runtime parameters for storage management.
 * Extends the storage schema with client-specific and embedding-related dependencies.
 * @template T - The type of the storage data, defaults to IStorageData.
 * @extends {IStorageSchema<T>}
 * @extends {Partial<IEmbeddingCallbacks>}
 */
export interface IStorageParams<T extends IStorageData = IStorageData>
  extends IStorageSchema<T>,
    Partial<IEmbeddingCallbacks> {
  /** The unique ID of the client associated with the storage instance. */
  clientId: string;

  /**
   * Function to calculate similarity between embeddings, inherited from the embedding schema.
   * Used for search operations.
   */
  calculateSimilarity: IEmbeddingSchema["calculateSimilarity"];

  /**
   * Function to create an embedding for storage items, inherited from the embedding schema.
   * Used for indexing.
   */
  createEmbedding: IEmbeddingSchema["createEmbedding"];

  /** The unique name of the storage within the swarm (redundant with schema but included for clarity). */
  storageName: StorageName;

  /** The logger instance for recording storage-related activity and errors. */
  logger: ILogger;

  /** The bus instance for event communication within the swarm. */
  bus: IBus;
}

/**
 * Interface representing the runtime storage management API.
 * Provides methods to manipulate and query storage data.
 * @template T - The type of the storage data, defaults to IStorageData.
 */
export interface IStorage<T extends IStorageData = IStorageData> {
  /**
   * Retrieves a specified number of items from the storage based on a search query.
   * Uses embeddings for similarity-based retrieval.
   * @param {string} search - The search query to filter items.
   * @param {number} total - The maximum number of items to retrieve.
   * @param {number} [score] - Optional similarity score threshold for filtering items.
   * @returns {Promise<T[]>} A promise resolving to an array of matching storage items.
   * @throws {Error} If retrieval fails (e.g., due to embedding issues or invalid query).
   */
  take(search: string, total: number, score?: number): Promise<T[]>;

  /**
   * Inserts or updates an item in the storage.
   * Updates the index and persists data if configured.
   * @param {T} item - The item to upsert into the storage.
   * @returns {Promise<void>} A promise that resolves when the upsert operation is complete.
   * @throws {Error} If upsert fails (e.g., due to persistence issues or invalid item).
   */
  upsert(item: T): Promise<void>;

  /**
   * Removes an item from the storage by its ID.
   * Updates the index and persists changes if configured.
   * @param {IStorageData["id"]} itemId - The ID of the item to remove.
   * @returns {Promise<void>} A promise that resolves when the removal operation is complete.
   * @throws {Error} If removal fails (e.g., due to persistence issues or invalid ID).
   */
  remove(itemId: IStorageData["id"]): Promise<void>;

  /**
   * Retrieves an item from the storage by its ID.
   * @param {IStorageData["id"]} itemId - The ID of the item to retrieve.
   * @returns {Promise<T | null>} A promise resolving to the item if found, or null if not found.
   * @throws {Error} If retrieval fails (e.g., due to internal errors).
   */
  get(itemId: IStorageData["id"]): Promise<T | null>;

  /**
   * Lists all items in the storage, optionally filtered by a predicate.
   * @param {(item: T) => boolean} [filter] - Optional function to filter items; only items returning true are included.
   * @returns {Promise<T[]>} A promise resolving to an array of storage items.
   * @throws {Error} If listing fails (e.g., due to persistence issues).
   */
  list(filter?: (item: T) => boolean): Promise<T[]>;

  /**
   * Clears all items from the storage, resetting it to an empty state.
   * Persists changes if configured.
   * @returns {Promise<void>} A promise that resolves when the clear operation is complete.
   * @throws {Error} If clearing fails (e.g., due to persistence issues).
   */
  clear(): Promise<void>;
}

/**
 * Type representing the unique name of a storage within the swarm.
 * @typedef {string} StorageName
 */
export type StorageName = string;
