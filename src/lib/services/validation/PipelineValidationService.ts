/**
 * @module PipelineValidationService
 * Service for managing and validating pipeline schemas, ensuring uniqueness and existence.
*/

import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { IPipelineSchema, PipelineName } from "../../../model/Pipeline.model";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * @class PipelineValidationService
 * Manages pipeline schema validation and registration with memoized validation checks.
*/
export class PipelineValidationService {
  /**
   * @property {LoggerService} loggerService
   * Injected logger service for logging operations.
   * @private
  */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @property {Map<PipelineName, IPipelineSchema>} _pipelineMap
   * Map storing pipeline schemas by pipeline name.
   * @private
  */
  private _pipelineMap = new Map<PipelineName, IPipelineSchema>();

  /**
   * @method addPipeline
   * Adds a pipeline schema to the map, ensuring no duplicates.
   * @throws {Error} If the pipeline name already exists.
  */
  public addPipeline = (
    pipelineName: PipelineName,
    pipelineSchema: IPipelineSchema
  ): void => {
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

  /**
   * @method validate
   * Validates the existence of a pipeline, memoized by pipeline name.
   * @throws {Error} If the pipeline is not found.
  */
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
      return true as never;
    }
  ) as (pipelineName: PipelineName, source: string) => void;
}

/**
 * @export
 * @default PipelineValidationService
 * Exports the PipelineValidationService class as the default export.
*/
export default PipelineValidationService;
