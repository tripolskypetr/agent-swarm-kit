/**
 * @module SharedComputeConnectionService
 * @description Manages shared compute instances with dependency injection and memoized references.
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
import BusService from "../base/BusService";
import { StateName } from "../../../interfaces/State.interface";
import SharedStateConnectionService from "./SharedStateConnectionService";

/**
 * @class SharedComputeConnectionService
 * @template T - Type extending IComputeData.
 * @implements {ICompute<T>}
 * @description Service for managing shared compute instances, ensuring they are marked as shared.
 */
export class SharedComputeConnectionService<T extends IComputeData = IComputeData>
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
   * @property {SharedStateConnectionService} sharedStateConnectionService
   * @description Injected service for managing shared state connections.
   * @private
   */
  private readonly sharedStateConnectionService = inject<SharedStateConnectionService>(
    TYPES.sharedStateConnectionService
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
   * @method getComputeRef
   * @description Retrieves or creates a shared compute instance, memoized by compute name.
   * @param {ComputeName} computeName - The name of the compute.
   * @returns {ClientCompute} The shared compute instance.
   * @throws {Error} If the compute is not marked as shared.
   */
  public getComputeRef = memoize(
    ([computeName]) => `${computeName}`,
    (computeName: ComputeName) => {
      const {
        getComputeData,
        dependsOn,
        middlewares = [],
        callbacks,
        shared = false,
      } = this.computeSchemaService.get(computeName);
      if (!shared) {
        throw new Error(`agent-swarm compute not shared computeName=${computeName}`);
      }
      return new ClientCompute({
        clientId: "shared",
        computeName,
        logger: this.loggerService,
        bus: this.busService,
        getComputeData,
        binding: dependsOn.map((stateName) =>
          this.sharedStateConnectionService.getStateRef(stateName)
        ),
        dependsOn,
        middlewares,
        callbacks,
      });
    }
  );

  /**
   * @method getComputeData
   * @description Retrieves the computed data for the shared compute instance.
   * @returns {Promise<T>} The computed data.
   * @async
   */
  public getComputeData = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputeConnectionService getComputeData`);
    const compute = this.getComputeRef(
      this.methodContextService.context.computeName
    );
    return await compute.getComputeData();
  };

  /**
   * @method calculate
   * @description Triggers a recalculation for the shared compute instance based on a state change.
   * @param {StateName} stateName - The name of the state that changed.
   * @returns {Promise<void>}
   * @async
   */
  public calculate = async (stateName: StateName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputeConnectionService calculate`);
    const compute = this.getComputeRef(
      this.methodContextService.context.computeName
    );
    return await compute.calculate(stateName);
  };

  /**
   * @method update
   * @description Forces an update of the shared compute instance.
   * @returns {Promise<void>}
   * @async
   */
  public update = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputeConnectionService update`);
    const compute = this.getComputeRef(
      this.methodContextService.context.computeName
    );
    return await compute.update();
  };
}

/**
 * @export
 * @default SharedComputeConnectionService
 * @description Exports the SharedComputeConnectionService class as the default export.
 */
export default SharedComputeConnectionService;
