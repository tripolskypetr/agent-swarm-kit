import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  OutlineName,
  IOutlineSchema,
} from "../../../interfaces/Outline.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

export class OutlineValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private _outlineMap = new Map<OutlineName, IOutlineSchema>();

  public addOutline = (
    outlineName: OutlineName,
    outlineSchema: IOutlineSchema
  ): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("outlineValidationService addOutline", {
        outlineName,
        outlineSchema,
      });
    if (this._outlineMap.has(outlineName)) {
      throw new Error(`agent-swarm outline ${outlineName} already exist`);
    }
    this._outlineMap.set(outlineName, outlineSchema);
  };

  public validate = memoize(
    ([outlineName]) => outlineName,
    (outlineName: OutlineName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("outlineValidationService validate", {
          outlineName,
          source,
        });
      const outline = this._outlineMap.get(outlineName);
      if (!outline) {
        throw new Error(
          `agent-swarm outline ${outlineName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (outlineName: OutlineName, source: string) => void;
}

export default OutlineValidationService;
