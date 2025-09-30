import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IAgentTool, ToolName } from "../../../interfaces/Agent.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating tool configurations within the swarm system.
 * Manages a map of registered tools, ensuring their uniqueness and existence during validation.
 * Integrates with ToolSchemaService (tool registration), AgentValidationService (validating agent tools),
 * ClientAgent (tool usage), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
*/
export class ToolValidationService {
  /**
   * Logger service instance for logging validation operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Map of tool names to their schemas, used to track and validate tools.
   * Populated by addTool, queried by validate.
   * @private
   */
  private _toolMap = new Map<ToolName, IAgentTool>();

  /**
   * Registers a new tool with its schema in the validation service.
   * Logs the operation and ensures uniqueness, supporting ToolSchemaService’s registration process.
   * @throws {Error} If the tool name already exists in _toolMap.
   */
  public addTool = (toolName: ToolName, toolSchema: IAgentTool): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
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
   * Validates if a tool name exists in the registered map, memoized by toolName for performance.
   * Logs the operation and checks existence, supporting AgentValidationService’s validation of agent tools.
   * @throws {Error} If the tool name is not found in _toolMap.
   */
  public validate = memoize(
    ([toolName]) => toolName,
    (toolName: ToolName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("toolValidationService validate", {
          toolName,
          source,
        });
      if (!this._toolMap.has(toolName)) {
        throw new Error(
          `agent-swarm tool ${toolName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (toolName: ToolName, source: string) => void;
}

/**
 * Default export of the ToolValidationService class.
 * Provides a service for validating tool configurations in the swarm system,
 * integrating with ToolSchemaService, AgentValidationService, ClientAgent, and LoggerService,
 * with memoized validation and uniqueness enforcement.
*/
export default ToolValidationService;
