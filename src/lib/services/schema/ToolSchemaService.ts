import { ToolRegistry } from "functools-kit";
import { IAgentTool, ToolName } from "../../../interfaces/Agent.interface";
import LoggerService from "../base/LoggerService";
import { inject } from "../../core/di";
import TYPES from "../../core/types";

/**
 * Service for managing tool schemas.
 */
export class ToolSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<ToolName, IAgentTool>>("toolSchemaService");

    /**
     * Registers a tool with the given key and value.
     * @param {ToolName} key - The name of the tool.
     * @param {IAgentTool} value - The tool to register.
     */
    public register = (key: ToolName, value: IAgentTool) => {
        this.loggerService.info('toolSchemaService register');
        this.registry = this.registry.register(key, value);
    };

    /**
     * Retrieves a tool by its key.
     * @param {ToolName} key - The name of the tool.
     * @returns {IAgentTool} The tool associated with the given key.
     */
    public get = (key: ToolName): IAgentTool => {
        this.loggerService.info('toolSchemaService get', { key });
        return this.registry.get(key);
    };

}

export default ToolSchemaService;
