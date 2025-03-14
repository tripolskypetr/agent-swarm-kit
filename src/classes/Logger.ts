import { ILogger } from "../interfaces/Logger.interface";
import swarm, { MethodContextService } from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import { memoize, singleshot } from "functools-kit";
import beginContext from "../utils/beginContext";

const LOGGER_INSTANCE_WAIT_FOR_INIT = Symbol("wait-for-init");

const LOGGER_INSTANCE_WAIT_FOR_FN = async (self: LoggerInstance) => {
  if (self.callbacks.onInit) {
    self.callbacks.onInit(self.clientId);
  }
};

/**
 * @interface ILoggerInstanceCallbacks
 * @description Callbacks for logger instance events.
 */
export interface ILoggerInstanceCallbacks {
  onInit(clientId: string): void;
  onDispose(clientId: string): void;
  onLog(clientId: string, topic: string, ...args: any[]): void;
  onDebug(clientId: string, topic: string, ...args: any[]): void;
  onInfo(clientId: string, topic: string, ...args: any[]): void;
}

/**
 * @interface ILoggerInstance
 * @extends ILogger
 * @description Interface for logger instances.
 */
export interface ILoggerInstance extends ILogger {
  waitForInit(initial: boolean): Promise<void> | void;
  dispose(): Promise<void> | void;
}

/**
 * @interface ILoggerAdapter
 * @description Interface for logger adapter.
 */
export interface ILoggerAdapter {
  log(clientId: string, topic: string, ...args: any[]): Promise<void>;
  debug(clientId: string, topic: string, ...args: any[]): Promise<void>;
  info(clientId: string, topic: string, ...args: any[]): Promise<void>;
  dispose(clientId: string): Promise<void>;
}

/**
 * @interface ILoggerControl
 * @description Interface for logger control.
 */
export interface ILoggerControl {
  useCommonAdapter(logger: ILogger): void;
  useClientCallbacks(Callbacks: Partial<ILoggerInstanceCallbacks>): void;
  useClientAdapter(Ctor: TLoggerInstanceCtor): void;
  logClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
  infoClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
  debugClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
}

type TLoggerInstanceCtor = new (
  clientId: string,
  callbacks: Partial<ILoggerInstanceCallbacks>
) => ILoggerInstance;

/**
 * @class LoggerInstance
 * @implements ILoggerInstance
 * @description Logger instance class.
 */
export class LoggerInstance implements ILoggerInstance {
  constructor(
    readonly clientId: string,
    readonly callbacks: Partial<ILoggerInstanceCallbacks>
  ) {}

  private [LOGGER_INSTANCE_WAIT_FOR_INIT] = singleshot(
    async () => await LOGGER_INSTANCE_WAIT_FOR_FN(this)
  );

  /**
   * @method waitForInit
   * @description Waits for initialization.
   * @returns {Promise<void>}
   */
  public async waitForInit() {
    return await this[LOGGER_INSTANCE_WAIT_FOR_INIT]();
  }

  /**
   * @method log
   * @description Logs a message.
   * @param {string} topic - The topic of the log.
   * @param {...any[]} args - The log arguments.
   */
  public log(topic: string, ...args: any[]) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
      console.log(`[clientId=${this.clientId}]`, topic, ...args);
    if (this.callbacks.onLog) {
      this.callbacks.onLog(this.clientId, topic, ...args);
    }
  }

  /**
   * @method debug
   * @description Logs a debug message.
   * @param {string} topic - The topic of the debug log.
   * @param {...any[]} args - The debug log arguments.
   */
  public debug(topic: string, ...args: any[]) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
      console.debug(`[clientId=${this.clientId}]`, topic, ...args);
    if (this.callbacks.onDebug) {
      this.callbacks.onDebug(this.clientId, topic, ...args);
    }
  }

  /**
   * @method info
   * @description Logs an info message.
   * @param {string} topic - The topic of the info log.
   * @param {...any[]} args - The info log arguments.
   */
  public info(topic: string, ...args: any[]) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
      console.info(`[clientId=${this.clientId}]`, topic, ...args);
    if (this.callbacks.onInfo) {
      this.callbacks.onInfo(this.clientId, topic, ...args);
    }
  }

  /**
   * @method dispose
   * @description Disposes the logger instance.
   */
  public dispose() {
    if (this.callbacks.onDispose) {
      this.callbacks.onDispose(this.clientId);
    }
  }
}

/**
 * @class LoggerUtils
 * @implements ILoggerAdapter, ILoggerControl
 * @description Utility class for logger.
 */
