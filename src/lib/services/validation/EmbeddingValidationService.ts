import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IEmbeddingSchema, EmbeddingName } from "../../../interfaces/Embedding.interface";
import { memoize } from "functools-kit";

/**
 * Service for validating embeddings within the agent-swarm.
 */
export class EmbeddingValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _embeddingMap = new Map<EmbeddingName, IEmbeddingSchema>();

  /**
   * Adds a new embedding to the validation service.
   * @param {EmbeddingName} embeddingName - The name of the embedding to add.
   * @param {IAgentEmbedding} embeddingSchema - The schema of the embedding to add.
   * @throws Will throw an error if the embedding already exists.
   */
  public addEmbedding = (embeddingName: EmbeddingName, embeddingSchema: IEmbeddingSchema) => {
    this.loggerService.log("embeddingValidationService addEmbedding", {
      embeddingName,
      embeddingSchema,
    });
    if (this._embeddingMap.has(embeddingName)) {
      throw new Error(`agent-swarm embedding ${embeddingName} already exist`);
    }
    this._embeddingMap.set(embeddingName, embeddingSchema);
  };

  /**
   * Validates if a embedding exists in the validation service.
   * @param {EmbeddingName} embeddingName - The name of the embedding to validate.
   * @param {string} source - The source of the validation request.
   * @throws Will throw an error if the embedding is not found.
   */
  public validate = memoize(
    ([embeddingName]) => embeddingName,
    (embeddingName: EmbeddingName, source: string) => {
      this.loggerService.log("embeddingValidationService validate", {
        embeddingName,
        source,
      });
      if (!this._embeddingMap.has(embeddingName)) {
        throw new Error(`agent-swarm embedding ${embeddingName} not found source=${source}`);
      }
      return {} as unknown as void;
    }
  ) as (embeddingName: EmbeddingName, source: string) => void;
}

export default EmbeddingValidationService;
