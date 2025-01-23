import { ToolRegistry } from "functools-kit";
import { IAgentSpec } from "src/interfaces/Agent.interface";
import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";

export class AgentSpecService {

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<string, IAgentSpec>>("agentSpecService");

    public register = (key: string, value: IAgentSpec) => {
        this.loggerService.log(`agentSpecService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    public get = (key: string): IAgentSpec => {
        this.loggerService.log(`agentSpecService get`, { key });
        return this.registry.get(key);
    };

    public dispose = () => {
        this.loggerService.log(`agentSpecService dispose`);
        this.registry= new ToolRegistry("agentSpecService");
    };

}

export default AgentSpecService;
