import { ToolRegistry } from "functools-kit";
import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { ISwarmSpec, SwarmName } from "src/interfaces/Swarm.interface";

export class SwarmSpecService {

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<SwarmName, ISwarmSpec>>("swarmSpecService");

    public register = (key: SwarmName, value: ISwarmSpec) => {
        this.loggerService.log(`swarmSpecService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    public get = (key: SwarmName): ISwarmSpec => {
        this.loggerService.log(`swarmSpecService get`, { key });
        return this.registry.get(key);
    };

    public dispose = () => {
        this.loggerService.log(`swarmSpecService dispose`);
        this.registry= new ToolRegistry("swarmSpecService");
    };
}

export default SwarmSpecService;
