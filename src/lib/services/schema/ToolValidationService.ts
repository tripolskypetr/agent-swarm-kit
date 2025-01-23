import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { CompletionName } from "src/interfaces/Completion.interface";
import { ToolName } from "src/interfaces/Agent.interface";

export class ToolValidationService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _toolSet = new Set<CompletionName>();

    public addTool = (toolName: ToolName) => {
        this.loggerService.log("toolValidationService addTool", {
            toolName,
        });
        if (this._toolSet.has(toolName)) {
            throw new Error(`agent-swarm tool toolName already exist`);
        }
        this._toolSet.add(toolName);
    };

    public validate = (toolName: ToolName) => {
        this.loggerService.log("toolValidationService validate", {
            toolName,
        });
        if (!this._toolSet.has(toolName)) {
            throw new Error(`agent-swarm tool ${toolName} not found`);
        }
    }

}

export default ToolValidationService;
