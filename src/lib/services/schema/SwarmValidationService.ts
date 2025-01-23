import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { SwarmName, ISwarmSpec } from "src/interfaces/Swarm.interface";
import AgentValidationService from "./AgentValidationService";

export class SwarmValidationService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
    
    private readonly agentValidationService = inject<AgentValidationService>(TYPES.agentValidationService);

    private _swarmMap = new Map<SwarmName, ISwarmSpec>();

    public addSwarm = (swarmName: SwarmName, swarmSpec: ISwarmSpec) => {
        this.loggerService.log("swarmValidationService addSwarm", {
            swarmName,
            swarmSpec,
        });
        if (this._swarmMap.has(swarmName)) {
            throw new Error(`swarm-swarm swarm ${swarmName} already exist`);
        }
        this._swarmMap.set(swarmName, swarmSpec);
    };

    public validate = (swarmName: SwarmName) => {
        this.loggerService.log("swarmValidationService validate", {
            swarmName,
        });
        const swarm = this._swarmMap.get(swarmName);
        if (!swarm) {
            throw new Error(`agent-swarm swarm ${swarmName} not found`);
        }
        if (!swarm.agentList.includes(swarm.defaultAgent)) {
            throw new Error(`agent-swarm swarm ${swarmName} default agent not in agent list`);
        }
        swarm.agentList.forEach((agentName) => this.agentValidationService.validate(agentName));
    }


}

export default SwarmValidationService;
