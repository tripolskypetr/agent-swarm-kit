import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IComputeSchema, ComputeName } from "../../../interfaces/Compute.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";
import StateValidationService from "./StateValidationService";

export class ComputeValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly stateValidationService = inject<StateValidationService>(TYPES.stateValidationService);

  private _computeMap = new Map<ComputeName, IComputeSchema>();

  public addCompute = (computeName: ComputeName, computeSchema: IComputeSchema): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("computeValidationService addCompute", {
        computeName,
        computeSchema,
      });
    if (this._computeMap.has(computeName)) {
      throw new Error(`agent-swarm compute ${computeName} already exist`);
    }
    this._computeMap.set(computeName, computeSchema);
  };
9
  public validate = memoize(
    ([computeName]) => computeName,
    (computeName: ComputeName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("computeValidationService validate", {
          computeName,
          source,
        });
      const compute = this._computeMap.get(computeName);
      if (!compute) {
        throw new Error(
          `agent-swarm compute ${computeName} not found source=${source}`
        );
      }
      compute.dependsOn?.forEach((stateName) => {
        this.stateValidationService.validate(stateName, source);
      });
    }
  ) as (computeName: ComputeName, source: string) => void;
}

export default ComputeValidationService;