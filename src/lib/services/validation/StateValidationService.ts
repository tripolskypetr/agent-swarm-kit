import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IStateSchema, StateName } from "../../../interfaces/State.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

export class StateValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private _stateMap = new Map<StateName, IStateSchema>();

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
    }
  ) as (stateName: StateName, source: string) => void;
}

export default StateValidationService;
