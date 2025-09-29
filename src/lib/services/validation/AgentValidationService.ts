import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  AgentName,
  IAgentSchemaInternal,
  ToolName,
} from "../../../interfaces/Agent.interface";
import ToolValidationService from "./ToolValidationService";
import CompletionValidationService from "./CompletionValidationService";
import { memoize } from "functools-kit";
import StorageValidationService from "./StorageValidationService";
import { StorageName } from "../../../interfaces/Storage.interface";
import { StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import WikiValidationService from "./WikiValidationService";
import { WikiName } from "../../../interfaces/Wiki.interface";
import MCPValidationService from "./MCPValidationService";
import { MCPName } from "../../../interfaces/MCP.interface";
import CompletionSchemaService from "../schema/CompletionSchemaService";

/**
 * Service for validating agents within the swarm system, managing agent schemas and dependencies.
 * Provides methods to register agents, validate their configurations, and query associated resources (storages, states, dependencies).
 * Integrates with AgentSchemaService (agent schema validation), SwarmSchemaService (swarm-level agent management),
 * ToolValidationService (tool validation), CompletionValidationService (completion validation),
 * StorageValidationService (storage validation), and LoggerService (logging).
 * Uses dependency injection for service dependencies and memoization for efficient validation checks.
 */
export class AgentValidationService {
  /**
   * Logger service instance for logging validation operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Completion schema service instance for managing completion schemas.
   * Injected via DI, used in validate method to check agent completions.
   * Provides a registry of completion schemas for the swarm.
   * @private
   * @readonly
   */
  private readonly completionSchemaService = inject<CompletionSchemaService>(
    TYPES.completionSchemaService
  );

  /**
   * Tool validation service instance for validating tools associated with agents.
   * Injected via DI, used in validate method to check agent tools.
   * @private
   * @readonly
   */
  private readonly toolValidationService = inject<ToolValidationService>(
    TYPES.toolValidationService
  );

  /**
   * Wiki validation service instance for validating wikies associated with agents.
   * Injected via DI, used in validate method to check agent wiki list.
   * @private
   * @readonly
   */
  private readonly wikiValidationService = inject<WikiValidationService>(
    TYPES.wikiValidationService
  );

  /**
   * MCP validation service instance for validating mcp associated with agents.
   * Injected via DI, used in validate method to check agent mcp list.
   * @private
   * @readonly
   */
  private readonly mcpValidationService = inject<MCPValidationService>(
    TYPES.mcpValidationService
  );

  /**
   * Completion validation service instance for validating completion configurations of agents.
   * Injected via DI, used in validate method to check agent completion.
   * @private
   * @readonly
   */
  private readonly completionValidationService =
    inject<CompletionValidationService>(TYPES.completionValidationService);

  /**
   * Storage validation service instance for validating storages associated with agents.
   * Injected via DI, used in validate method to check agent storages.
   * @private
   * @readonly
   */
  private readonly storageValidationService = inject<StorageValidationService>(
    TYPES.storageValidationService
  );

  /**
   * Map of agent names to their schemas, used for validation and resource queries.
   * Populated by addAgent, queried by validate, getStorageList, getStateList, etc.
   * @private
   */
  private _agentMap = new Map<AgentName, IAgentSchemaInternal>();

  /**
   * Map of agent names to their dependency lists, tracking inter-agent dependencies.
   * Populated by addAgent when dependsOn is present, queried by hasDependency.
   * @private
   */
  private _agentDepsMap = new Map<AgentName, AgentName[]>();

  /**
   * Retrieves the list of registered agent names.
   * Logs the operation if info-level logging is enabled, supporting SwarmSchemaService’s agent enumeration.
   */
  public getAgentList = (): AgentName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentValidationService getAgentList");
    return [...this._agentMap.keys()];
  };

  /**
   * Retrieves the list of storage names associated with a given agent.
   * Logs the operation and validates agent existence, supporting ClientStorage integration.
   * @throws {Error} If the agent is not found in _agentMap.
   */
  public getStorageList = (agentName: AgentName): StorageName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentValidationService getStorageList", {
        agentName,
      });
    if (!this._agentMap.has(agentName)) {
      throw new Error(
        `agent-swarm agent ${agentName} not exist (getStorageList)`
      );
    }
    return this._agentMap.get(agentName)!.storages || [];
  };

  /**
   * Retrieves the list of wiki names associated with a given agent.
   * @throws {Error} If the agent is not found in _agentMap.
   */
  public getWikiList = (agentName: AgentName): WikiName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentValidationService getWikiList", {
        agentName,
      });
    if (!this._agentMap.has(agentName)) {
      throw new Error(`agent-swarm agent ${agentName} not exist (getWikiList)`);
    }
    return this._agentMap.get(agentName)!.wikiList || [];
  };

  /**
   * Retrieves the list of state names associated with a given agent.
   * Logs the operation and validates agent existence, supporting ClientState integration.
   * @throws {Error} If the agent is not found in _agentMap.
   */
  public getStateList = (agentName: AgentName): StateName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentValidationService getStateList", {
        agentName,
      });
    if (!this._agentMap.has(agentName)) {
      throw new Error(
        `agent-swarm agent ${agentName} not exist (getStateList)`
      );
    }
    return this._agentMap.get(agentName)!.states || [];
  };

  /**
   * Retrieves the list of mcp names associated with a given agent.
   * Logs the operation and validates agent existence, supporting ClientMCP integration.
   * @throws {Error} If the agent is not found in _agentMap.
   */
  public getMCPList = (agentName: AgentName): MCPName[] => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentValidationService getMCPList", {
        agentName,
      });
    if (!this._agentMap.has(agentName)) {
      throw new Error(
        `agent-swarm agent ${agentName} not exist (getMCPList)`
      );
    }
    return this._agentMap.get(agentName)!.mcp || [];
  };

  /**
   * Registers a new agent with its schema in the validation service.
   * Logs the operation and updates _agentMap and _agentDepsMap, supporting AgentSchemaService’s agent registration.
   * @throws {Error} If the agent already exists in _agentMap.
   */
  public addAgent = (agentName: AgentName, agentSchema: IAgentSchemaInternal): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("agentValidationService addAgent", {
        agentName,
        agentSchema,
      });
    if (this._agentMap.has(agentName)) {
      throw new Error(`agent-swarm agent ${agentName} already exist`);
    }
    this._agentMap.set(agentName, agentSchema);
    if (agentSchema.dependsOn) {
      this._agentDepsMap.set(agentName, agentSchema.dependsOn);
    }
  };

  /**
   * Checks if an agent has a registered storage, memoized for performance.
   * Logs the operation and validates agent existence, supporting ClientStorage validation.
   * @throws {Error} If the agent is not found in _agentMap.
   */
  public hasStorage = memoize(
    ([agentName, storageName]) => `${agentName}-${storageName}`,
    (agentName: AgentName, storageName: StorageName): boolean => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("agentValidationService hasStorage", {
          agentName,
          storageName,
        });
      if (!this._agentMap.has(agentName)) {
        throw new Error(
          `agent-swarm agent ${agentName} not exist (hasStorage)`
        );
      }
      const { storages = [] } = this._agentMap.get(agentName)!;
      return storages.includes(storageName);
    }
  );

  /**
   * Checks if an agent has declared wiki
   * @throws {Error} If the agent is not found in _agentMap.
   */
  public hasWiki = memoize(
    ([agentName, wikiName]) => `${agentName}-${wikiName}`,
    (agentName: AgentName, wikiName: WikiName): boolean => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("agentValidationService hasWiki", {
          agentName,
          wikiName,
        });
      if (!this._agentMap.has(agentName)) {
        throw new Error(`agent-swarm agent ${agentName} not exist (hasWiki)`);
      }
      const { wikiList = [] } = this._agentMap.get(agentName)!;
      return wikiList.includes(wikiName);
    }
  );

  /**
   * Checks if an agent has a registered dependency on another agent, memoized for performance.
   * Logs the operation, supporting inter-agent dependency validation within SwarmSchemaService.
   */
  public hasDependency = memoize(
    ([targetAgentName, depAgentName]) => `${targetAgentName}-${depAgentName}`,
    (targetAgentName: AgentName, depAgentName: AgentName): boolean => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("agentValidationService hasDependency", {
          targetAgentName,
          depAgentName,
        });
      if (this._agentDepsMap.has(targetAgentName)) {
        return this._agentDepsMap.get(targetAgentName)!.includes(depAgentName);
      }
      return false;
    }
  );

  /**
   * Checks if an agent has a registered state, memoized for performance.
   * Logs the operation and validates agent existence, supporting ClientState validation.
   * @throws {Error} If the agent is not found in _agentMap.
   */
  public hasState = memoize(
    ([agentName, stateName]) => `${agentName}-${stateName}`,
    (agentName: AgentName, stateName: StateName): boolean => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("agentValidationService hasState", {
          agentName,
          stateName,
        });
      if (!this._agentMap.has(agentName)) {
        throw new Error(`agent-swarm agent ${agentName} not exist (hasState)`);
      }
      const { states = [] } = this._agentMap.get(agentName)!;
      return states.includes(stateName);
    }
  );

  /**
   * Validates an agent’s configuration by its name and source, memoized by agentName for performance.
   * Checks the agent’s existence, completion, tools, and storages, delegating to respective validation services.
   * Logs the operation, supporting AgentSchemaService’s validation workflow within SwarmSchemaService.
   * @throws {Error} If the agent is not found, or if its completion, tools, or storages are invalid.
   */
  public validate = memoize(
    ([agentName]) => agentName,
    (agentName: AgentName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("agentValidationService validate", {
          agentName,
          source,
        });
      const agent = this._agentMap.get(agentName);
      if (!agent) {
        throw new Error(
          `agent-swarm agent ${agentName} not found source=${source}`
        );
      }
      const completionSchema = this.completionSchemaService.get(
        agent.completion
      );
      if (completionSchema.json) {
        throw new Error(
          `agent-swarm agent ${agentName} completion schema is JSON source=${source}`
        );
      }
      if (!agent.operator) {
        this.completionValidationService.validate(agent.completion, source);
      }
      agent.tools?.forEach((toolName: ToolName) => {
        if (typeof toolName !== "string") {
          throw new Error(
            `agent-swarm agent ${agentName} tool list is invalid (toolName=${String(
              toolName
            )}) source=${source}`
          );
        }
        this.toolValidationService.validate(toolName, source);
      });
      agent.storages?.forEach((storageName: StorageName) => {
        if (typeof storageName !== "string") {
          throw new Error(
            `agent-swarm agent ${agentName} storage list is invalid (storageName=${String(
              storageName
            )}) source=${source}`
          );
        }
        this.storageValidationService.validate(storageName, source);
      });
      agent.wikiList?.forEach((wikiName: WikiName) => {
        if (typeof wikiName !== "string") {
          throw new Error(
            `agent-swarm agent ${agentName} wiki list is invalid (wikiName=${String(
              wikiName
            )}) source=${source}`
          );
        }
        this.wikiValidationService.validate(wikiName, source);
      });
      agent.mcp?.forEach((mcpName: MCPName) => {
        if (typeof mcpName !== "string") {
          throw new Error(
            `agent-swarm agent ${agentName} mcp list is invalid (mcpName=${String(
              mcpName
            )}) source=${source}`
          );
        }
        this.mcpValidationService.validate(mcpName, source);
      });
      return true as never;
    }
  ) as (agentName: AgentName, source: string) => void;
}

/**
 * Default export of the AgentValidationService class.
 * Provides a service for validating agent configurations in the swarm system,
 * integrating with AgentSchemaService, SwarmSchemaService, ToolValidationService,
 * CompletionValidationService, StorageValidationService, and LoggerService,
 * with memoized validation checks and dependency management.
 */
export default AgentValidationService;
