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

export class ComputeConnectionService<T extends IComputeData = IComputeData>
  implements ICompute<T>
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );
  private readonly computeSchemaService = inject<ComputeSchemaService>(
    TYPES.computeSchemaService
  );
  private readonly sessionValidationService = inject<SessionValidationService>(
    TYPES.sessionValidationService
  );
  private readonly stateConnectionService = inject<StateConnectionService>(
    TYPES.stateConnectionService
  );
  private readonly sharedComputeConnectionService =
    inject<SharedComputeConnectionService>(
      TYPES.sharedComputeConnectionService
    );
  private _sharedComputeSet = new Set<ComputeName>();

  public getComputeRef = memoize(
    ([clientId, computeName]) => `${clientId}-${computeName}`,
    (clientId: string, computeName: ComputeName) => {
      this.sessionValidationService.addComputeUsage(clientId, computeName);
      const {
        getComputeData,
        dependsOn = [],
        middlewares = [],
        callbacks,
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
        dependsOn,
        middlewares,
        callbacks,
      });
    }
  );

  public getComputeData = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeConnectionService getComputeData`);
    const compute = this.getComputeRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.computeName
    );
    return await compute.getComputeData();
  };

  public calculate = async (stateName: StateName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeConnectionService calculate`);
    const compute = this.getComputeRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.computeName
    );
    return await compute.calculate(stateName);
  };

  public update = async (clientId: string, computeName: ComputeName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeConnectionService update`);
    const compute = this.getComputeRef(
      this.methodContextService.context.clientId,
      this.methodContextService.context.computeName
    );
    return await compute.update(clientId, computeName);
  };

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

export default ComputeConnectionService;
