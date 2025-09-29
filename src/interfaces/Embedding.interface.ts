import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";
import { ExecutionMode } from "./Session.interface";
import { IStorageCallbacks, IStorageSchema } from "./Storage.interface";

/**
 * Type representing an array of numbers as embeddings.
 * Used to encode text or data for similarity comparisons in storage or search operations.
 */
export type Embeddings = number[];

/**
 * Interface representing an embedding mechanism.
 * Extends the embedding schema to provide a complete embedding API.
 * @extends {IEmbeddingSchema}
 */
export interface IEmbedding extends IEmbeddingSchema {}

/**
 * Interface representing callbacks for embedding lifecycle events.
 * Provides hooks for creation and comparison of embeddings.
 */
export interface IEmbeddingCallbacks {
  /**
   * Callback triggered when an embedding is created.
   * Useful for logging or post-processing the generated embeddings.
   */
  onCreate(
    text: string,
    embeddings: Embeddings,
    clientId: string,
    embeddingName: EmbeddingName
  ): void;

  /**
   * Callback triggered when two embeddings are compared for similarity.
   * Useful for logging or analyzing similarity results.
   */
  onCompare(
    text1: string,
    text2: string,
    similarity: number,
    clientId: string,
    embeddingName: EmbeddingName
  ): void;
}

/**
 * Interface representing the schema for configuring an embedding mechanism.
 * Defines how embeddings are created and compared within the swarm.
 */
export interface IEmbeddingSchema {
  /** Optional flag to enable serialization of navigation stack and active agent state to persistent storage (e.g., hard drive). */
  persist?: boolean;

  /** The unique name of the embedding mechanism within the swarm. */
  embeddingName: EmbeddingName;

  /**
   * Creates an embedding from the provided text.
   * Typically used for indexing or search operations in storage.
   * @throws {Error} If embedding creation fails (e.g., due to invalid text or model errors).
   */
  createEmbedding(text: string, embeddingName: EmbeddingName): Promise<Embeddings>;

  /**
   * Calculates the similarity between two embeddings.
   * Commonly used for search or ranking operations (e.g., cosine similarity).
   * @throws {Error} If similarity calculation fails (e.g., due to invalid embeddings or computation errors).
   */
  calculateSimilarity(a: Embeddings, b: Embeddings): Promise<number>;

  /**
   * Stores an embedding vector for a specific string hash, persisting it for future retrieval.
   * Used to cache computed embeddings to avoid redundant processing.
   * @throws {Error} If writing to storage fails (e.g., permissions or disk space).
   */
  writeEmbeddingCache?: (
    embeddings: number[],
    embeddingName: EmbeddingName,
    stringHash: string
  ) => Promise<void> | void;

  /**
   * Retrieves the embedding vector for a specific string hash, returning null if not found.
   * Used to check if a precomputed embedding exists in the cache.
   * @throws {Error} If reading from storage fails (e.g., file corruption).
   */
  readEmbeddingCache?: (
    embeddingName: EmbeddingName,
    stringHash: string
  ) => Promise<number[] | null> | number[] | null;

  /** Optional partial set of callbacks for embedding events, allowing customization of creation and comparison. */
  callbacks?: Partial<IEmbeddingCallbacks>;
}

/**
 * Type representing the unique name of an embedding mechanism within the swarm.
 * Used to identify and reference specific embedding implementations.
 */
export type EmbeddingName = string;
