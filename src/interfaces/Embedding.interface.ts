import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";
import { ExecutionMode } from "./Session.interface";
import { IStorageCallbacks, IStorageSchema } from "./Storage.interface";

export type Embeddings = number[];

export interface IEmbedding extends IEmbeddingSchema {}

export interface IEmbeddingCallbacks {
  onCreate(text: string, embeddings: Embeddings, clientId: string, embeddingName: EmbeddingName): void;
  onCompare(
    text1: string,
    text2: string,
    similarity: number,
    clientId: string,
    embeddingName: EmbeddingName,
  ): void;
}

export interface IEmbeddingSchema {
  embeddingName: EmbeddingName;
  createEmbedding(text: string): Promise<Embeddings>;
  calculateSimilarity(a: Embeddings, b: Embeddings): Promise<number>;
  callbacks?: Partial<IEmbeddingCallbacks>;
}

export type EmbeddingName = string;
