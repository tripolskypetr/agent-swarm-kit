import { inject } from "../../../lib/core/di";
import { ILogger } from "../../../interfaces/Logger.interface";
import MethodContextService, {
  TMethodContextService,
} from "../context/MethodContextService";
import TYPES from "../../../lib/core/types";
import ExecutionContextService, {
  TExecutionContextService,
} from "../context/ExecutionContextService";

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

  private _logger: ILogger = {
    /**
     * Logs messages.
     * @param {...any} args - The messages to log.
     */
    log(...args: any[]) {
      void 0;
    },
    /**
     * Logs debug messages.
     * @param {...any} args - The debug messages to log.
     */
    debug(...args: any[]) {
      void 0;
    },
  };

  /**
   * Logs messages using the current logger.
   * @param {...any} args - The messages to log.
   */
  public log = (...args: any[]) => {
    const methodContext = MethodContextService.hasContext()
      ? this.methodContextService.context
      : null;
    const executionContext = ExecutionContextService.hasContext()
      ? this.executionContextService.context
      : null;
    this._logger.log(...args, {
      methodContext,
      executionContext,
    });
  };

  /**
   * Logs debug messages using the current logger.
   * @param {...any} args - The debug messages to log.
   */
  public debug = (...args: any[]) => {
    const methodContext = MethodContextService.hasContext()
      ? this.methodContextService.context
      : null;
    const executionContext = ExecutionContextService.hasContext()
      ? this.executionContextService.context
      : null;
    this._logger.debug(...args, { methodContext, executionContext });
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
