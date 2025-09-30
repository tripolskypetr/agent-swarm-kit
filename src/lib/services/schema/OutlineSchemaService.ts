import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { isObject, ToolRegistry } from "functools-kit";
import {
  IOutlineSchema,
  OutlineName,
} from "../../../interfaces/Outline.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, {
  TSchemaContextService,
} from "../context/SchemaContextService";

/**
 * A service class for managing outline schemas within the agent swarm system.
 * Provides methods to register, override, and retrieve outline schemas, utilizing a `ToolRegistry` for storage.
 * Integrates with dependency injection and context services for logging and schema management.
 * @class
*/
export class OutlineSchemaService {
  /**
   * The logger service instance for recording service-related activity and errors.
   * Injected via dependency injection using `TYPES.loggerService`.
   * @private
  */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * The schema context service instance for managing context-specific schema registries.
   * Injected via dependency injection using `TYPES.schemaContextService`.
   * @private
  */
  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  /**
   * The internal registry for storing outline schemas, mapping `OutlineName` to `IOutlineSchema`.
   * @private
  */
  private _registry = new ToolRegistry<Record<OutlineName, IOutlineSchema>>(
    "outlineSchemaService"
  );

  /**
   * Gets the registry for outline schemas, preferring the context-specific registry if a schema context exists.
   * Falls back to the internal registry if no context is active.
  */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.outlineSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry for outline schemas, updating the context-specific registry if a schema context exists.
   * Otherwise, updates the internal registry.
  */
  public set registry(
    value: ToolRegistry<Record<OutlineName, IOutlineSchema>>
  ) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.outlineSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates an outline schema for required properties and correct types.
   * Ensures `outlineName` is a string, `getOutlineHistory` is a function, and `validations` (if present) is an array of valid validation functions or objects.
   * Logs validation attempts if `CC_LOGGER_ENABLE_INFO` is enabled.
   * @private
   * @throws {Error} If validation fails due to missing or invalid properties.
  */
  private validateShallow = (outlineSchema: IOutlineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService validateShallow`, {
        outlineSchema,
      });
    if (typeof outlineSchema.outlineName !== "string") {
      throw new Error(
        `agent-swarm outline schema validation failed: missing outlineName`
      );
    }
    if (typeof outlineSchema.completion !== "string") {
      throw new Error(
        `agent-swarm outline schema validation failed: missing completion for outlineName=${outlineSchema.outlineName}`
      );
    }
    if (typeof outlineSchema.getOutlineHistory !== "function") {
      throw new Error(
        `agent-swarm outline schema validation failed: missing getOutlineHistory for outlineName=${outlineSchema.outlineName}`
      );
    }
    if (
      outlineSchema.validations &&
      !Array.isArray(outlineSchema.validations)
    ) {
      throw new Error(
        `agent-swarm outline schema validation failed: validations is not an array for outlineName=${outlineSchema.outlineName}`
      );
    }
    if (
      outlineSchema.validations &&
      outlineSchema.validations?.some(
        (validation) =>
          typeof validation !== "function" && !isObject(validation)
      )
    ) {
      throw new Error(
        `agent-swarm outline schema validation failed: invalid validations for outlineName=${outlineSchema.outlineName}`
      );
    }
  };

  /**
   * Registers an outline schema with the specified key in the active registry.
   * Validates the schema before registration and logs the operation if `CC_LOGGER_ENABLE_INFO` is enabled.
   * @throws {Error} If the schema fails validation.
  */
  public register = (key: OutlineName, value: IOutlineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing outline schema with partial updates for the specified key.
   * Logs the operation if `CC_LOGGER_ENABLE_INFO` is enabled and returns the updated schema.
  */
  public override = (key: OutlineName, value: Partial<IOutlineSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves an outline schema by its key from the active registry.
   * Logs the operation if `CC_LOGGER_ENABLE_INFO` is enabled.
   * @throws {Error} If the schema is not found in the registry.
  */
  public get = (key: OutlineName): IOutlineSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * The default export of the OutlineSchemaService class.
 * @default
*/
export default OutlineSchemaService;
