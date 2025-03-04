import { ToolRegistry } from "functools-kit";
import { AgentName, IAgentSchema } from "../../../interfaces/Agent.interface";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import { GLOBAL_CONFIG } from "../../../config/params";
import TYPES from "../../core/types";

/**
 * Service for managing agent schemas.
 */
export class AgentSchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<AgentName, IAgentSchema>>(
    "agentSchemaService"
  );

  /**
   * Validation for agent schema
   */
  private validateShallow = (agentSchema: IAgentSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentSchemaService validateShallow`, {
        agentSchema,
      });
    if (typeof agentSchema.agentName !== "string") {
      throw new Error(`agent-swarm agent schema validation failed: missing agentName`);
    }
    if (typeof agentSchema.completion !== "string") {
      throw new Error(`agent-swarm agent schema validation failed: missing completion for agentName=${agentSchema.agentName}`);
    }
    if (typeof agentSchema.prompt !== "string") {
      throw new Error(`agent-swarm agent schema validation failed: missing prompt for agentName=${agentSchema.agentName}`);
    }
    if (agentSchema.system && !Array.isArray(agentSchema.system)) {
      throw new Error(`agent-swarm agent schema validation failed: invalid system prompt for agentName=${agentSchema.agentName} value=${agentSchema.system}`);
    }
    if (agentSchema.system?.some((value) => typeof value !== "string")) {
      throw new Error(`agent-swarm agent schema validation failed: invalid system prompt for agentName=${agentSchema.agentName} value=[${agentSchema.system}]`);
    }
    if (agentSchema.dependsOn && !Array.isArray(agentSchema.dependsOn)) {
      throw new Error(`agent-swarm agent schema validation failed: invalid dependsOn for agentName=${agentSchema.agentName} value=${agentSchema.dependsOn}`);
    }
    if (agentSchema.dependsOn?.some((value) => typeof value !== "string")) {
      throw new Error(`agent-swarm agent schema validation failed: invalid dependsOn for agentName=${agentSchema.agentName} value=[${agentSchema.dependsOn}]`);
    }
    if (agentSchema.states && !Array.isArray(agentSchema.states)) {
      throw new Error(`agent-swarm agent schema validation failed: invalid states for agentName=${agentSchema.agentName} value=${agentSchema.states}`);
    }
    if (agentSchema.states?.some((value) => typeof value !== "string")) {
      throw new Error(`agent-swarm agent schema validation failed: invalid states for agentName=${agentSchema.agentName} value=[${agentSchema.states}]`);
    }
    if (agentSchema.storages && !Array.isArray(agentSchema.storages)) {
      throw new Error(`agent-swarm agent schema validation failed: invalid storages for agentName=${agentSchema.agentName} value=${agentSchema.storages}`);
    }
    if (agentSchema.storages?.some((value) => typeof value !== "string")) {
      throw new Error(`agent-swarm agent schema validation failed: invalid storages for agentName=${agentSchema.agentName} value=[${agentSchema.storages}]`);
    }
    if (agentSchema.tools && !Array.isArray(agentSchema.tools)) {
      throw new Error(`agent-swarm agent schema validation failed: invalid tools for agentName=${agentSchema.agentName} value=${agentSchema.tools}`);
    }
    if (agentSchema.tools?.some((value) => typeof value !== "string")) {
      throw new Error(`agent-swarm agent schema validation failed: invalid tools for agentName=${agentSchema.agentName} value=[${agentSchema.tools}]`);
    }
  };

  /**
   * Registers a new agent schema.
   * @param {AgentName} key - The name of the agent.
   * @param {IAgentSchema} value - The schema of the agent.
   */
  public register = (key: AgentName, value: IAgentSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves an agent schema by name.
   * @param {AgentName} key - The name of the agent.
   * @returns {IAgentSchema} The schema of the agent.
   */
  public get = (key: AgentName): IAgentSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`agentSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default AgentSchemaService;
