import { ToolRegistry } from "functools-kit";
import { IEmbeddingSchema, EmbeddingName } from "../../../interfaces/Embedding.interface";
import LoggerService from "../base/LoggerService";
import { inject } from "../../core/di";
import TYPES from "../../core/types";

/**
 * Service for managing embedding schemas.
 */
export class EmbeddingSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<EmbeddingName, IEmbeddingSchema>>("embeddingSchemaService");

    /**
     * Registers a embedding with the given key and value.
     * @param {EmbeddingName} key - The name of the embedding.
     * @param {IAgentTool} value - The embedding to register.
     */
    public register = (key: EmbeddingName, value: IEmbeddingSchema) => {
        this.loggerService.log('embeddingSchemaService register');
        this.registry = this.registry.register(key, value);
    };

    /**
     * Retrieves a embedding by its key.
     * @param {EmbeddingName} key - The name of the embedding.
     * @returns {IAgentTool} The embedding associated with the given key.
     */
    public get = (key: EmbeddingName): IEmbeddingSchema => {
        this.loggerService.log('embeddingSchemaService get', { key });
        return this.registry.get(key);
    };

}

export default EmbeddingSchemaService;
