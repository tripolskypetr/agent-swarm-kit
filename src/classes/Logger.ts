import { ILogger } from "../interfaces/Logger.interface";
import swarm from "../lib";

class LoggerUtils {
  /**
   * Sets the provided logger to the logger service.
   * @param {ILogger} logger - The logger instance to be used.
   */
  public useLogger = (logger: ILogger) => {
    swarm.loggerService.log("HistoryInstance useLogger");
    swarm.loggerService.setLogger(logger);
  };
}

/**
 * Instance of LoggerUtils to be used for logging.
 * @type {LoggerUtils}
 */
export const Logger = new LoggerUtils();

export default Logger;
