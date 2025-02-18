import { EmbeddingName, IEmbeddingCallbacks, IEmbeddingSchema } from "./Embedding.interface";
import IHistory from "./History.interface";
import { ILogger } from "./Logger.interface";

type StorageId = string | number;

export interface IStorageData {
    id: StorageId;
}

export interface IStorageSchema<T extends IStorageData = IStorageData> {
  data: T[];
  createIndex(item: T): Promise<string>;
  embeddingName: EmbeddingName;
  callbacks?: IStorageCallbacks;
}

export interface IStorageCallbacks extends IEmbeddingCallbacks {
}

export interface IStorageParams<T extends IStorageData = IStorageData> extends Omit<IStorageSchema<T>, keyof {
    embeddingName: never;
}> {
  clientId: string;
  calculateSimilarity: IEmbeddingSchema["calculateSimilarity"];
  createEmbedding: IEmbeddingSchema["createEmbedding"];
  storageName: StorageName;
  logger: ILogger;
  history: IHistory;
}

export interface IStorage<T extends IStorageData = IStorageData> {
    take(search: string, total: number): Promise<T[]>;
    upsert(item: T): Promise<void>;
    remove(itemId: IStorageData["id"]): Promise<void>;
    get(itemId: IStorageData["id"]): Promise<T | null>;
    list(): Promise<T[]>;
    clear(): Promise<void>;
}

export type StorageName = string;
