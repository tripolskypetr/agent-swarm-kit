import { inject } from "../../../lib/core/di";
import { ILogger } from "../../../interfaces/Logger.interface";
import MethodContextService, {
  TMethodContextService,
} from "../context/MethodContextService";
import TYPES from "../../../lib/core/types";
import ExecutionContextService, {
  TExecutionContextService,
} from "../context/ExecutionContextService";
import { singleshot } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

const NOOP_LOGGER: ILogger = {
  /**
   * Logs normal level messages.
   */
  log() {
    void 0;
  },
  /**
   * Logs debug level messages.
   */
  debug() {
    void 0;
  },
  /**
   * Logs info level messages.
   */
  info() {
    void 0;
  },
};

/**
 * LoggerService class that implements the ILogger interface.
 * Provides methods to log and debug messages.
 */
export class LoggerService implements ILogger {
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );
  private readonly executionContextService = inject<TExecutionContextService>(
    TYPES.executionContextService
  );

  private _commonLogger: ILogger = NOOP_LOGGER;

  /**
   * Creates the client logs adapter using factory
   */
  private getLoggerAdapter = singleshot(
    GLOBAL_CONFIG.CC_GET_CLIENT_LOGGER_ADAPTER
  );

  /**
   * Logs messages using the current logger.
   * @param {...any} args - The messages to log.
   */
  public log = (topic: string, ...args: any[]) => {
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
    clientId && this.getLoggerAdapter().log(clientId, topic, ...args, context);
    this._commonLogger.log(topic, ...args, context);
  };

  /**
   * Logs debug messages using the current logger.
   * @param {...any} args - The debug messages to log.
   */
  public debug = (topic: string, ...args: any[]) => {
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
    clientId &&
      this.getLoggerAdapter().debug(clientId, topic, ...args, context);
    this._commonLogger.debug(topic, ...args, context);
  };

  /**
   * Logs info messages using the current logger.
   * @param {...any} args - The info messages to log.
   */
  public info = (topic: string, ...args: any[]) => {
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
    clientId && this.getLoggerAdapter().info(clientId, topic, ...args, context);
    this._commonLogger.info(topic, ...args, context);
  };

  /**
   * Sets a new logger.
   * @param {ILogger} logger - The new logger to set.
   */
  public setLogger = (logger: ILogger) => {
    this._commonLogger = logger;
  };
}

export default LoggerService;
