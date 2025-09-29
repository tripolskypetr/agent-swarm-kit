import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { CompletionName } from "../../../interfaces/Completion.interface";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating completion names within the swarm system.
 * Manages a set of registered completion names, ensuring their uniqueness and existence during validation.
 * Integrates with CompletionSchemaService (completion registration), AgentValidationService (agent completion validation),
 * ClientAgent (completion usage), and LoggerService (logging).
 * Uses dependency injection for the logger and memoization for efficient validation checks.
 */
export class CompletionValidationService {
  /**
   * Logger service instance for logging validation operations and errors.
   * Injected via DI, used for info-level logging controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @private
   * @readonly
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Set of registered completion names, used to track and validate completions.
   * Populated by addCompletion, queried by validate.
   * @private
   */
  private _completionSet = new Set<CompletionName>();

  /**
   * Registers a new completion name in the validation service.
   * Logs the operation and ensures uniqueness, supporting CompletionSchemaService’s registration process.
   * @throws {Error} If the completion name already exists in _completionSet.
   */
  public addCompletion = (completionName: CompletionName): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("completionValidationService addCompletion", {
        completionName,
      });
    if (this._completionSet.has(completionName)) {
      throw new Error(`agent-swarm completion ${completionName} already exist`);
    }
    this._completionSet.add(completionName);
  };

  /**
   * Validates if a completion name exists in the registered set, memoized by completionName for performance.
   * Logs the operation and checks existence, supporting AgentValidationService’s validation of agent completions.
   * @throws {Error} If the completion name is not found in _completionSet.
   */
  public validate = memoize(
    ([completionName]) => completionName,
    (completionName: CompletionName, source: string): void => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("completionValidationService validate", {
          completionName,
          source,
        });
      if (!this._completionSet.has(completionName)) {
        throw new Error(
          `agent-swarm completion ${completionName} not found source=${source}`
        );
      }
      return true as never;
    }
  ) as (completionName: CompletionName, source: string) => void;
}

/**
 * Default export of the CompletionValidationService class.
 * Provides a service for validating completion names in the swarm system,
 * integrating with CompletionSchemaService, AgentValidationService, ClientAgent, and LoggerService,
 * with memoized validation and uniqueness enforcement.
 */
export default CompletionValidationService;
