import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { ToolRegistry } from "functools-kit";
import { ICompletion } from "src/interfaces/Completion.interface";

export class CompletionSpecService {
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<string, ICompletion>>("completionSpecService");

    public register = (key: string, value: ICompletion) => {
        this.loggerService.log(`completionSpecService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    public get = (key: string): ICompletion => {
        this.loggerService.log(`completionSpecService get`, { key });
        return this.registry.get(key);
    };

    public dispose = () => {
        this.loggerService.log(`completionSpecService dispose`);
        this.registry= new ToolRegistry("completionSpecService");
    };

}

export default CompletionSpecService;
