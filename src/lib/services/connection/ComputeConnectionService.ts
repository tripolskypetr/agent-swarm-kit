/**
 * @module ComputeConnectionService
 * @description Manages compute instances and their lifecycle, integrating with dependency injection and state management.
 */

import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { memoize } from "functools-kit";
import { TMethodContextService } from "../context/MethodContextService";
import ClientCompute from "../../../client/ClientCompute";
import ComputeSchemaService from "../schema/ComputeSchemaService";
import { GLOBAL_CONFIG } from "../../../config/params";
import {
  ICompute,
  IComputeData,
  ComputeName,
} from "../../../interfaces/Compute.interface";
import SessionValidationService from "../validation/SessionValidationService";
import BusService from "../base/BusService";
import SharedComputeConnectionService from "./SharedComputeConnectionService";
import { StateName } from "../../../interfaces/State.interface";
import StateConnectionService from "./StateConnectionService";

/**
 * @constant {number} DEFAULT_COMPUTE_TTL
 * @description Default time-to-live (TTL) for compute instances, set to 24 hours.
 */
const DEFAULT_COMPUTE_TTL = 24 * 60 * 60 * 1_000;

/**
 * @class ComputeConnectionService
 * @template T - Type extending IComputeData.
 * @implements {ICompute<T>}
 * @description Service for managing compute instances, handling shared and non-shared computations.
 */
export class ComputeConnectionService<T extends IComputeData = IComputeData>
  implements ICompute<T>
{
  /**
   * @property {LoggerService} loggerService
   * @description Injected logger service for logging operations.
   * @private
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * @property {BusService} busService
   * @description Injected bus service for event communication.
   * @private
   */
  private readonly busService = inject<BusService>(TYPES.busService);

  /**
   * @property {TMethodContextService} methodContextService
   * @description Injected service for accessing method context.
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * @property {ComputeSchemaService} computeSchemaService
   * @description Injected service for accessing compute schemas.
   * @private
   */
  private readonly computeSchemaService = inject<ComputeSchemaService>(
    TYPES.computeSchemaService
  );

  /**
   * @property {SessionValidationService} sessionValidationService
   * @description Injected service for session validation and compute usage tracking.
   * @private
   */
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );

  /**
   * @property {StateConnectionService} stateConnectionService
   * @description Injected service for managing state connections.
   * @private
   */
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );

  /**
   * @property {SharedComputeConnectionService} sharedComputeConnectionService
   * @description Injected service for managing shared compute instances.
   * @private
   */
  private readonly sharedComputeConnectionService =
    inject<SharedComputeConnectionService>(
      TYPES.sharedComputeConnectionService
    );

  /**
   * @property {Set<ComputeName>} _sharedComputeSet
   * @description Tracks compute names that are shared.
   * @private
   */
  private _sharedComputeSet = new Set<ComputeName>();

  /**
   * @method getComputeRef
   * @description Retrieves or creates a compute instance, memoized by client ID and compute name.
   * @param {string} clientId - The client identifier.
   * @param {ComputeName} computeName - The name of the compute.
   * @returns {ClientCompute} The compute instance.
   */
  public getComputeRef = memoize(
    ([clientId, computeName]) => `${clientId}-${computeName}`,
    (clientId: string, computeName: ComputeName) => {
      this.sessionValidationService.addComputeUsage(clientId, computeName);
      const {
        getComputeData,
        dependsOn = [],
        middlewares = [],
        callbacks,
        ttl = DEFAULT_COMPUTE_TTL,
        shared = false,
      } = this.computeSchemaService.get(computeName);
      if (shared) {
        this._sharedComputeSet.add(computeName);
        return this.sharedComputeConnectionService.getComputeRef(computeName);
      }
      return new ClientCompute({
        clientId,
        computeName,
        logger: this.loggerService,
        bus: this.busService,
        getComputeData,
        binding: dependsOn.map((stateName) =>
          this.stateConnectionService.getStateRef(clientId, stateName)
        ),
        ttl,
        dependsOn,
        middlewares,
        callbacks,
      });
    }
  );

  /**
   * @method getComputeData
   * @description Retrieves the computed data for the current context.
   * @returns {Promise<T>} The computed data.
   * @async
   */
  public getComputeData = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeConnectionService getComputeData`);
    const compute = this.getComputeRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.computeName
    );
    return await compute.getComputeData();
  };

  /**
   * @method calculate
   * @description Triggers a recalculation for the compute instance based on a state change.
   * @param {StateName} stateName - The name of the state that changed.
   * @returns {Promise<void>}
   * @async
   */
  public calculate = async (stateName: StateName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeConnectionService calculate`);
    const compute = this.getComputeRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.computeName
    );
    return await compute.calculate(stateName);
  };

  /**
   * @method update
   * @description Forces an update of the compute instance.
   * @returns {Promise<void>}
   * @async
   */
  public update = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeConnectionService update`);
    const compute = this.getComputeRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.computeName
    );
    return await compute.update();
  };

  /**
   * @method dispose
   * @description Cleans up the compute instance and removes it from the cache.
   * @returns {Promise<void>}
   * @async
   */
  public dispose = async (): Promise<void> => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeConnectionService dispose`);
    const key = `${this.methodContextService.context.clientId}-${this.methodContextService.context.computeName}`;
    if (!this.getComputeRef.has(key)) {
      return;
    }
    if (
      !this._sharedComputeSet.has(this.methodContextService.context.computeName)
    ) {
      const compute = this.getComputeRef(
        this.methodContextService.context.clientId,
        this.methodContextService.context.computeName
      );
      await compute.dispose();
    }
    this.getComputeRef.clear(key);
    this.sessionValidationService.removeComputeUsage(
      this.methodContextService.context.clientId,
      this.methodContextService.context.computeName
    );
  };
}

/**
 * @export
 * @default ComputeConnectionService
 * @description Exports the ComputeConnectionService class as the default export.
 */
export default ComputeConnectionService;
