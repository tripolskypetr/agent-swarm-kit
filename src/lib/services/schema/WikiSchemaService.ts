import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IWikiSchema, WikiName } from "../../../interfaces/Wiki.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, { TSchemaContextService } from "../context/SchemaContextService";

/**
 * @class WikiSchemaService
 * Service for managing wiki schema registrations and retrieval
 */
export class WikiSchemaService {
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
   * Registry for storing wiki schemas
   */
  private _registry = new ToolRegistry<Record<WikiName, IWikiSchema>>(
    "wikiSchemaService"
  );

  /**
   * Retrieves the current registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it returns the registry from the context.
   * Otherwise, it falls back to the private `_registry` instance.
   */
  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.wikiSchemaService;
    }
    return this._registry;
  }

  /**
   * Sets the registry instance for agent schemas.
   * If a schema context is available via `SchemaContextService`, it updates the registry in the context.
   * Otherwise, it updates the private `_registry` instance.
   */
  public set registry(value: ToolRegistry<Record<WikiName, IWikiSchema>>) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.wikiSchemaService = value;
      return;
    }
    this._registry = value;
  }

  /**
   * Validates basic requirements of a wiki schema
   * @private
   * @throws {Error} If validation fails
   */
  private validateShallow = (wikiSchema: IWikiSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`wikiSchemaService validateShallow`, {
        wikiSchema,
      });
    if (typeof wikiSchema.wikiName !== "string") {
      throw new Error(
        `agent-swarm wiki schema validation failed: missing wikiName`
      );
    }
    if (typeof wikiSchema.getChat !== "function") {
      throw new Error(
        `agent-swarm wiki schema validation failed: missing getChat for wikiName=${wikiSchema.wikiName}`
      );
    }
  };

  /**
   * Registers a wiki schema with a given key
   * @public
   */
  public register = (key: WikiName, value: IWikiSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`wikiSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing wiki schema with a new value for a given key
   * @public
   * Logs the override operation and updates the registry with the new schema
   */
  public override = (key: WikiName, value: Partial<IWikiSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`wikiSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves a wiki schema by key
   * @public
   */
  public get = (key: WikiName): IWikiSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`wikiSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * @exports WikiSchemaService
 * Default export of WikiSchemaService class
 */
export default WikiSchemaService;
