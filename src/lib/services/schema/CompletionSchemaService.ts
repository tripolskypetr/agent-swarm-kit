import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { ToolRegistry } from "functools-kit";
import { ICompletionSchema } from "src/interfaces/Completion.interface";

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

    public dispose = () => {
        this.loggerService.log(`completionSchemaService dispose`);
        this.registry= new ToolRegistry("completionSchemaService");
    };

}

export default CompletionSchemaService;
