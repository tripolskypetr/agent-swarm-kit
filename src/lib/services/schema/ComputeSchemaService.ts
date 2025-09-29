/**
 * @module ComputeSchemaService
 * Manages compute schema registration, validation, and retrieval using a tool registry.
 */

import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import {
  IComputeSchema,
  ComputeName,
} from "../../../interfaces/Compute.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, {
  TSchemaContextService,
} from "../context/SchemaContextService";

/**
 * @class ComputeSchemaService
 * Service for managing compute schemas, including registration, validation, and retrieval.
 */
export class ComputeSchemaService {
  /**
   * @property {LoggerService} loggerService
   * Injected logger service for logging operations.
   * @readonly
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Schema context service instance, injected via DI, for managing schema-related context operations.
   * Provides utilities and methods to interact with schema contexts, supporting schema validation, retrieval, and updates.
   * @readonly
   */
  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  /**
   * @property {ToolRegistry<Record<ComputeName, IComputeSchema>>} registry
   * Registry for storing compute schemas.
   * @private
   */
  private _registry = new ToolRegistry<Record<ComputeName, IComputeSchema>>(
    "computeSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.computeSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   */
  public set registry(
    value: ToolRegistry<Record<ComputeName, IComputeSchema>>
  ) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.computeSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * @method validateShallow
   * Performs shallow validation of a compute schema.
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
    if (computeSchema.ttl && typeof computeSchema.ttl !== "number") {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid ttl`
      );
    }
    if (typeof computeSchema.getComputeData !== "function") {
      throw new Error(
        `agent-swarm compute schema validation failed: missing getComputeData for computeName=${computeSchema.computeName}`
      );
    }
    if (
      computeSchema.middlewares &&
      !Array.isArray(computeSchema.middlewares)
    ) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid middlewares for computeName=${computeSchema.computeName} middlewares=${computeSchema.middlewares}`
      );
    }
    if (
      computeSchema.middlewares?.some((value) => typeof value !== "function")
    ) {
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
   * Registers a compute schema with validation.
   */
  public register = (key: ComputeName, value: IComputeSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * @method override
   * Overrides an existing compute schema with new values.
   */
  public override = (key: ComputeName, value: Partial<IComputeSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * @method get
   * Retrieves a compute schema by its name.
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
 * Exports the ComputeSchemaService class as the default export.
 */
export default ComputeSchemaService;
