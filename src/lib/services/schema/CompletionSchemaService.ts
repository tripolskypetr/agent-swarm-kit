import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { ICompletionSchema } from "../../../interfaces/Completion.interface";

/**
 * Service for managing completion schemas.
 */
export class CompletionSchemaService {
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<string, ICompletionSchema>>("completionSchemaService");

    /**
     * Registers a new completion schema.
     * @param {string} key - The key for the schema.
     * @param {ICompletionSchema} value - The schema to register.
     */
    public register = (key: string, value: ICompletionSchema) => {
        this.loggerService.log(`completionSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    /**
     * Retrieves a completion schema by key.
     * @param {string} key - The key of the schema to retrieve.
     * @returns {ICompletionSchema} The retrieved schema.
     */
    public get = (key: string): ICompletionSchema => {
        this.loggerService.log(`completionSchemaService get`, { key });
        return this.registry.get(key);
    };

}

export default CompletionSchemaService;
