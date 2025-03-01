import { inject } from "../../../lib/core/di";
import { ILogger } from "../../../interfaces/Logger.interface";
import MethodContextService, {
  TMethodContextService,
} from "../context/MethodContextService";
import TYPES from "../../../lib/core/types";
import ExecutionContextService, {
  TExecutionContextService,
} from "../context/ExecutionContextService";
import LoggerAdapter from "../../../classes/Logger";

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

  private _logger: ILogger = NOOP_LOGGER;

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
    clientId && LoggerAdapter.log(clientId, topic, ...args);
    this._logger.log(topic, ...args, {
      methodContext,
      executionContext,
    });
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
    clientId && LoggerAdapter.debug(clientId, topic, ...args);
    this._logger.debug(topic, ...args, { methodContext, executionContext });
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
    clientId && LoggerAdapter.info(clientId, topic, ...args);
    this._logger.info(topic, ...args, { methodContext, executionContext });
  };

  /**
   * Sets a new logger.
   * @param {ILogger} logger - The new logger to set.
   */
  public setLogger = (logger: ILogger) => {
    this._logger = logger;
  };
}

export default LoggerService;
