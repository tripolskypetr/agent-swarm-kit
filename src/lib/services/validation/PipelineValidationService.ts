import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IPipelineSchema, PipelineName } from "../../../model/Pipeline.model";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

export class PipelineValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private _pipelineMap = new Map<PipelineName, IPipelineSchema>();

  public addPipeline = (pipelineName: PipelineName, pipelineSchema: IPipelineSchema): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("pipelineValidationService addPipeline", {
        pipelineName,
        pipelineSchema,
      });
    if (this._pipelineMap.has(pipelineName)) {
      throw new Error(`agent-swarm pipeline ${pipelineName} already exist`);
    }
    this._pipelineMap.set(pipelineName, pipelineSchema);
  };

  public validate = memoize(
    ([pipelineName]) => pipelineName,
    (pipelineName: PipelineName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("pipelineValidationService validate", {
          pipelineName,
          source,
        });
      if (!this._pipelineMap.has(pipelineName)) {
        throw new Error(
          `agent-swarm pipeline ${pipelineName} not found source=${source}`
        );
      }
    }
  ) as (pipelineName: PipelineName, source: string) => void;
}

export default PipelineValidationService;