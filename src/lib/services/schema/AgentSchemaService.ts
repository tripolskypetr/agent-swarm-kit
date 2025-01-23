import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { AgentName, IAgentSpec, ToolName } from "src/interfaces/Agent.interface";
import ToolSchemaService from "./ToolSchemaService";
import CompletionSchemaService from "./CompletionSchemaService";

export class AgentSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private readonly toolSchemaService = inject<ToolSchemaService>(TYPES.toolSchemaService);
    private readonly completionSchemaService = inject<CompletionSchemaService>(TYPES.completionSchemaService);

    private _agentMap = new Map<AgentName, IAgentSpec>();

    public addAgent = (agentName: AgentName, agentSpec: IAgentSpec) => {
        this.loggerService.log("agentSchemaService addAgent", {
            agentName,
            agentSpec,
        });
        if (this._agentMap.has(agentName)) {
            throw new Error(`agent-swarm agent ${agentName} already exist`);
        }
        this._agentMap.set(agentName, agentSpec);
    };

    public validate = (agentName: AgentName) => {
        this.loggerService.log("agentSchemaService validate", {
            agentName,
        });
        const agent = this._agentMap.get(agentName);
        if (!agent) {
            throw new Error(`agent-swarm agent ${agentName} not found`);
        }
        this.completionSchemaService.validate(agent.completion);
        agent.tools?.forEach((toolName: ToolName) => {
            this.toolSchemaService.validate(toolName);
        });
    }

}

export default AgentSchemaService;
