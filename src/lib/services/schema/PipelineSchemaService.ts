/**
 * @module PipelineSchemaService
 * @description Manages pipeline schema registration, validation, and retrieval using a tool registry.
 */

import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import { ToolRegistry } from "functools-kit";
import { IPipelineSchema, PipelineName } from "../../../model/Pipeline.model";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * @class PipelineSchemaService
 * @description Service for managing pipeline schemas, including registration, validation, and retrieval.
 */
export class PipelineSchemaService {
  /**
   * @property {LoggerService} loggerService
   * @description Injected logger service for logging operations.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Schema context service instance, injected via DI, for managing schema-related context operations.
   * Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.
   * @type {TSchemaContextService}
   * @readonly
   */
  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  /**
   * @property {ToolRegistry<Record<PipelineName, IPipelineSchema>>} registry
   * @description Registry for storing pipeline schemas.
   * @private
   */
  private _registry = new ToolRegistry<Record<PipelineName, IPipelineSchema>>(
    "pipelineSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.pipelineSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   */
  public set registry(
    value: ToolRegistry<Record<PipelineName, IPipelineSchema>>
  ) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.pipelineSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * @method validateShallow
   * @description Performs shallow validation of a pipeline schema.
   * @param {IPipelineSchema} pipelineSchema - The pipeline schema to validate.
   * @throws {Error} If validation fails for pipelineName or execute.
   * @private
   */
  private validateShallow = (pipelineSchema: IPipelineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService validateShallow`, {
        pipelineSchema,
      });
    if (typeof pipelineSchema.pipelineName !== "string") {
      throw new Error(
        `agent-swarm pipeline schema validation failed: missing pipelineName`
      );
    }
    if (typeof pipelineSchema.execute !== "function") {
      throw new Error(
        `agent-swarm pipeline schema validation failed: missing execute`
      );
    }
  };

  /**
   * @method register
   * @description Registers a pipeline schema with validation.
   * @param {PipelineName} key - The name of the pipeline schema.
   * @param {IPipelineSchema} value - The pipeline schema to register.
   */
  public register = (key: PipelineName, value: IPipelineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * @method override
   * @description Overrides an existing pipeline schema with new values.
   * @param {PipelineName} key - The name of the pipeline schema to override.
   * @param {Partial<IPipelineSchema>} value - The partial pipeline schema to apply.
   * @returns {IPipelineSchema} The updated pipeline schema.
   */
  public override = (key: PipelineName, value: Partial<IPipelineSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * @method get
   * @description Retrieves a pipeline schema by its name.
   * @param {PipelineName} key - The name of the pipeline schema.
   * @returns {IPipelineSchema} The pipeline schema.
   */
  public get = (key: PipelineName): IPipelineSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * @export
 * @default PipelineSchemaService
 * @description Exports the PipelineSchemaService class as the default export.
 */
export default PipelineSchemaService;
