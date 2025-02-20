import { SortedArray } from "functools-kit";
import {
  EmbeddingName,
  IEmbeddingCallbacks,
  IEmbeddingSchema,
} from "./Embedding.interface";
import IHistory from "./History.interface";
import { ILogger } from "./Logger.interface";

type StorageId = string | number;

export interface IStorageData {
  id: StorageId;
}

export interface IStorageSchema<T extends IStorageData = IStorageData> {
  getData?: (clientId: string, storageName: StorageName) => Promise<T[]> | T[];
  createIndex(item: T): Promise<string> | string;
  embedding: EmbeddingName;
  storageName: StorageName;
  callbacks?: Partial<IStorageCallbacks<T>>;
}

export interface IStorageCallbacks<T extends IStorageData = IStorageData> {
  onUpdate: (items: T[], clientId: string, storageName: StorageName) => void;
  onSearch: (search: string, index: SortedArray<T>, clientId: string, storageName: StorageName) => void; 
}

export interface IStorageParams<T extends IStorageData = IStorageData>
  extends IStorageSchema<T>,
    Partial<IEmbeddingCallbacks> {
  clientId: string;
  calculateSimilarity: IEmbeddingSchema["calculateSimilarity"];
  createEmbedding: IEmbeddingSchema["createEmbedding"];
  storageName: StorageName;
  logger: ILogger;
}

export interface IStorage<T extends IStorageData = IStorageData> {
  take(search: string, total: number, score?: number): Promise<T[]>;
  upsert(item: T): Promise<void>;
  remove(itemId: IStorageData["id"]): Promise<void>;
  get(itemId: IStorageData["id"]): Promise<T | null>;
  list(filter?: (item: T) => boolean): Promise<T[]>;
  clear(): Promise<void>;
}

export type StorageName = string;
