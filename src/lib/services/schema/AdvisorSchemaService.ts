import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IAdvisorSchema, AdvisorName } from "../../../interfaces/Advisor.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * @class AdvisorSchemaService
 * Service for managing advisor schema registrations and retrieval
*/
export class AdvisorSchemaService {
  /**
   * @readonly
   * Injected logger service instance
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
   * @private
   * Registry for storing advisor schemas
   */
  private _registry = new ToolRegistry<Record<AdvisorName, IAdvisorSchema>>(
    "advisorSchemaService"
  );

  /**
   * Retrieves the current registry instance for advisor schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.advisorSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for advisor schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   */
  public set registry(value: ToolRegistry<Record<AdvisorName, IAdvisorSchema>>) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.advisorSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates basic requirements of an advisor schema
   * @private
   * @throws {Error} If validation fails
   */
  private validateShallow = (advisorSchema: IAdvisorSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`advisorSchemaService validateShallow`, {
        advisorSchema,
      });
    if (typeof advisorSchema.advisorName !== "string") {
      throw new Error(
        `agent-swarm advisor schema validation failed: missing advisorName`
      );
    }
    if (typeof advisorSchema.getChat !== "function") {
      throw new Error(
        `agent-swarm advisor schema validation failed: missing getChat for advisorName=${advisorSchema.advisorName}`
      );
    }
  };

  /**
   * Registers an advisor schema with a given key
   * @public
   */
  public register = (key: AdvisorName, value: IAdvisorSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`advisorSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing advisor schema with a new value for a given key
   * @public
   * Logs the override operation and updates the registry with the new schema
   */
  public override = (key: AdvisorName, value: Partial<IAdvisorSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`advisorSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves an advisor schema by key
   * @public
   */
  public get = (key: AdvisorName): IAdvisorSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`advisorSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * @exports AdvisorSchemaService
 * Default export of AdvisorSchemaService class
*/
export default AdvisorSchemaService;
