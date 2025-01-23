import { ToolRegistry } from "functools-kit";

import { IAgentTool, ToolName } from "src/interfaces/Agent.interface";

import LoggerService from "../base/LoggerService";
import { inject } from "src/lib/core/di";
import TYPES from "src/lib/core/types";

export class ToolSpecService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<ToolName, IAgentTool>>("toolSpecService");

    public register = (key: ToolName, value: IAgentTool) => {
        this.loggerService.log('toolSpecService register');
        this.registry = this.registry.register(key, value);
    };

    public get = (key: ToolName): IAgentTool => {
        this.loggerService.log('toolSpecService get', { key });
        return this.registry.get(key);
    };

    public dispose = () => {
        this.loggerService.log(`toolSpecService dispose`);
        this.registry= new ToolRegistry("toolSpecService");
    };
}

export default ToolSpecService;
