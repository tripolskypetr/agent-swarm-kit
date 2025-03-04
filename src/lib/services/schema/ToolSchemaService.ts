import { isObject, ToolRegistry } from "functools-kit";
import { IAgentTool, ToolName } from "../../../interfaces/Agent.interface";
import LoggerService from "../base/LoggerService";
import { inject } from "../../core/di";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for managing tool schemas.
 */
export class ToolSchemaService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<ToolName, IAgentTool>>(
    "toolSchemaService"
  );

    /**
     * Validation for state schema
     */
    private validateShallow = (toolSchema: IAgentTool) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info(`toolSchemaService validateShallow`, {
          toolSchema,
        });
      if (typeof toolSchema.toolName !== "string") {
        throw new Error(
          `agent-swarm tool schema validation failed: missing toolName`
        );
      }
      if (typeof toolSchema.call !== "function") {
        throw new Error(
          `agent-swarm tool schema validation failed: missing call for toolName=${toolSchema.toolName}`
        );
      }
      if (typeof toolSchema.validate !== "function") {
        throw new Error(
          `agent-swarm tool schema validation failed: missing validate for toolName=${toolSchema.toolName}`
        );
      }
      if (!isObject(toolSchema.function)) {
        throw new Error(
          `agent-swarm tool schema validation failed: missing function for toolName=${toolSchema.toolName}`
        );
      }
    };
  

  /**
   * Registers a tool with the given key and value.
   * @param {ToolName} key - The name of the tool.
   * @param {IAgentTool} value - The tool to register.
   */
  public register = (key: ToolName, value: IAgentTool) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("toolSchemaService register");
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a tool by its key.
   * @param {ToolName} key - The name of the tool.
   * @returns {IAgentTool} The tool associated with the given key.
   */
  public get = (key: ToolName): IAgentTool => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("toolSchemaService get", { key });
    return this.registry.get(key);
  };
}

export default ToolSchemaService;
