import { ToolRegistry } from "functools-kit";
import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import { ISwarmSchema, SwarmName } from "src/interfaces/Swarm.interface";

export class SwarmSchemaService {

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<SwarmName, ISwarmSchema>>("swarmSchemaService");

    public register = (key: SwarmName, value: ISwarmSchema) => {
        this.loggerService.log(`swarmSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    public get = (key: SwarmName): ISwarmSchema => {
        this.loggerService.log(`swarmSchemaService get`, { key });
        return this.registry.get(key);
    };

    public dispose = () => {
        this.loggerService.log(`swarmSchemaService dispose`);
        this.registry = new ToolRegistry("swarmSchemaService");
    };
}

export default SwarmSchemaService;
