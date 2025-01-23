import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { CompletionName } from "src/interfaces/Completion.interface";
import { ToolName } from "src/interfaces/Agent.interface";

export class ToolSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _toolSet = new Set<CompletionName>();

    addTool = (toolName: ToolName) => {
        this.loggerService.log("sessionSchemaService addTool", {
            toolName,
        });
        if (this._toolSet.has(toolName)) {
            throw new Error(`agent-swarm tool toolName already exist`);
        }
        this._toolSet.add(toolName);
    };

}

export default ToolSchemaService;
