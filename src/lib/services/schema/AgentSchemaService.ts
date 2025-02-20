import { ToolRegistry } from "functools-kit";
import { AgentName, IAgentSchema } from "../../../interfaces/Agent.interface";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";

/**
 * Service for managing agent schemas.
 */
export class AgentSchemaService {

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<AgentName, IAgentSchema>>("agentSchemaService");

    /**
     * Registers a new agent schema.
     * @param {AgentName} key - The name of the agent.
     * @param {IAgentSchema} value - The schema of the agent.
     */
    public register = (key: AgentName, value: IAgentSchema) => {
        this.loggerService.log(`agentSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    /**
     * Retrieves an agent schema by name.
     * @param {AgentName} key - The name of the agent.
     * @returns {IAgentSchema} The schema of the agent.
     */
    public get = (key: AgentName): IAgentSchema => {
        this.loggerService.log(`agentSchemaService get`, { key });
        return this.registry.get(key);
    };

}

export default AgentSchemaService;
