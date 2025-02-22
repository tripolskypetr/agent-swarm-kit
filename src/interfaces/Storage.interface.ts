import { SortedArray } from "functools-kit";
import {
  EmbeddingName,
  IEmbeddingCallbacks,
  IEmbeddingSchema,
} from "./Embedding.interface";
import { ILogger } from "./Logger.interface";

type StorageId = string | number;

/**
 * Interface representing the data stored in the storage.
 */
export interface IStorageData {
  id: StorageId;
}

/**
 * Interface representing the schema of the storage.
 * @template T - Type of the storage data.
 */
export interface IStorageSchema<T extends IStorageData = IStorageData> {

  /**
   * All agents will share the same ClientStorage instance
   */
  shared?: boolean;

  /**
   * Function to get data from the storage.
   * @param clientId - The client ID.
   * @param storageName - The name of the storage.
   * @returns A promise that resolves to an array of storage data or an array of storage data.
   */
  getData?: (clientId: string, storageName: StorageName) => Promise<T[]> | T[];

  /**
   * Function to create an index for an item.
   * @param item - The item to index.
   * @returns A promise that resolves to a string or a string.
   */
  createIndex(item: T): Promise<string> | string;

  /**
   * The name of the embedding.
   */
  embedding: EmbeddingName;

  /**
   * The name of the storage.
   */
  storageName: StorageName;

  /**
   * Optional callbacks for storage events.
   */
  callbacks?: Partial<IStorageCallbacks<T>>;
}

/**
 * Interface representing the callbacks for storage events.
 * @template T - Type of the storage data.
 */
export interface IStorageCallbacks<T extends IStorageData = IStorageData> {
  /**
   * Callback function for update events.
   * @param items - The updated items.
   * @param clientId - The client ID.
   * @param storageName - The name of the storage.
   */
  onUpdate: (items: T[], clientId: string, storageName: StorageName) => void;

  /**
   * Callback function for search events.
   * @param search - The search query.
   * @param index - The sorted array of storage data.
   * @param clientId - The client ID.
   * @param storageName - The name of the storage.
   */
  onSearch: (
    search: string,
    index: SortedArray<T>,
    clientId: string,
    storageName: StorageName
  ) => void;
}

/**
 * Interface representing the parameters for storage.
 * @template T - Type of the storage data.
 */
export interface IStorageParams<T extends IStorageData = IStorageData>
  extends IStorageSchema<T>,
    Partial<IEmbeddingCallbacks> {
  /**
   * The client ID.
   */
  clientId: string;

  /**
   * Function to calculate similarity.
   */
  calculateSimilarity: IEmbeddingSchema["calculateSimilarity"];

  /**
   * Function to create an embedding.
   */
  createEmbedding: IEmbeddingSchema["createEmbedding"];

  /**
   * The name of the storage.
   */
  storageName: StorageName;

  /**
   * Logger instance.
   */
  logger: ILogger;
}

/**
 * Interface representing the storage.
 * @template T - Type of the storage data.
 */
export interface IStorage<T extends IStorageData = IStorageData> {
  /**
   * Function to take items from the storage.
   * @param search - The search query.
   * @param total - The total number of items to take.
   * @param score - Optional score parameter.
   * @returns A promise that resolves to an array of storage data.
   */
  take(search: string, total: number, score?: number): Promise<T[]>;

  /**
   * Function to upsert an item in the storage.
   * @param item - The item to upsert.
   * @returns A promise that resolves when the operation is complete.
   */
  upsert(item: T): Promise<void>;

  /**
   * Function to remove an item from the storage.
   * @param itemId - The ID of the item to remove.
   * @returns A promise that resolves when the operation is complete.
   */
  remove(itemId: IStorageData["id"]): Promise<void>;

  /**
   * Function to get an item from the storage.
   * @param itemId - The ID of the item to get.
   * @returns A promise that resolves to the item or null if not found.
   */
  get(itemId: IStorageData["id"]): Promise<T | null>;

  /**
   * Function to list items from the storage.
   * @param filter - Optional filter function.
   * @returns A promise that resolves to an array of storage data.
   */
  list(filter?: (item: T) => boolean): Promise<T[]>;

  /**
   * Function to clear the storage.
   * @returns A promise that resolves when the operation is complete.
   */
  clear(): Promise<void>;
}

/**
 * Type representing the name of the storage.
 */
export type StorageName = string;
