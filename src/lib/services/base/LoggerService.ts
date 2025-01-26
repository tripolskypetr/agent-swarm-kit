import { ILogger } from "../../../interfaces/Logger.interface";

/**
 * LoggerService class that implements the ILogger interface.
 * Provides methods to log and debug messages.
 */
export class LoggerService implements ILogger {
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
  }

  /**
   * Logs messages using the current logger.
   * @param {...any} args - The messages to log.
   */
  public log = (...args: any[]) => {
    this._logger.log(...args);
  }

  /**
   * Logs debug messages using the current logger.
   * @param {...any} args - The debug messages to log.
   */
  public debug = (...args: any[]) =>  {
    this._logger.debug(...args);
  }

  /**
   * Sets a new logger.
   * @param {ILogger} logger - The new logger to set.
   */
  public setLogger = (logger: ILogger) =>  {
    this._logger = logger;
  }

}

export default LoggerService;
