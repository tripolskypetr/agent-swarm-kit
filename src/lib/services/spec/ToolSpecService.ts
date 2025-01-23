import { ToolRegistry } from "functools-kit";

import { IAgentToolSignature } from "src/interfaces/Agent.interface";

import LoggerService from "../base/LoggerService";
import { inject } from "src/lib/core/di";
import TYPES from "src/lib/core/types";

export class ToolSpecService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<string, IAgentToolSignature>>("toolSpecService");

    public register = (key: string, value: IAgentToolSignature) => {
        this.loggerService.log('toolSpecService register');
        this.registry = this.registry.register(key, value);
    };

    public get = (key: string): IAgentToolSignature => {
        this.loggerService.log('toolSpecService get', { key });
        return this.registry.get(key);
    };

    public dispose = () => {
        this.loggerService.log(`toolSpecService dispose`);
        this.registry= new ToolRegistry("toolSpecService");
    };
}

export default ToolSpecService;
