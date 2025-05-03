import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import { IComputeSchema, ComputeName } from "../../../interfaces/Compute.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

export class ComputeSchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<ComputeName, IComputeSchema>>(
    "computeSchemaService"
  );

  private validateShallow = (computeSchema: IComputeSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService validateShallow`, {
        computeSchema,
      });
    if (typeof computeSchema.computeName !== "string") {
      throw new Error(
        `agent-swarm compute schema validation failed: missing computeName`
      );
    }
    if (typeof computeSchema.getComputeData !== "function") {
      throw new Error(
        `agent-swarm compute schema validation failed: missing getComputeData for computeName=${computeSchema.computeName}`
      );
    }
    if (computeSchema.middlewares && !Array.isArray(computeSchema.middlewares)) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid middlewares for computeName=${computeSchema.computeName} middlewares=${computeSchema.middlewares}`
      );
    }
    if (computeSchema.middlewares?.some((value) => typeof value !== "function")) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid middlewares for computeName=${computeSchema.computeName} middlewares=[${computeSchema.middlewares}]`
      );
    }
    if (computeSchema.dependsOn && !Array.isArray(computeSchema.dependsOn)) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid dependsOn for computeName=${computeSchema.computeName} dependsOn=${computeSchema.dependsOn}`
      );
    }
    if (computeSchema.dependsOn?.some((value) => typeof value !== "string")) {
      throw new Error(
        `agent-swarm compute schema validation failed: invalid dependsOn for computeName=${computeSchema.computeName} dependsOn=[${computeSchema.dependsOn}]`
      );
    }
  };

  public register = (key: ComputeName, value: IComputeSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  public override = (key: ComputeName, value: Partial<IComputeSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  public get = (key: ComputeName): IComputeSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`computeSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default ComputeSchemaService;