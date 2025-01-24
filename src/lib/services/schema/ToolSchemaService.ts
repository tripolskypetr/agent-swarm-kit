import { ToolRegistry } from "functools-kit";
import { IAgentTool, ToolName } from "../../../interfaces/Agent.interface";
import LoggerService from "../base/LoggerService";
import { inject } from "../../core/di";
import TYPES from "../../core/types";

export class ToolSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<ToolName, IAgentTool>>("toolSchemaService");

    public register = (key: ToolName, value: IAgentTool) => {
        this.loggerService.log('toolSchemaService register');
        this.registry = this.registry.register(key, value);
    };

    public get = (key: ToolName): IAgentTool => {
        this.loggerService.log('toolSchemaService get', { key });
        return this.registry.get(key);
    };

}

export default ToolSchemaService;
