import { ILogger } from "../interfaces/Logger.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import { memoize, singleshot } from "functools-kit";

const LOGGER_INSTANCE_WAIT_FOR_INIT = Symbol('wait-for-init');

export interface ILoggerInstanceCallbacks {
  onInit(clientId: string): void;
  onDispose(clientId: string): void;
  onLog(clientId: string, topic: string, ...args: any[]): void;
  onDebug(clientId: string, topic: string, ...args: any[]): void;
  onInfo(clientId: string, topic: string, ...args: any[]): void;
}

export interface ILoggerInstance extends ILogger {
  waitForInit(initial: boolean): Promise<void> | void;
  dispose(): Promise<void> | void;
}

export interface ILoggerAdapter {
  log(clientId: string, topic: string, ...args: any[]): Promise<void>
  debug(clientId: string, topic: string, ...args: any[]): Promise<void>
  info(clientId: string, topic: string, ...args: any[]): Promise<void>
  dispose(clientId: string): Promise<void>
}

interface ILoggerControl {
  useCommonAdapter(logger: ILogger): void;
  useClientCallbacks(Callbacks: Partial<ILoggerInstanceCallbacks>): void
  useClientAdapter(Ctor: TLoggerInstanceCtor): void
}

type TLoggerInstanceCtor = new (
  clientId: string,
  ...args: unknown[]
) => ILoggerInstance;

export class LoggerInstance implements ILoggerInstance {
  constructor(
    readonly clientId,
    readonly callbacks: Partial<ILoggerInstanceCallbacks>
  ) { }

  private [LOGGER_INSTANCE_WAIT_FOR_INIT] = singleshot(async () => {
    if (this.callbacks.onInit) {
      this.callbacks.onInit(this.clientId);
    }
  });

  public async waitForInit() {
    return await this[LOGGER_INSTANCE_WAIT_FOR_INIT]();
  }

  public log(topic: string, ...args: any[]) {
    if (this.callbacks.onLog) {
      this.callbacks.onLog(this.clientId, topic, ...args);
    }
  };

  public debug(topic: string, ...args: any[]) {
    if (this.callbacks.onDebug) {
      this.callbacks.onDebug(this.clientId, topic, ...args);
    }
  };

  public info(topic: string, ...args: any[]) {
    if (this.callbacks.onInfo) {
      this.callbacks.onInfo(this.clientId, topic, ...args);
    }
  };

  public dispose() {
    if (this.callbacks.onDispose) {
      this.callbacks.onDispose(this.clientId);
    }
  };
}

class LoggerUtils implements ILoggerAdapter, ILoggerControl {
  private LoggerFactory: TLoggerInstanceCtor = LoggerInstance;
  private LoggerCallbacks: Partial<ILoggerInstanceCallbacks> = {};

  private getLogger = memoize(
    ([clientId]) => clientId,
    (clientId: string) => new this.LoggerFactory(clientId, this.LoggerCallbacks)
  );

  public useCommonAdapter = (logger: ILogger) => {
    swarm.loggerService.setLogger(logger);
  };

  public useClientCallbacks = (Callbacks: Partial<ILoggerInstanceCallbacks>) => {
    Object.assign(this.LoggerCallbacks, Callbacks);
  };

  public useClientAdapter = (Ctor: TLoggerInstanceCtor) => {
    this.LoggerFactory = Ctor;
  };

  public log = async (clientId: string, topic: string, ...args: any[]) => {
    if (!GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG) {
      return;
    }
    if (!swarm.sessionValidationService.hasSession(clientId)) {
      return;
    }
    const isInitial = this.getLogger.has(clientId);
    const logger = this.getLogger(clientId);
    await logger.waitForInit(isInitial);
    await logger.log(topic, ...args);
  };

  public debug = async (clientId: string, topic: string, ...args: any[]) => {
    if (!GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG) {
      return;
    }
    if (!swarm.sessionValidationService.hasSession(clientId)) {
      return;
    }
    const isInitial = this.getLogger.has(clientId);
    const logger = this.getLogger(clientId);
    await logger.waitForInit(isInitial);
    await logger.debug(topic, ...args);
  };

  public info = async (clientId: string, topic: string, ...args: any[]) => {
    if (!GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) {
      return;
    }
    if (!swarm.sessionValidationService.hasSession(clientId)) {
      return;
    }
    const isInitial = this.getLogger.has(clientId);
    const logger = this.getLogger(clientId);
    await logger.waitForInit(isInitial);
    await logger.info(topic, ...args);
  };

  public dispose = async (clientId: string) => {
    if (!this.getLogger.has(clientId)) {
      return;
    }
    const logger = this.getLogger(clientId);
    await logger.waitForInit(false);
    await logger.dispose();
    this.getLogger.clear(clientId);
  };
}

export const LoggerAdapter = new LoggerUtils();

export const Logger = LoggerAdapter as ILoggerControl;

export default LoggerAdapter;
