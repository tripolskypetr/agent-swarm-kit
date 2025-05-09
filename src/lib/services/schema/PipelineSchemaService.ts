import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { GLOBAL_CONFIG } from "../../../config/params";
import { ToolRegistry } from "functools-kit";
import { IPipelineSchema, PipelineName } from "../../../model/Pipeline.model";

export class PipelineSchemaService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry<Record<PipelineName, IPipelineSchema>>(
    "pipelineSchemaService"
  );

  private validateShallow = (pipelineSchema: IPipelineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService validateShallow`, {
        pipelineSchema,
      });
    if (typeof pipelineSchema.pipelineName !== "string") {
      throw new Error(
        `agent-swarm pipeline schema validation failed: missing pipelineName`
      );
    }
    if (typeof pipelineSchema.execute !== "function") {
      throw new Error(
        `agent-swarm pipeline schema validation failed: missing execute`
      );
    }
  };

  public register = (key: PipelineName, value: IPipelineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  public override = (key: PipelineName, value: Partial<IPipelineSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  public get = (key: PipelineName): IPipelineSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`pipelineSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default PipelineSchemaService;
