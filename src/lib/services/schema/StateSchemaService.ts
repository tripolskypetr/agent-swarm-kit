import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IStateSchema, StateName } from "../../../interfaces/State.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for managing state schemas.
 */
export class StateSchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<StateName, IStateSchema>>(
    "stateSchemaService"
  );

  /**
   * Validation for state schema
   */
  private validateShallow = (stateSchema: IStateSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateSchemaService validateShallow`, {
        stateSchema,
      });
    if (typeof stateSchema.stateName !== "string") {
      throw new Error(
        `agent-swarm state schema validation failed: missing stateName`
      );
    }
    if (typeof stateSchema.getState !== "function") {
      throw new Error(
        `agent-swarm state schema validation failed: missing getState for stateName=${stateSchema.stateName}`
      );
    }
  };

  /**
   * Registers a new state schema.
   * @param {StateName} key - The key for the schema.
   * @param {IStateSchema} value - The schema to register.
   */
  public register = (key: StateName, value: IStateSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a state schema by key.
   * @param {StateName} key - The key of the schema to retrieve.
   * @returns {IStateSchema} The retrieved schema.
   */
  public get = (key: StateName): IStateSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`stateSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default StateSchemaService;
