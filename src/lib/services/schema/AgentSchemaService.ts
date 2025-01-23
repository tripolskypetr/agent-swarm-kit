import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { AgentName, IAgentSpec } from "src/interfaces/Agent.interface";

export class AgentSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _agentMap = new Map<AgentName, IAgentSpec>();

    addAgent = (agentName: AgentName, agentSpec: IAgentSpec) => {
        this.loggerService.log("agentSchemaService addAgent", {
            agentName,
            agentSpec,
        });
        if (this._agentMap.has(agentName)) {
            throw new Error(`agent-swarm agent ${agentName} already exist`);
        }
        this._agentMap.set(agentName, agentSpec);
    };


}

export default AgentSchemaService;
