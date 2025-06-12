import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import { ToolName } from "../../../interfaces/Agent.interface";

/**
 * @class NavigationSchemaService
 * Manages a collection of navigation tool names using a Set for efficient registration and lookup.
 * Injects LoggerService via dependency injection for logging operations.
 * Supports agent navigation functionality within the swarm system by tracking available navigation tools.
 */
export class NavigationSchemaService {
  /**
   * @private
   * @readonly
   * @type {LoggerService}
   * Logger service instance, injected via dependency injection, for logging navigation schema operations.
   * Used in register and hasTool methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @private
   * @type {Set<ToolName>}
   * Set for storing navigation tool names, ensuring uniqueness and efficient lookup.
   * Updated via the register method and queried via the hasTool method.
   */
  private _navigationToolNameSet = new Set<ToolName>();

  /**
   * Registers a navigation tool name in the internal Set.
   * Logs the registration operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * @param {ToolName} toolName - The name of the navigation tool to register, sourced from Agent.interface.
   * @returns {Promise<void>} A promise that resolves when the tool name is registered.
   * @async
   */
  public register = (toolName: ToolName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`navigationSchemaService register`, {
        toolName,
      });
    this._navigationToolNameSet.add(toolName);
  };

  /**
   * Checks if a navigation tool name exists in the internal Set.
   * Logs the lookup operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * @param {ToolName} toolName - The name of the navigation tool to check, sourced from Agent.interface.
   * @returns {Promise<boolean>} A promise that resolves to true if the tool name exists, false otherwise.
   * @async
   */
  public hasTool = (toolName: ToolName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`navigationSchemaService hasTool`, {
        toolName,
      });
    return this._navigationToolNameSet.has(toolName);
  };
}

/**
 * @default
 * @description Default export of the NavigationSchemaService class.
 * Provides the primary service for managing navigation tool names, integrating with LoggerService for operational logging.
 * @type {typeof NavigationSchemaService}
 */
export default NavigationSchemaService;
