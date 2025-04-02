import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IWikiSchema, WikiName } from "../../../interfaces/Wiki.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * @class WikiSchemaService
 * @description Service for managing wiki schema registrations and retrieval
 */
export class WikiSchemaService {
  /** 
   * @readonly 
   * @description Injected logger service instance
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /** 
   * @private 
   * @description Registry for storing wiki schemas
   */
  private registry = new ToolRegistry<Record<WikiName, IWikiSchema>>(
    "wikiSchemaService"
  );

  /**
   * Validates basic requirements of a wiki schema
   * @private
   * @param {IWikiSchema} wikiSchema - The wiki schema to validate
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
   * @param {WikiName} key - The key to register the schema under
   * @param {IWikiSchema} value - The wiki schema to register
   */
  public register = (key: WikiName, value: IWikiSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`wikiSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Retrieves a wiki schema by key
   * @public
   * @param {WikiName} key - The key of the schema to retrieve
   * @returns {IWikiSchema} The registered wiki schema
   */
  public get = (key: WikiName): IWikiSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`wikiSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * @exports WikiSchemaService
 * @description Default export of WikiSchemaService class
 */
export default WikiSchemaService;
