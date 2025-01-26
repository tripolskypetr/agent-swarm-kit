import { ToolRegistry } from "functools-kit";
import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ISwarmSchema, SwarmName } from "../../../interfaces/Swarm.interface";

/**
 * Service for managing swarm schemas.
 */
export class SwarmSchemaService {

    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<SwarmName, ISwarmSchema>>("swarmSchemaService");

    /**
     * Registers a new swarm schema.
     * @param {SwarmName} key - The name of the swarm.
     * @param {ISwarmSchema} value - The schema of the swarm.
     */
    public register = (key: SwarmName, value: ISwarmSchema) => {
        this.loggerService.log(`swarmSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    /**
     * Retrieves a swarm schema by its name.
     * @param {SwarmName} key - The name of the swarm.
     * @returns {ISwarmSchema} The schema of the swarm.
     */
    public get = (key: SwarmName): ISwarmSchema => {
        this.loggerService.log(`swarmSchemaService get`, { key });
        return this.registry.get(key);
    };

}

export default SwarmSchemaService;
