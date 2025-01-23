import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { CompletionName } from "../../../interfaces/Completion.interface";
import { ToolName } from "../../../interfaces/Agent.interface";
import { memoize } from "functools-kit";

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

  public validate = memoize(
    ([toolName]) => toolName,
    (toolName: ToolName) => {
      this.loggerService.log("toolValidationService validate", {
        toolName,
      });
      if (!this._toolSet.has(toolName)) {
        throw new Error(`agent-swarm tool ${toolName} not found`);
      }
    }
  ) as (toolName: ToolName) => void;
}

export default ToolValidationService;
