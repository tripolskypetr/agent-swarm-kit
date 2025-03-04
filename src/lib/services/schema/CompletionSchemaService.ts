import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import {
  ICompletionSchema,
  CompletionName,
} from "../../../interfaces/Completion.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for managing completion schemas.
 */
export class CompletionSchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<
    Record<CompletionName, ICompletionSchema>
  >("completionSchemaService");

  /**
   * Validation for completion schemaschema
   */
  private validateShallow = (completionSchema: ICompletionSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`completionSchemaService validateShallow`, {
        completionSchema,
      });
    if (typeof completionSchema.completionName !== "string") {
      throw new Error(`agent-swarm completion schema validation failed: missing completionName`);
    }
    if (typeof completionSchema.getCompletion !== "function") {
      throw new Error(`agent-swarm completion schema validation failed: missing getCompletion for completionName=${completionSchema.completionName}`);
    }
  };

  /**
   * Registers a new completion schema.
   * @param {CompletionName} key - The key for the schema.
   * @param {ICompletionSchema} value - The schema to register.
   */
  public register = (key: CompletionName, value: ICompletionSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`completionSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a completion schema by key.
   * @param {CompletionName} key - The key of the schema to retrieve.
   * @returns {ICompletionSchema} The retrieved schema.
   */
  public get = (key: CompletionName): ICompletionSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`completionSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default CompletionSchemaService;
