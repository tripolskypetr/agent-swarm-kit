import { ToolRegistry } from "functools-kit";
import {
  IEmbeddingSchema,
  EmbeddingName,
} from "../../../interfaces/Embedding.interface";
import LoggerService from "../base/LoggerService";
import { inject } from "../../core/di";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for managing embedding schemas.
 */
export class EmbeddingSchemaService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<EmbeddingName, IEmbeddingSchema>>(
    "embeddingSchemaService"
  );

  /**
   * Validation for embedding schema
   */
  private validateShallow = (embeddingSchema: IEmbeddingSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`embeddingSchemaService validateShallow`, {
        embeddingSchema,
      });
    if (typeof embeddingSchema.embeddingName !== "string") {
      throw new Error(
        `agent-swarm embedding schema validation failed: missing embeddingName`
      );
    }
    if (typeof embeddingSchema.calculateSimilarity !== "function") {
      throw new Error(
        `agent-swarm embedding schema validation failed: missing calculateSimilarity for embeddingName=${embeddingSchema.embeddingName}`
      );
    }
    if (typeof embeddingSchema.createEmbedding !== "function") {
      throw new Error(
        `agent-swarm embedding schema validation failed: missing createEmbedding for embeddingName=${embeddingSchema.embeddingName}`
      );
    }
  };

  /**
   * Registers a embedding with the given key and value.
   * @param {EmbeddingName} key - The name of the embedding.
   * @param {IAgentTool} value - The embedding to register.
   */
  public register = (key: EmbeddingName, value: IEmbeddingSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("embeddingSchemaService register");
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a embedding by its key.
   * @param {EmbeddingName} key - The name of the embedding.
   * @returns {IAgentTool} The embedding associated with the given key.
   */
  public get = (key: EmbeddingName): IEmbeddingSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("embeddingSchemaService get", { key });
    return this.registry.get(key);
  };
}

export default EmbeddingSchemaService;
