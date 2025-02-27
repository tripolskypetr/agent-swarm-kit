import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { CompletionName } from "../../../interfaces/Completion.interface";
import { IAgentTool, ToolName } from "../../../interfaces/Agent.interface";
import { memoize } from "functools-kit";

/**
 * Service for validating tools within the agent-swarm.
 */
export class ToolValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private _toolMap = new Map<ToolName, IAgentTool>();

  /**
   * Adds a new tool to the validation service.
   * @param {ToolName} toolName - The name of the tool to add.
   * @param {IAgentTool} toolSchema - The schema of the tool to add.
   * @throws Will throw an error if the tool already exists.
   */
  public addTool = (toolName: ToolName, toolSchema: IAgentTool) => {
    this.loggerService.info("toolValidationService addTool", {
      toolName,
      toolSchema,
    });
    if (this._toolMap.has(toolName)) {
      throw new Error(`agent-swarm tool ${toolName} already exist`);
    }
    this._toolMap.set(toolName, toolSchema);
  };

  /**
   * Validates if a tool exists in the validation service.
   * @param {ToolName} toolName - The name of the tool to validate.
   * @param {string} source - The source of the validation request.
   * @throws Will throw an error if the tool is not found.
   */
  public validate = memoize(
    ([toolName]) => toolName,
    (toolName: ToolName, source: string) => {
      this.loggerService.info("toolValidationService validate", {
        toolName,
        source,
      });
      if (!this._toolMap.has(toolName)) {
        throw new Error(`agent-swarm tool ${toolName} not found source=${source}`);
      }
      return {} as unknown as void;
    }
  ) as (toolName: ToolName, source: string) => void;
}

export default ToolValidationService;
