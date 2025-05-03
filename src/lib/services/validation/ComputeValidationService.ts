/**
 * @module ComputeValidationService
 * @description Service for managing and validating compute schemas, including dependency checks and shared state validation.
 */

import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  IComputeSchema,
  ComputeName,
} from "../../../interfaces/Compute.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";
import StateValidationService from "./StateValidationService";
import StateSchemaService from "../schema/StateSchemaService";

/**
 * @class ComputeValidationService
 * @description Manages compute schema validation, registration, and dependency validation with memoized checks.
 */
export class ComputeValidationService {
  /**
   * @property {LoggerService} loggerService
   * @description Injected logger service for logging operations.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @property {StateValidationService} stateValidationService
   * @description Injected service for validating state schemas.
   * @private
   */
  private readonly stateValidationService = inject<StateValidationService>(
    TYPES.stateValidationService
  );

  /**
   * @property {StateSchemaService} stateSchemaService
   * @description Injected service for accessing state schemas.
   * @private
   */
  private readonly stateSchemaService = inject<StateSchemaService>(
    TYPES.stateSchemaService
  );

  /**
   * @property {Map<ComputeName, IComputeSchema>} _computeMap
   * @description Map storing compute schemas by compute name.
   * @private
   */
  private _computeMap = new Map<ComputeName, IComputeSchema>();

  /**
   * @method addCompute
   * @description Adds a compute schema to the map, ensuring no duplicates.
   * @param {ComputeName} computeName - The name of the compute.
   * @param {IComputeSchema} computeSchema - The compute schema to register.
   * @throws {Error} If the compute name already exists.
   */
  public addCompute = (
    computeName: ComputeName,
    computeSchema: IComputeSchema
  ): void => {
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

  /**
   * @method getComputeList
   * @description Retrieves a list of all registered compute names.
   * @returns {ComputeName[]} Array of compute names.
   */
  public getComputeList = () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("computeValidationService getComputeList");
    return Array.from(this._computeMap.keys());
  };

  /**
   * @method validate
   * @description Validates a compute schema and its dependencies, memoized by compute name.
   * @param {ComputeName} computeName - The name of the compute to validate.
   * @param {string} source - The source context for the validation.
   * @throws {Error} If the compute is not found or if shared compute depends on non-shared states.
   */
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
      if (compute.shared) {
        compute.dependsOn?.forEach((stateName) => {
          const { shared } = this.stateSchemaService.get(stateName);
          if (!shared) {
            throw new Error(
              `agent-swarm compute ${computeName} depends on state ${stateName} but it is not shared source=${source}`
            );
          }
        });
      }
    }
  ) as (computeName: ComputeName, source: string) => void;
}

/**
 * @export
 * @default ComputeValidationService
 * @description Exports the ComputeValidationService class as the default export.
 */
export default ComputeValidationService;
