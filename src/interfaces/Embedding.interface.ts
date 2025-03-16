import { IModelMessage } from "../model/ModelMessage.model";
import { ITool } from "../model/Tool.model";
import { AgentName } from "./Agent.interface";
import { ExecutionMode } from "./Session.interface";
import { IStorageCallbacks, IStorageSchema } from "./Storage.interface";

/**
 * Type representing an array of numbers as embeddings.
 * Used to encode text or data for similarity comparisons in storage or search operations.
 * @typedef {number[]} Embeddings
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
   * @param {string} text - The input text used to generate the embedding.
   * @param {Embeddings} embeddings - The resulting embedding as an array of numbers.
   * @param {string} clientId - The unique ID of the client associated with the embedding.
   * @param {EmbeddingName} embeddingName - The unique name of the embedding mechanism.
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
   * @param {string} text1 - The first text whose embedding was used in the comparison.
   * @param {string} text2 - The second text whose embedding was used in the comparison.
   * @param {number} similarity - The similarity score between the two embeddings (e.g., cosine similarity).
   * @param {string} clientId - The unique ID of the client associated with the comparison.
   * @param {EmbeddingName} embeddingName - The unique name of the embedding mechanism.
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
  /** The unique name of the embedding mechanism within the swarm. */
  embeddingName: EmbeddingName;

  /**
   * Creates an embedding from the provided text.
   * Typically used for indexing or search operations in storage.
   * @param {string} text - The text to encode into an embedding.
   * @returns {Promise<Embeddings>} A promise resolving to the generated embedding as an array of numbers.
   * @throws {Error} If embedding creation fails (e.g., due to invalid text or model errors).
   */
  createEmbedding(text: string): Promise<Embeddings>;

  /**
   * Calculates the similarity between two embeddings.
   * Commonly used for search or ranking operations (e.g., cosine similarity).
   * @param {Embeddings} a - The first embedding to compare.
   * @param {Embeddings} b - The second embedding to compare.
   * @returns {Promise<number>} A promise resolving to the similarity score (typically between -1 and 1).
   * @throws {Error} If similarity calculation fails (e.g., due to invalid embeddings or computation errors).
   */
  calculateSimilarity(a: Embeddings, b: Embeddings): Promise<number>;

  /** Optional partial set of callbacks for embedding events, allowing customization of creation and comparison. */
  callbacks?: Partial<IEmbeddingCallbacks>;
}

/**
 * Type representing the unique name of an embedding mechanism within the swarm.
 * @typedef {string} EmbeddingName
 */
export type EmbeddingName = string;
