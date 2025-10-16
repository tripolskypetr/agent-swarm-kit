import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import { ToolName } from "../../../interfaces/Agent.interface";

/**
 * @class ActionSchemaService
 * Manages a collection of action tool names using a Set for efficient registration and lookup.
 * Injects LoggerService via dependency injection for logging operations.
 * Ensures only one action tool is called per tool execution chain, similar to having multiple reads but one write.
 */
export class ActionSchemaService {
  /**
   * @private
   * @readonly
   * Logger service instance, injected via dependency injection, for logging action schema operations.
   * Used in register and hasTool methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @private
   * Set for storing action tool names, ensuring uniqueness and efficient lookup.
   * Updated via the register method and queried via the hasTool method.
   */
  private _actionToolNameSet = new Set<ToolName>();

  /**
   * Registers an action tool name in the internal Set.
   * Logs the registration operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * @param {ToolName} toolName - The name of the action tool to register.
   */
  public register = (toolName: ToolName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`actionSchemaService register`, {
        toolName,
      });
    this._actionToolNameSet.add(toolName);
  };

  /**
   * Checks if an action tool name exists in the internal Set.
   * Logs the lookup operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * @param {ToolName} toolName - The name of the action tool to check.
   * @returns {boolean} True if the tool name is registered as an action tool.
   */
  public hasTool = (toolName: ToolName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`actionSchemaService hasTool`, {
        toolName,
      });
    return this._actionToolNameSet.has(toolName);
  };
}

/**
 * @default
 * Default export of the ActionSchemaService class.
 * Provides the primary service for managing action tool names, integrating with LoggerService for operational logging.
 */
export default ActionSchemaService;
