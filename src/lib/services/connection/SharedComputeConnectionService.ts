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

export class SharedComputeConnectionService<T extends IComputeData = IComputeData>
  implements ICompute<T>
{
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );
  private readonly sharedStateConnectionService = inject<SharedStateConnectionService>(
    TYPES.sharedStateConnectionService
  );
  private readonly computeSchemaService = inject<ComputeSchemaService>(
    TYPES.computeSchemaService
  );

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

  public getComputeData = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputeConnectionService getComputeData`);
    const compute = this.getComputeRef(
      this.methodContextService.context.computeName
    );
    return await compute.getComputeData();
  };

  public calculate = async (stateName: StateName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputeConnectionService calculate`);
    const compute = this.getComputeRef(
      this.methodContextService.context.computeName
    );
    return await compute.calculate(stateName);
  };

  public update = async () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`sharedComputeConnectionService update`);
    const compute = this.getComputeRef(
      this.methodContextService.context.computeName
    );
    return await compute.update();
  };
}

export default SharedComputeConnectionService;
