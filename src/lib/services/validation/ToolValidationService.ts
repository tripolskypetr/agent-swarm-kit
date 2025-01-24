import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { CompletionName } from "../../../interfaces/Completion.interface";
import { IAgentTool, ToolName } from "../../../interfaces/Agent.interface";
import { memoize } from "functools-kit";

export class ToolValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _toolMap = new Map<ToolName, IAgentTool>();

  public addTool = (toolName: ToolName, toolSchema: IAgentTool) => {
    this.loggerService.log("toolValidationService addTool", {
      toolName,
      toolSchema,
    });
    if (this._toolMap.has(toolName)) {
      throw new Error(`agent-swarm tool ${toolName} already exist`);
    }
    this._toolMap.set(toolName, toolSchema);
  };

  public validate = memoize(
    ([toolName]) => toolName,
    (toolName: ToolName) => {
      this.loggerService.log("toolValidationService validate", {
        toolName,
      });
      if (!this._toolMap.has(toolName)) {
        throw new Error(`agent-swarm tool ${toolName} not found`);
      }
    }
  ) as (toolName: ToolName) => void;
}

export default ToolValidationService;
