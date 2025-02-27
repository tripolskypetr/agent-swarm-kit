import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  AgentName,
  IAgentSchema,
  ToolName,
} from "../../../interfaces/Agent.interface";
import ToolValidationService from "./ToolValidationService";
import CompletionValidationService from "./CompletionValidationService";
import { memoize } from "functools-kit";
import StorageValidationService from "./StorageValidationService";
import { StorageName } from "../../../interfaces/Storage.interface";
import { StateName } from "../../../interfaces/State.interface";

/**
 * Service for validating agents within the agent swarm.
 */
export class AgentValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly toolValidationService = inject<ToolValidationService>(
    TYPES.toolValidationService
  );
  private readonly completionValidationService =
    inject<CompletionValidationService>(TYPES.completionValidationService);
  private readonly storageValidationService = inject<StorageValidationService>(
    TYPES.storageValidationService
  );

  private _agentMap = new Map<AgentName, IAgentSchema>();

  /**
   * Retrieves the storages used by the agent
   * @param {agentName} agentName - The name of the swarm.
   * @returns {string[]} The list of storage names.
   * @throws Will throw an error if the swarm is not found.
   */
  public getStorageList = (agentName: string) => {
    if (!this._agentMap.has(agentName)) {
      throw new Error(
        `agent-swarm agent ${agentName} not exist (getStorageList)`
      );
    }
    return this._agentMap.get(agentName).storages;
  };

  /**
   * Retrieves the states used by the agent
   * @param {agentName} agentName - The name of the swarm.
   * @returns {string[]} The list of state names.
   * @throws Will throw an error if the swarm is not found.
   */
  public getStateList = (agentName: string) => {
    if (!this._agentMap.has(agentName)) {
      throw new Error(
        `agent-swarm agent ${agentName} not exist (getStateList)`
      );
    }
    return this._agentMap.get(agentName).states;
  };

  /**
   * Adds a new agent to the validation service.
   * @param {AgentName} agentName - The name of the agent.
   * @param {IAgentSchema} agentSchema - The schema of the agent.
   * @throws {Error} If the agent already exists.
   */
  public addAgent = (agentName: AgentName, agentSchema: IAgentSchema) => {
    this.loggerService.info("agentValidationService addAgent", {
      agentName,
      agentSchema,
    });
    if (this._agentMap.has(agentName)) {
      throw new Error(`agent-swarm agent ${agentName} already exist`);
    }
    this._agentMap.set(agentName, agentSchema);
  };

  /**
   * Check if agent got registered storage
   */
  public hasStorage = memoize(
    ([agentName, storageName]) => `${agentName}-${storageName}`,
    (agentName: AgentName, storageName: StorageName) => {
      this.loggerService.info("agentValidationService hasStorage", {
        agentName,
        storageName,
      });
      if (!this._agentMap.has(agentName)) {
        throw new Error(
          `agent-swarm agent ${agentName} not exist (hasStorage)`
        );
      }
      const { storages = [] } = this._agentMap.get(agentName);
      return storages.includes(storageName);
    }
  );

  /**
   * Check if agent got registered state
   */
  public hasState = memoize(
    ([agentName, stateName]) => `${agentName}-${stateName}`,
    (agentName: AgentName, stateName: StateName) => {
      this.loggerService.info("agentValidationService hasState", {
        agentName,
        stateName,
      });
      if (!this._agentMap.has(agentName)) {
        throw new Error(
          `agent-swarm agent ${agentName} not exist (hasState)`
        );
      }
      const { states = [] } = this._agentMap.get(agentName);
      return states.includes(stateName);
    }
  );

  /**
   * Validates an agent by its name and source.
   * @param {AgentName} agentName - The name of the agent.
   * @param {string} source - The source of the validation request.
   * @throws {Error} If the agent is not found.
   */
  public validate = memoize(
    ([agentName]) => agentName,
    (agentName: AgentName, source: string) => {
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
      this.completionValidationService.validate(agent.completion, source);
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
      return {} as unknown as void;
    }
  ) as (agentName: AgentName, source: string) => void;
}

export default AgentValidationService;
