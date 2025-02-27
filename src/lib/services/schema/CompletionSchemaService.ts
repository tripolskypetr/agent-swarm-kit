import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { ICompletionSchema, CompletionName } from "../../../interfaces/Completion.interface";

/**
 * Service for managing completion schemas.
 */
export class CompletionSchemaService {
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<CompletionName, ICompletionSchema>>("completionSchemaService");

    /**
     * Registers a new completion schema.
     * @param {CompletionName} key - The key for the schema.
     * @param {ICompletionSchema} value - The schema to register.
     */
    public register = (key: CompletionName, value: ICompletionSchema) => {
        this.loggerService.info(`completionSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    /**
     * Retrieves a completion schema by key.
     * @param {CompletionName} key - The key of the schema to retrieve.
     * @returns {ICompletionSchema} The retrieved schema.
     */
    public get = (key: CompletionName): ICompletionSchema => {
        this.loggerService.info(`completionSchemaService get`, { key });
        return this.registry.get(key);
    };

}

export default CompletionSchemaService;