export class LoggerUtils implements ILoggerAdapter, ILoggerControl {
  private LoggerFactory: TLoggerInstanceCtor = LoggerInstance;
  private LoggerCallbacks: Partial<ILoggerInstanceCallbacks> = {};

  private getLogger = memoize(
    ([clientId]) => clientId,
    (clientId: string) => new this.LoggerFactory(clientId, this.LoggerCallbacks)
  );

  /**
   * @method useCommonAdapter
   * @description Sets the common logger adapter.
   * @param {ILogger} logger - The logger instance.
   */
  public useCommonAdapter = (logger: ILogger) => {
    swarm.loggerService.setLogger(logger);
  };

  /**
   * @method useClientCallbacks
   * @description Sets the client-specific callbacks.
   * @param {Partial<ILoggerInstanceCallbacks>} Callbacks - The callbacks.
   */
  public useClientCallbacks = (
    Callbacks: Partial<ILoggerInstanceCallbacks>
  ) => {
    Object.assign(this.LoggerCallbacks, Callbacks);
  };

  /**
   * @method useClientAdapter
   * @description Sets the client-specific logger adapter.
   * @param {TLoggerInstanceCtor} Ctor - The logger instance constructor.
   */
  public useClientAdapter = (Ctor: TLoggerInstanceCtor) => {
    this.LoggerFactory = Ctor;
  };

  /**
   * @method logClient
   * @description Logs a message for a specific client.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the log.
   * @param {...any[]} args - The log arguments.
   * @returns {Promise<void>}
   */
  public logClient = beginContext(
    async (clientId: string, topic: string, ...args: any[]) => {
      if (!GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG) {
        return;
      }
      if (!swarm.sessionValidationService.hasSession(clientId)) {
        return;
      }
      await MethodContextService.runInContext(
        async () => {
          await swarm.loggerService.log(topic, ...args);
        },
        {
          clientId,
          agentName: "",
          policyName: "",
          methodName: "LoggerUtils.logClient",
          stateName: "",
          storageName: "",
          swarmName: "",
        }
      );
    }
  );

  /**
   * @method infoClient
   * @description Logs an info message for a specific client.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the info log.
   * @param {...any[]} args - The info log arguments.
   * @returns {Promise<void>}
   */
  public infoClient = beginContext(
    async (clientId: string, topic: string, ...args: any[]) => {
      if (!GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) {
        return;
      }
      if (!swarm.sessionValidationService.hasSession(clientId)) {
        return;
      }
      await MethodContextService.runInContext(
        async () => {
          await swarm.loggerService.info(topic, ...args);
        },
        {
          clientId,
          agentName: "",
          policyName: "",
          methodName: "LoggerUtils.infoClient",
          stateName: "",
          storageName: "",
          swarmName: "",
        }
      );
    }
  );

  /**
   * @method debugClient
   * @description Logs a debug message for a specific client.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the debug log.
   * @param {...any[]} args - The debug log arguments.
   * @returns {Promise<void>}
   */
  public debugClient = beginContext(
    async (clientId: string, topic: string, ...args: any[]) => {
      if (!GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG) {
        return;
      }
      if (!swarm.sessionValidationService.hasSession(clientId)) {
        return;
      }
      await MethodContextService.runInContext(
        async () => {
          await swarm.loggerService.debug(topic, ...args);
        },
        {
          clientId,
          agentName: "",
          policyName: "",
          methodName: "LoggerUtils.debugClient",
          stateName: "",
          storageName: "",
          swarmName: "",
        }
      );
    }
  );

  /**
   * @method log
   * @description Logs a message.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the log.
   * @param {...any[]} args - The log arguments.
   * @returns {Promise<void>}
   */
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

  /**
   * @method debug
   * @description Logs a debug message.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the debug log.
   * @param {...any[]} args - The debug log arguments.
   * @returns {Promise<void>}
   */
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

  /**
   * @method info
   * @description Logs an info message.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the info log.
   * @param {...any[]} args - The info log arguments.
   * @returns {Promise<void>}
   */
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

  /**
   * @method dispose
   * @description Disposes the logger instance.
   * @param {string} clientId - The client ID.
   * @returns {Promise<void>}
   */
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

/**
 * @constant LoggerAdapter
 * @description Singleton instance of LoggerUtils.
 */
export const LoggerAdapter = new LoggerUtils();

/**
 * @constant Logger
 * @description Logger control interface.
 */
export const Logger = LoggerAdapter as ILoggerControl;

export default LoggerAdapter;
