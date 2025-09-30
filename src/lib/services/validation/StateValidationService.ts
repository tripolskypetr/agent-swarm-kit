/**
 * @module StateValidationService
 * Service for managing and validating state schemas, ensuring uniqueness and existence.
*/

import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IStateSchema, StateName } from "../../../interfaces/State.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * @class StateValidationService
 * Manages state schema validation and registration with memoized validation checks.
*/
export class StateValidationService {
  /**
   * @property {LoggerService} loggerService
   * Injected logger service for logging operations.
   * @private
  */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @property {Map<StateName, IStateSchema>} _stateMap
   * Map storing state schemas by state name.
   * @private
  */
  private _stateMap = new Map<StateName, IStateSchema>();

  /**
   * @method addState
   * Adds a state schema to the map, ensuring no duplicates.
   * @throws {Error} If the state name already exists.
  */
  public addState = (stateName: StateName, stateSchema: IStateSchema): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("stateValidationService addState", {
        stateName,
        stateSchema,
      });
    if (this._stateMap.has(stateName)) {
      throw new Error(`agent-swarm state ${stateName} already exist`);
    }
    this._stateMap.set(stateName, stateSchema);
  };

  /**
   * @method validate
   * Validates the existence of a state, memoized by state name.
   * @throws {Error} If the state is not found.
  */
  public validate = memoize(
    ([stateName]) => stateName,
    (stateName: StateName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("stateValidationService validate", {
          stateName,
          source,
        });
      if (!this._stateMap.has(stateName)) {
        throw new Error(
          `agent-swarm state ${stateName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (stateName: StateName, source: string) => void;
}

/**
 * @export
 * @default StateValidationService
 * Exports the StateValidationService class as the default export.
*/
export default StateValidationService;
