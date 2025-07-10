import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { isObject, ToolRegistry } from "functools-kit";
import {
  IOutlineSchema,
  OutlineName,
} from "../../../interfaces/Outline.interface";
import { GLOBAL_CONFIG } from "../../../config/params";
import SchemaContextService, {
  TSchemaContextService,
} from "../context/SchemaContextService";

export class OutlineSchemaService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly schemaContextService = inject<TSchemaContextService>(
    TYPES.schemaContextService
  );

  private _registry = new ToolRegistry<Record<OutlineName, IOutlineSchema>>(
    "outlineSchemaService"
  );

  public get registry() {
    if (SchemaContextService.hasContext()) {
      return this.schemaContextService.context.registry.outlineSchemaService;
    }
    return this._registry;
  }

  public set registry(
    value: ToolRegistry<Record<OutlineName, IOutlineSchema>>
  ) {
    if (SchemaContextService.hasContext()) {
      this.schemaContextService.context.registry.outlineSchemaService = value;
      return;
    }
    this._registry = value;
  }

  private validateShallow = (outlineSchema: IOutlineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService validateShallow`, {
        outlineSchema,
      });
    if (typeof outlineSchema.outlineName !== "string") {
      throw new Error(
        `agent-swarm outline schema validation failed: missing outlineName`
      );
    }
    if (typeof outlineSchema.getStructuredOutput !== "function") {
      throw new Error(
        `agent-swarm outline schema validation failed: missing getStructuredOutput for outlineName=${outlineSchema.outlineName}`
      );
    }
    if (outlineSchema.validations && !Array.isArray(outlineSchema.validations)) {
      throw new Error(
        `agent-swarm outline schema validation failed: validations is not an array for outlineName=${outlineSchema.outlineName}`
      );
    }
    if (outlineSchema.validations && !outlineSchema.validations?.some((validation) => typeof validation !== "function" && !isObject(validation))) {
      throw new Error(
        `agent-swarm outline schema validation failed: invalid validations for outlineName=${outlineSchema.outlineName}`
      );
    }
  };

  public register = (key: OutlineName, value: IOutlineSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  public override = (key: OutlineName, value: Partial<IOutlineSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  public get = (key: OutlineName): IOutlineSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`outlineSchemaService get`, { key });
    return this.registry.get(key);
  };
}

export default OutlineSchemaService;
