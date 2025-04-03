import { inject } from "../../../lib/core/di";
import { ILogger } from "../../../interfaces/Logger.interface";
import MethodContextService, {
  IMethodContext,
  TMethodContextService,
} from "../context/MethodContextService";
import TYPES from "../../../lib/core/types";
import ExecutionContextService, {
  IExecutionContext,
  TExecutionContextService,
} from "../context/ExecutionContextService";
import { singleshot } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";
import { scoped } from "di-scoped";

/**
 * A no-operation (noop) logger implementation of ILogger, used as the default common logger.
 * Provides empty log, debug, and info methods, ensuring safe fallback when no custom logger is set.
 * @type {ILogger}
 */
const NOOP_LOGGER: ILogger = {
  /**
   * Logs normal level messages, no-op implementation.
   * @param {string} topic - The topic of the log message.
   * @param {...any[]} args - The message arguments and optional context.
   */
  log() {
    void 0;
  },
  /**
   * Logs debug level messages, no-op implementation.
   * @param {string} topic - The topic of the debug message.
   * @param {...any[]} args - The message arguments and optional context.
   */
  debug() {
    void 0;
  },
  /**
   * Logs info level messages, no-op implementation.
   * @param {string} topic - The topic of the info message.
   * @param {...any[]} args - The message arguments and optional context.
   */
  info() {
    void 0;
  },
};

/**
 * A scoped context class for client-specific logging.
 * Provides a structured context containing method and execution-level metadata,
 * enabling traceability and context-aware logging for client-specific operations.
 *
 * This class is used to encapsulate and manage the logging context for a specific client,
 * ensuring that logs are enriched with relevant contextual information such as method and execution contexts.
 *
 * @param {Object} context - The logging context object.
 * @param {IMethodContext} context.methodContext - The method-level context, typically containing metadata like clientId.
 * @param {IExecutionContext} context.executionContext - The execution-level context, typically containing metadata like clientId.
 */
const ClientLoggerContext = scoped(
  class {
    constructor(
      readonly context: {
        methodContext: IMethodContext;
        executionContext: IExecutionContext;
      }
    ) {}
  }
);

/**
 * Service class implementing the ILogger interface to provide logging functionality in the swarm system.
 * Handles log, debug, and info messages with context awareness using MethodContextService and ExecutionContextService, routing logs to both a client-specific logger (via GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER) and a common logger.
 * Integrates with ClientAgent (e.g., debug logging in RUN_FN), PerfService (e.g., info logging in startExecution), and DocService (e.g., info logging in dumpDocs), controlled by GLOBAL_CONFIG logging flags (e.g., CC_LOGGER_ENABLE_DEBUG).
 * Supports runtime logger replacement via setLogger, enhancing flexibility across the system.
 */
