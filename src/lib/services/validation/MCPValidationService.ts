import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IMCPSchema, MCPName } from "../../../interfaces/MCP.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service class for validating and managing MCP (Model Context Protocol) schemas.
 * Maintains a map of MCP schemas and provides methods to add and validate them.
 */
export class MCPValidationService {
  /** Injected LoggerService for logging operations. */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  /** Internal map storing MCP schemas, keyed by MCP name. */
  private _mcpMap = new Map<MCPName, IMCPSchema>();

  /**
   * Adds a new MCP schema to the map.
   * @throws Error if an MCP with the same name already exists.
   */
  public addMCP = (mcpName: MCPName, mcpSchema: IMCPSchema): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("mcpValidationService addMCP", {
        mcpName,
        mcpSchema,
      });
    if (this._mcpMap.has(mcpName)) {
      throw new Error(`agent-swarm mcp ${mcpName} already exist`);
    }
    this._mcpMap.set(mcpName, mcpSchema);
  };

  /**
   * Validates the existence of an MCP schema by its name.
   * @throws Error if the MCP does not exist in the map.
   */
  public validate = memoize(
    ([mcpName]) => mcpName,
    (mcpName: MCPName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("mcpValidationService validate", {
          mcpName,
          source,
        });
      if (!this._mcpMap.has(mcpName)) {
        throw new Error(
          `agent-swarm mcp ${mcpName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (mcpName: MCPName, source: string) => void;
}

export default MCPValidationService;
