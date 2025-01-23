import { ToolRegistry } from "functools-kit";
import { AgentName, IAgentSchema } from "src/interfaces/Agent.interface";
import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";

export class AgentSchemaService {

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<AgentName, IAgentSchema>>("agentSchemaService");

    public register = (key: AgentName, value: IAgentSchema) => {
        this.loggerService.log(`agentSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    public get = (key: AgentName): IAgentSchema => {
        this.loggerService.log(`agentSchemaService get`, { key });
        return this.registry.get(key);
    };

    public dispose = () => {
        this.loggerService.log(`agentSchemaService dispose`);
        this.registry = new ToolRegistry("agentSchemaService");
    };

}

export default AgentSchemaService;
