import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IStateSchema, StateName } from "../../../interfaces/State.interface";

/**
 * Service for managing state schemas.
 */
export class StateSchemaService {
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private registry = new ToolRegistry<Record<StateName, IStateSchema>>("stateSchemaService");

    /**
     * Registers a new state schema.
     * @param {StateName} key - The key for the schema.
     * @param {IStateSchema} value - The schema to register.
     */
    public register = (key: StateName, value: IStateSchema) => {
        this.loggerService.info(`stateSchemaService register`, { key });
        this.registry = this.registry.register(key, value);
    };

    /**
     * Retrieves a state schema by key.
     * @param {StateName} key - The key of the schema to retrieve.
     * @returns {IStateSchema} The retrieved schema.
     */
    public get = (key: StateName): IStateSchema => {
        this.loggerService.info(`stateSchemaService get`, { key });
        return this.registry.get(key);
    };

}

export default StateSchemaService;
