import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";
import { ExecutionMode } from "./Session.interface";
import { IStorageCallbacks, IStorageSchema } from "./Storage.interface";

/**
 * Type representing an array of numbers as embeddings.
 */
export type Embeddings = number[];

/**
 * Interface representing an embedding schema.
 */
export interface IEmbedding extends IEmbeddingSchema {}

/**
 * Interface for embedding callbacks.
 */
export interface IEmbeddingCallbacks {
  /**
   * Callback for when an embedding is created.
   * @param text - The text used to create the embedding.
   * @param embeddings - The generated embeddings.
   * @param clientId - The client ID associated with the embedding.
   * @param embeddingName - The name of the embedding.
   */
  onCreate(text: string, embeddings: Embeddings, clientId: string, embeddingName: EmbeddingName): void;

  /**
   * Callback for when embeddings are compared.
   * @param text1 - The first text used in the comparison.
   * @param text2 - The second text used in the comparison.
   * @param similarity - The similarity score between the embeddings.
   * @param clientId - The client ID associated with the comparison.
   * @param embeddingName - The name of the embedding.
   */
  onCompare(
    text1: string,
    text2: string,
    similarity: number,
    clientId: string,
    embeddingName: EmbeddingName,
  ): void;
}

/**
 * Interface representing the schema for embeddings.
 */
export interface IEmbeddingSchema {
  /**
   * The name of the embedding.
   */
  embeddingName: EmbeddingName;

  /**
   * Creates an embedding from the given text.
   * @param text - The text to create the embedding from.
   * @returns A promise that resolves to the generated embeddings.
   */
  createEmbedding(text: string): Promise<Embeddings>;

  /**
   * Calculates the similarity between two embeddings.
   * @param a - The first embedding.
   * @param b - The second embedding.
   * @returns A promise that resolves to the similarity score.
   */
  calculateSimilarity(a: Embeddings, b: Embeddings): Promise<number>;

  /**
   * Optional callbacks for embedding events.
   */
  callbacks?: Partial<IEmbeddingCallbacks>;
}

/**
 * Type representing the name of an embedding.
 */
export type EmbeddingName = string;
