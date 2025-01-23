import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { SwarmName, ISwarmSpec } from "src/interfaces/Swarm.interface";

export class SwarmSchemaService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _swarmMap = new Map<SwarmName, ISwarmSpec>();

    addSwarm = (swarmName: SwarmName, swarmSpec: ISwarmSpec) => {
        this.loggerService.log("swarmSchemaService addSwarm", {
            swarmName,
            swarmSpec,
        });
        if (this._swarmMap.has(swarmName)) {
            throw new Error(`swarm-swarm swarm ${swarmName} already exist`);
        }
        this._swarmMap.set(swarmName, swarmSpec);
    };

}

export default SwarmSchemaService;
