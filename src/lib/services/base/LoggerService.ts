import { ILogger } from "../../../interfaces/Logger.interface";

export class LoggerService implements ILogger {
  private _logger: ILogger = {
    log(...args: any[]) {
      void 0;
    },
    debug(...args: any[]) {
      void 0;
    },
  }

  public log = (...args: any[]) => {
    this._logger.log(...args);
  }

  public debug = (...args: any[]) =>  {
    this._logger.debug(...args);
  }

  public setLogger = (logger: ILogger) =>  {
    this._logger = logger;
  }

}

export default LoggerService;
