import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { ICompletionSchema } from "../../../interfaces/Completion.interface";

export class CompletionSchemaService {
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<string, ICompletionSchema>>("completionSchemaService");

    public register = (key: string, value: ICompletionSchema) => {
        this.loggerService.log(`completionSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    public get = (key: string): ICompletionSchema => {
        this.loggerService.log(`completionSchemaService get`, { key });
        return this.registry.get(key);
    };

}

export default CompletionSchemaService;
