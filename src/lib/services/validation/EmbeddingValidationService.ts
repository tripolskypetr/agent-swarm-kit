import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  IEmbeddingSchema,
  EmbeddingName,
} from "../../../interfaces/Embedding.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating embedding names within the swarm system.
 * Manages a map of registered embeddings, ensuring their uniqueness and existence during validation.
 * Integrates with EmbeddingSchemaService (embedding registration), ClientStorage (embedding usage in similarity search),
 * AgentValidationService (potential embedding validation for agents), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
export class EmbeddingValidationService {
  /**
   * Logger service instance for logging validation operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @type {LoggerService}
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Map of embedding names to their schemas, used to track and validate embeddings.
   * Populated by addEmbedding, queried by validate.
   * @type {Map<EmbeddingName, IEmbeddingSchema>}
   * @private
   */
  private _embeddingMap = new Map<EmbeddingName, IEmbeddingSchema>();

  /**
   * Registers a new embedding with its schema in the validation service.
   * Logs the operation and ensures uniqueness, supporting EmbeddingSchemaService’s registration process.
   * @param {EmbeddingName} embeddingName - The name of the embedding to add, sourced from Embedding.interface.
   * @param {IEmbeddingSchema} embeddingSchema - The schema defining the embedding’s configuration, sourced from Embedding.interface.
   * @throws {Error} If the embedding name already exists in _embeddingMap.
   */
  public addEmbedding = (
    embeddingName: EmbeddingName,
    embeddingSchema: IEmbeddingSchema
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("embeddingValidationService addEmbedding", {
        embeddingName,
        embeddingSchema,
      });
    if (this._embeddingMap.has(embeddingName)) {
      throw new Error(`agent-swarm embedding ${embeddingName} already exist`);
    }
    this._embeddingMap.set(embeddingName, embeddingSchema);
  };

  /**
   * Validates if an embedding name exists in the registered map, memoized by embeddingName for performance.
   * Logs the operation and checks existence, supporting ClientStorage’s embedding-based search validation.
   * @param {EmbeddingName} embeddingName - The name of the embedding to validate, sourced from Embedding.interface.
   * @param {string} source - The source of the validation request (e.g., "storage-validate"), for error context.
   * @throws {Error} If the embedding name is not found in _embeddingMap.
   */
  public validate = memoize(
    ([embeddingName]) => embeddingName,
    (embeddingName: EmbeddingName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("embeddingValidationService validate", {
          embeddingName,
          source,
        });
      if (!this._embeddingMap.has(embeddingName)) {
        throw new Error(
          `agent-swarm embedding ${embeddingName} not found source=${source}`
        );
      }
    }
  ) as (embeddingName: EmbeddingName, source: string) => void;
}

/**
 * Default export of the EmbeddingValidationService class.
 * Provides a service for validating embedding names in the swarm system,
 * integrating with EmbeddingSchemaService, ClientStorage, AgentValidationService, and LoggerService,
 * with memoized validation and uniqueness enforcement.
 * @type {typeof EmbeddingValidationService}
 */
export default EmbeddingValidationService;
