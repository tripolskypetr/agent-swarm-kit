import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { WikiName, IWikiSchema } from "../../../interfaces/Wiki.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * @class WikiValidationService
 * Service for managing and validating wiki configurations
*/
export class WikiValidationService {
  /**
   * @private
   * @readonly
   * Injected logger service instance
  */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @private
   * Map storing wiki schemas by wiki name
  */
  private _wikiMap = new Map<WikiName, IWikiSchema>();

  /**
   * Adds a wiki schema to the validation service
   * @public
   * @throws {Error} If wikiName already exists
  */
  public addWiki = (wikiName: WikiName, wikiSchema: IWikiSchema): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("wikiValidationService addWiki", {
        wikiName,
        wikiSchema,
      });
    if (this._wikiMap.has(wikiName)) {
      throw new Error(`agent-swarm wiki ${wikiName} already exist`);
    }
    this._wikiMap.set(wikiName, wikiSchema);
  };

  /**
   * Validates the existence of a wiki
   * @public
   * @throws {Error} If wikiName is not found
   * Memoized function to cache validation results
  */
  public validate = memoize(
    ([wikiName]) => wikiName,
    (wikiName: WikiName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("wikiValidationService validate", {
          wikiName,
          source,
        });
      const wiki = this._wikiMap.get(wikiName);
      if (!wiki) {
        throw new Error(
          `agent-swarm wiki ${wikiName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (wikiName: WikiName, source: string) => void;
}

/**
 * @exports WikiValidationService
 * Default export of WikiValidationService class
*/
export default WikiValidationService;
