/**
 * @module ComputeSchemaService
 * @description Manages compute schema registration, validation, and retrieval using a tool registry.
 */

import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IComputeSchema, ComputeName } from "../../../interfaces/Compute.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * @class ComputeSchemaService
 * @description Service for managing compute schemas, including registration, validation, and retrieval.
 */
export class ComputeSchemaService {
  /**
   * @property {LoggerService} loggerService
   * @description Injected logger service for logging operations.
   * @readonly
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @property {ToolRegistry<Record<ComputeName, IComputeSchema>>} registry
   * @description Registry for storing compute schemas.
   * @private
   */
  private registry = new ToolRegistry<Record<ComputeName, IComputeSchema>>(
    "computeSchemaService"
  );

  /**
   * @method validateShallow
   * @description Performs shallow validation of a compute schema.
   * @param {IComputeSchema} computeSchema - The compute schema to validate.
   * @throws {Error} If validation fails for computeName, getComputeData, middlewares, or dependsOn.
   * @private
   */
  private validateShallow = (computeSchema: IComputeSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService validateShallow`, {
        computeSchema,
      });
    if (typeof computeSchema.computeName !== "string") {
      throw new Error(
        `agent-swarm compute schema validation failed: missing computeName`
      );
    }
    if (typeof computeSchema.getComputeData !== "function") {
      throw new Error(
        `agent-swarm compute schema validation failed: missing getComputeData for computeName=${computeSchema.computeName}`
      );
    }
    if (computeSchema.middlewares && !Array.isArray(computeSchema.middlewares)) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid middlewares for computeName=${computeSchema.computeName} middlewares=${computeSchema.middlewares}`
      );
    }
    if (computeSchema.middlewares?.some((value) => typeof value !== "function")) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid middlewares for computeName=${computeSchema.computeName} middlewares=[${computeSchema.middlewares}]`
      );
    }
    if (computeSchema.dependsOn && !Array.isArray(computeSchema.dependsOn)) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid dependsOn for computeName=${computeSchema.computeName} dependsOn=${computeSchema.dependsOn}`
      );
    }
    if (computeSchema.dependsOn?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid dependsOn for computeName=${computeSchema.computeName} dependsOn=[${computeSchema.dependsOn}]`
      );
    }
  };

  /**
   * @method register
   * @description Registers a compute schema with validation.
   * @param {ComputeName} key - The name of the compute schema.
   * @param {IComputeSchema} value - The compute schema to register.
   */
  public register = (key: ComputeName, value: IComputeSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * @method override
   * @description Overrides an existing compute schema with new values.
   * @param {ComputeName} key - The name of the compute schema to override.
   * @param {Partial<IComputeSchema>} value - The partial compute schema to apply.
   * @returns {IComputeSchema} The updated compute schema.
   */
  public override = (key: ComputeName, value: Partial<IComputeSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * @method get
   * @description Retrieves a compute schema by its name.
   * @param {ComputeName} key - The name of the compute schema.
   * @returns {IComputeSchema} The compute schema.
   */
  public get = (key: ComputeName): IComputeSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * @export
 * @default ComputeSchemaService
 * @description Exports the ComputeSchemaService class as the default export.
 */
export default ComputeSchemaService;
