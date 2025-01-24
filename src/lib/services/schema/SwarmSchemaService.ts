import { ToolRegistry } from "functools-kit";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ISwarmSchema, SwarmName } from "../../../interfaces/Swarm.interface";

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

}

export default SwarmSchemaService;