export class LoggerService implements ILogger {
  /**
   * Method context service instance, injected via DI, providing method-level context (e.g., clientId).
   * Used in log, debug, and info to attach method-specific metadata, aligning with ClientAgent’s method execution context.
   * @type {TMethodContextService}
   * @private
   */
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );

  /**
   * Execution context service instance, injected via DI, providing execution-level context (e.g., clientId).
   * Used in log, debug, and info to attach execution-specific metadata, complementing ClientAgent’s execution workflows (e.g., EXECUTE_FN).
   * @type {TExecutionContextService}
   * @private
   */
  private readonly executionContextService = inject<TExecutionContextService>(
    TYPES.executionContextService
  );

  /**
   * The common logger instance, defaults to NOOP_LOGGER, used for system-wide logging.
   * Updated via setLogger, receives all log messages alongside client-specific loggers, ensuring a fallback logging mechanism.
   * @type {ILogger}
   * @private
   */
  private _commonLogger: ILogger = NOOP_LOGGER;

  /**
   * Factory function to create a client-specific logger adapter, memoized with singleshot for efficiency.
   * Sources from GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER (defaults to LoggerAdapter), used in log, debug, and info to route client-specific logs (e.g., ClientAgent’s clientId).
   * @type {() => ILoggerAdapter}
   * @private
   */
  private getLoggerAdapter = singleshot(
    GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER
  );

  /**
   * Logs messages at the normal level, routing to both the client-specific logger (if clientId exists) and the common logger.
   * Attaches method and execution context (e.g., clientId) for traceability, used across the system (e.g., PerfService’s dispose).
   * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG, defaults to enabled.
   * @param {string} topic - The topic or identifier of the log message (e.g., "perfService dispose").
   * @param {...any[]} args - The message content and optional additional data (e.g., objects, strings).
   * @returns {void}
   */
  public log = async (topic: string, ...args: any[]) => {
    if (ClientLoggerContext.hasContext()) {
      return;
    }
    const methodContext = MethodContextService.hasContext()
      ? this.methodContextService.context
      : null;
    const executionContext = ExecutionContextService.hasContext()
      ? this.executionContextService.context
      : null;
    const clientId = methodContext?.clientId ?? executionContext?.clientId;
    const context = {
      methodContext,
      executionContext,
    };
    return await ClientLoggerContext.runInContext(async () => {
      if (clientId) {
        await this.getLoggerAdapter().log(clientId, topic, ...args, context);
      }
      await this._commonLogger.log(topic, ...args, context);
    }, context);
  };

  /**
   * Logs messages at the debug level, routing to both the client-specific logger (if clientId exists) and the common logger.
   * Attaches method and execution context for detailed debugging, heavily used in ClientAgent (e.g., RUN_FN, EXECUTE_FN) when GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG is true.
   * @param {string} topic - The topic or identifier of the debug message (e.g., "clientAgent RUN_FN").
   * @param {...any[]} args - The debug content and optional additional data (e.g., objects, strings).
   * @returns {void}
   */
  public debug = async (topic: string, ...args: any[]) => {
    if (ClientLoggerContext.hasContext()) {
      return;
    }
    const methodContext = MethodContextService.hasContext()
      ? this.methodContextService.context
      : null;
    const executionContext = ExecutionContextService.hasContext()
      ? this.executionContextService.context
      : null;
    const clientId = methodContext?.clientId ?? executionContext?.clientId;
    const context = {
      methodContext,
      executionContext,
    };
    return await ClientLoggerContext.runInContext(async () => {
      if (clientId) {
        await this.getLoggerAdapter().debug(clientId, topic, ...args, context);
      }
      await this._commonLogger.debug(topic, ...args, context);
    }, context);
  };

  /**
   * Logs messages at the info level, routing to both the client-specific logger (if clientId exists) and the common logger.
   * Attaches method and execution context for informational tracking, used in PerfService (e.g., startExecution) and DocService (e.g., dumpDocs) when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
   * @param {string} topic - The topic or identifier of the info message (e.g., "perfService startExecution").
   * @param {...any[]} args - The info content and optional additional data (e.g., objects, strings).
   * @returns {void}
   */
  public info = async (topic: string, ...args: any[]) => {
    if (ClientLoggerContext.hasContext()) {
      return;
    }
    const methodContext = MethodContextService.hasContext()
      ? this.methodContextService.context
      : null;
    const executionContext = ExecutionContextService.hasContext()
      ? this.executionContextService.context
      : null;
    const clientId = methodContext?.clientId ?? executionContext?.clientId;
    const context = {
      methodContext,
      executionContext,
    };
    return await ClientLoggerContext.runInContext(async () => {
      if (clientId) {
        await this.getLoggerAdapter().info(clientId, topic, ...args, context);
      }
      await this._commonLogger.info(topic, ...args, context);
    }, context);
  };

  /**
   * Sets a new common logger instance, replacing the default NOOP_LOGGER or previous logger.
   * Allows runtime customization of system-wide logging behavior, potentially used in testing or advanced configurations (e.g., redirecting logs to a file or console).
   * @param {ILogger} logger - The new logger instance to set, implementing the ILogger interface.
   * @returns {void}
   */
  public setLogger = (logger: ILogger) => {
    this._commonLogger = logger;
  };
}

/**
 * Default export of the LoggerService class.
 * Provides the primary logging interface for the swarm system, integrating with ClientAgent, PerfService, and DocService for consistent logging.
 * @type {typeof LoggerService}
 */
export default LoggerService;
