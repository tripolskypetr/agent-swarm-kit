import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { SwarmName, ISwarmSpec } from "src/interfaces/Swarm.interface";
import AgentSchemaService from "./AgentSchemaService";

export class SwarmSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
    
    private readonly agentSchemaService = inject<AgentSchemaService>(TYPES.agentSchemaService);

    private _swarmMap = new Map<SwarmName, ISwarmSpec>();

    public addSwarm = (swarmName: SwarmName, swarmSpec: ISwarmSpec) => {
        this.loggerService.log("swarmSchemaService addSwarm", {
            swarmName,
            swarmSpec,
        });
        if (this._swarmMap.has(swarmName)) {
            throw new Error(`swarm-swarm swarm ${swarmName} already exist`);
        }
        this._swarmMap.set(swarmName, swarmSpec);
    };

    public validate = (swarmName: SwarmName) => {
        this.loggerService.log("swarmSchemaService validate", {
            swarmName,
        });
        const swarm = this._swarmMap.get(swarmName);
        if (!swarm) {
            throw new Error(`agent-swarm swarm ${swarmName} not found`);
        }
        if (!swarm.agentList.includes(swarm.defaultAgent)) {
            throw new Error(`agent-swarm swarm ${swarmName} default agent not in agent list`);
        }
        swarm.agentList.forEach((agentName) => this.agentSchemaService.validate(agentName));
    }


}

export default SwarmSchemaService;
