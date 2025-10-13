import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { AdvisorName, IAdvisorSchema } from "../../../interfaces/Advisor.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * @class AdvisorValidationService
 * Service for managing and validating advisor configurations
*/
export class AdvisorValidationService {
  /**
   * @private
   * @readonly
   * Injected logger service instance
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @private
   * Map storing advisor schemas by advisor name
   */
  private _advisorMap = new Map<AdvisorName, IAdvisorSchema>();

  /**
   * Adds an advisor schema to the validation service
   * @public
   * @throws {Error} If advisorName already exists
   */
  public addAdvisor = (advisorName: AdvisorName, advisorSchema: IAdvisorSchema): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("advisorValidationService addAdvisor", {
        advisorName,
        advisorSchema,
      });
    if (this._advisorMap.has(advisorName)) {
      throw new Error(`agent-swarm advisor ${advisorName} already exist`);
    }
    this._advisorMap.set(advisorName, advisorSchema);
  };

  /**
   * Validates the existence of an advisor
   * @public
   * @throws {Error} If advisorName is not found
   * Memoized function to cache validation results
   */
  public validate = memoize(
    ([advisorName]) => advisorName,
    (advisorName: AdvisorName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("advisorValidationService validate", {
          advisorName,
          source,
        });
      const advisor = this._advisorMap.get(advisorName);
      if (!advisor) {
        throw new Error(
          `agent-swarm advisor ${advisorName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (advisorName: AdvisorName, source: string) => void;
}

/**
 * @exports AdvisorValidationService
 * Default export of AdvisorValidationService class
*/
export default AdvisorValidationService;
