import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { AgentName, IAgentSpec, ToolName } from "src/interfaces/Agent.interface";
import ToolValidationService from "./ToolValidationService";
import CompletionValidationService from "./CompletionValidationService";

export class AgentValidationService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private readonly toolValidationService = inject<ToolValidationService>(TYPES.toolValidationService);
    private readonly completionValidationService = inject<CompletionValidationService>(TYPES.completionValidationService);

    private _agentMap = new Map<AgentName, IAgentSpec>();

    public addAgent = (agentName: AgentName, agentSpec: IAgentSpec) => {
        this.loggerService.log("agentValidationService addAgent", {
            agentName,
            agentSpec,
        });
        if (this._agentMap.has(agentName)) {
            throw new Error(`agent-swarm agent ${agentName} already exist`);
        }
        this._agentMap.set(agentName, agentSpec);
    };

    public validate = (agentName: AgentName) => {
        this.loggerService.log("agentValidationService validate", {
            agentName,
        });
        const agent = this._agentMap.get(agentName);
        if (!agent) {
            throw new Error(`agent-swarm agent ${agentName} not found`);
        }
        this.completionValidationService.validate(agent.completion);
        agent.tools?.forEach((toolName: ToolName) => {
            this.toolValidationService.validate(toolName);
        });
    }

}

export default AgentValidationService;
