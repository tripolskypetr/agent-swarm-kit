import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IMCPSchema, MCPName } from "../../../interfaces/MCP.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

export class MCPValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private _mcpMap = new Map<MCPName, IMCPSchema>();

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
    }
  ) as (mcpName: MCPName, source: string) => void;
}

export default MCPValidationService;
