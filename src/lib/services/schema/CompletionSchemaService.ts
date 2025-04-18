import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ToolRegistry } from "functools-kit";
import {
  ICompletionSchema,
  CompletionName,
} from "../../../interfaces/Completion.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service class for managing completion schemas in the swarm system.
 * Provides a centralized registry for storing and retrieving ICompletionSchema instances using ToolRegistry from functools-kit, with shallow validation to ensure schema integrity.
 * Integrates with AgentSchemaService (completions referenced in agent schemas), ClientAgent (execution using completion functions), AgentConnectionService (agent instantiation with completions), and SwarmConnectionService (swarm-level agent execution).
 * Uses LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) during registration, retrieval, and validation operations.
 * Serves as a foundational service for defining completion logic (e.g., getCompletion functions) used by agents within the swarm ecosystem.
 */
export class CompletionSchemaService {
  /**
   * Logger service instance, injected via DI, for logging completion schema operations.
   * Used in validateShallow, register, and get methods when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with AgentSchemaService and PerfService logging patterns.
   * @type {LoggerService}
   * @readonly
   */
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Registry instance for storing completion schemas, initialized with ToolRegistry from functools-kit.
   * Maps CompletionName keys to ICompletionSchema values, providing efficient storage and retrieval, used in register and get methods.
   * Immutable once set, updated via ToolRegistry’s register method to maintain a consistent schema collection.
   * @type {ToolRegistry<Record<CompletionName, ICompletionSchema>>}
   * @private
   */
  private registry = new ToolRegistry<
    Record<CompletionName, ICompletionSchema>
  >("completionSchemaService");

  /**
   * Validates a completion schema shallowly, ensuring required fields meet basic integrity constraints.
   * Checks completionName as a string and getCompletion as a function, critical for agent execution in ClientAgent.
   * Logs validation attempts via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentConnectionService’s schema-driven needs.
   * Supports ClientAgent execution by ensuring completion schema validity before registration.
   * @param {ICompletionSchema} completionSchema - The completion schema to validate, sourced from Completion.interface.
   * @throws {Error} If any validation check fails, with detailed messages including completionName.
   * @private
   */
  private validateShallow = (completionSchema: ICompletionSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`completionSchemaService validateShallow`, {
        completionSchema,
      });
    if (typeof completionSchema.completionName !== "string") {
      throw new Error(
        `agent-swarm completion schema validation failed: missing completionName`
      );
    }
    if (typeof completionSchema.getCompletion !== "function") {
      throw new Error(
        `agent-swarm completion schema validation failed: missing getCompletion for completionName=${completionSchema.completionName}`
      );
    }
  };

  /**
   * Registers a new completion schema in the registry after validation.
   * Validates the schema using validateShallow, then adds it to the ToolRegistry under the provided key (completionName).
   * Logs the registration via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, aligning with AgentSchemaService’s completion references.
   * Supports ClientAgent execution by providing validated completion schemas to AgentConnectionService and SwarmConnectionService.
   * @param {CompletionName} key - The name of the completion, used as the registry key, sourced from Completion.interface.
   * @param {ICompletionSchema} value - The completion schema to register, sourced from Completion.interface, validated before storage.
   * @throws {Error} If validation fails in validateShallow, propagated with detailed error messages.
   */
  public register = (key: CompletionName, value: ICompletionSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`completionSchemaService register`, { key });
    this.validateShallow(value);
    this.registry = this.registry.register(key, value);
  };

  /**
   * Overrides an existing completion schema in the registry with a new one.
   * Replaces the schema associated with the provided key in the ToolRegistry.
   * Logs the override operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports dynamic updates to completion schemas used by AgentSchemaService, ClientAgent, and other swarm components.
   * @param {CompletionName} key - The name of the completion to override, sourced from Completion.interface.
   * @param {ICompletionSchema} value - The new completion schema to replace the existing one, sourced from Completion.interface.
   * @throws {Error} If the key does not exist in the registry (inherent to ToolRegistry.override behavior).
   */
  public override = (key: CompletionName, value: Partial<ICompletionSchema>) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`completionSchemaService override`, { key });
    this.registry = this.registry.override(key, value);
    return this.registry.get(key);
  };

  /**
   * Retrieves a completion schema from the registry by its name.
   * Fetches the schema from ToolRegistry using the provided key, logging the operation via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * Supports AgentConnectionService’s agent instantiation by providing completion logic (getCompletion) referenced in AgentSchemaService schemas, and ClientAgent’s execution flow.
   * @param {CompletionName} key - The name of the completion to retrieve, sourced from Completion.interface.
   * @returns {ICompletionSchema} The completion schema associated with the key, sourced from Completion.interface, including the getCompletion function.
   * @throws {Error} If the key is not found in the registry (inherent to ToolRegistry.get behavior).
   */
  public get = (key: CompletionName): ICompletionSchema => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info(`completionSchemaService get`, { key });
    return this.registry.get(key);
  };
}

/**
 * Default export of the CompletionSchemaService class.
 * Provides the primary service for managing completion schemas in the swarm system, integrating with AgentSchemaService, ClientAgent, AgentConnectionService, and SwarmConnectionService, with validated schema storage via ToolRegistry.
 * @type {typeof CompletionSchemaService}
 */
export default CompletionSchemaService;
