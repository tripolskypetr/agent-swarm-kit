import { ILogger } from "../interfaces/Logger.interface";
import swarm, { MethodContextService } from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import { memoize, singleshot } from "functools-kit";
import beginContext from "../utils/beginContext";

/** @private Symbol for memoizing the waitForInit method in LoggerInstance */
const LOGGER_INSTANCE_WAIT_FOR_INIT = Symbol("wait-for-init");

/**
 * Initializes the logger instance by invoking the onInit callback if provided.
 * @param {LoggerInstance} self - The logger instance.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 * @private
 */
const LOGGER_INSTANCE_WAIT_FOR_FN = async (self: LoggerInstance): Promise<void> => {
  if (self.callbacks.onInit) {
    self.callbacks.onInit(self.clientId);
  }
};

/**
 * Callbacks for managing logger instance lifecycle and log events.
 */
export interface ILoggerInstanceCallbacks {
  /**
   * Called when the logger instance is initialized.
   * @param {string} clientId - The client ID.
   */
  onInit(clientId: string): void;

  /**
   * Called when the logger instance is disposed.
   * @param {string} clientId - The client ID.
   */
  onDispose(clientId: string): void;

  /**
   * Called when a log message is recorded.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The log topic.
   * @param {...any[]} args - Additional log arguments.
   */
  onLog(clientId: string, topic: string, ...args: any[]): void;

  /**
   * Called when a debug message is recorded.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The debug topic.
   * @param {...any[]} args - Additional debug arguments.
   */
  onDebug(clientId: string, topic: string, ...args: any[]): void;

  /**
   * Called when an info message is recorded.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The info topic.
   * @param {...any[]} args - Additional info arguments.
   */
  onInfo(clientId: string, topic: string, ...args: any[]): void;
}

/**
 * Interface for logger instances, extending the base ILogger with lifecycle methods.
 * @extends {ILogger}
 */
export interface ILoggerInstance extends ILogger {
  /**
   * Initializes the logger instance, optionally waiting for setup.
   * @param {boolean} initial - Whether this is the initial setup (affects caching behavior).
   * @returns {Promise<void> | void} A promise that resolves when initialization is complete, or void if synchronous.
   */
  waitForInit(initial: boolean): Promise<void> | void;

  /**
   * Disposes of the logger instance, cleaning up resources.
   * @returns {Promise<void> | void} A promise that resolves when disposal is complete, or void if synchronous.
   */
  dispose(): Promise<void> | void;
}

/**
 * Interface defining methods for interacting with a logger adapter.
 */
export interface ILoggerAdapter {
  /**
   * Logs a message for a client.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The log topic.
   * @param {...any[]} args - Additional log arguments.
   * @returns {Promise<void>} A promise that resolves when the log is recorded.
   */
  log(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs a debug message for a client.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The debug topic.
   * @param {...any[]} args - Additional debug arguments.
   * @returns {Promise<void>} A promise that resolves when the debug message is recorded.
   */
  debug(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs an info message for a client.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The info topic.
   * @param {...any[]} args - Additional info arguments.
   * @returns {Promise<void>} A promise that resolves when the info message is recorded.
   */
  info(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Disposes of the logger instance for a client.
   * @param {string} clientId - The client ID.
   * @returns {Promise<void>} A promise that resolves when disposal is complete.
   */
  dispose(clientId: string): Promise<void>;
}

/**
 * Interface defining control methods for configuring logger behavior.
 */
export interface ILoggerControl {
  /**
   * Sets a common logger adapter for all logging operations.
   * @param {ILogger} logger - The logger instance to use.
   */
  useCommonAdapter(logger: ILogger): void;

  /**
   * Configures client-specific lifecycle callbacks for logger instances.
   * @param {Partial<ILoggerInstanceCallbacks>} Callbacks - The callbacks to apply.
   */
  useClientCallbacks(Callbacks: Partial<ILoggerInstanceCallbacks>): void;

  /**
   * Sets a custom logger instance constructor for client-specific logging.
   * @param {TLoggerInstanceCtor} Ctor - The constructor for creating logger instances.
   */
  useClientAdapter(Ctor: TLoggerInstanceCtor): void;

  /**
   * Logs a message for a specific client using the common adapter.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The log topic.
   * @param {...any[]} args - Additional log arguments.
   * @returns {Promise<void>} A promise that resolves when the log is recorded.
   */
  logClient(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs an info message for a specific client using the common adapter.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The info topic.
   * @param {...any[]} args - Additional info arguments.
   * @returns {Promise<void>} A promise that resolves when the info message is recorded.
   */
  infoClient(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs a debug message for a specific client using the common adapter.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The debug topic.
   * @param {...any[]} args - Additional debug arguments.
   * @returns {Promise<void>} A promise that resolves when the debug message is recorded.
   */
  debugClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
}

/**
 * Constructor type for creating logger instances.
 * @typedef {new (clientId: string, callbacks: Partial<ILoggerInstanceCallbacks>) => ILoggerInstance} TLoggerInstanceCtor
 */
type TLoggerInstanceCtor = new (
  clientId: string,
  callbacks: Partial<ILoggerInstanceCallbacks>
) => ILoggerInstance;

/**
 * Manages logging operations for a specific client, with customizable callbacks.
 * @implements {ILoggerInstance}
 */
export class LoggerInstance implements ILoggerInstance {
  /**
   * Creates a new logger instance.
   * @param {string} clientId - The client ID associated with this logger.
   * @param {Partial<ILoggerInstanceCallbacks>} callbacks - Optional lifecycle callbacks.
   */
  constructor(
    readonly clientId: string,
    readonly callbacks: Partial<ILoggerInstanceCallbacks>
  ) {}

  /**
   * Memoized initialization function to ensure it runs only once.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   * @private
   */
  private [LOGGER_INSTANCE_WAIT_FOR_INIT] = singleshot(
    async (): Promise<void> => await LOGGER_INSTANCE_WAIT_FOR_FN(this)
  );

  /**
   * Initializes the logger instance, invoking the onInit callback if provided.
   * @param {boolean} [initial] - Whether this is the initial setup (unused in this implementation).
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  public async waitForInit(): Promise<void> {
    return await this[LOGGER_INSTANCE_WAIT_FOR_INIT]();
  }

  /**
   * Logs a message to the console (if enabled) and invokes the onLog callback.
   * @param {string} topic - The topic of the log message.
   * @param {...any[]} args - Additional arguments to log.
   */
  public log(topic: string, ...args: any[]): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
      console.log(`[clientId=${this.clientId}]`, topic, ...args);
    if (this.callbacks.onLog) {
      this.callbacks.onLog(this.clientId, topic, ...args);
    }
  }

  /**
   * Logs a debug message to the console (if enabled) and invokes the onDebug callback.
   * @param {string} topic - The topic of the debug message.
   * @param {...any[]} args - Additional arguments to debug log.
   */
  public debug(topic: string, ...args: any[]): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
      console.debug(`[clientId=${this.clientId}]`, topic, ...args);
    if (this.callbacks.onDebug) {
      this.callbacks.onDebug(this.clientId, topic, ...args);
    }
  }

  /**
   * Logs an info message to the console (if enabled) and invokes the onInfo callback.
   * @param {string} topic - The topic of the info message.
   * @param {...any[]} args - Additional arguments to info log.
   */
  public info(topic: string, ...args: any[]): void {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
      console.info(`[clientId=${this.clientId}]`, topic, ...args);
    if (this.callbacks.onInfo) {
      this.callbacks.onInfo(this.clientId, topic, ...args);
    }
  }

  /**
   * Disposes of the logger instance, invoking the onDispose callback if provided.
   * @returns {void} Synchronous operation with no return value.
   */
  public dispose(): void {
    if (this.callbacks.onDispose) {
      this.callbacks.onDispose(this.clientId);
    }
  }
}

/**
 * Provides utilities for managing logger instances and common logging operations.
 * @implements {ILoggerAdapter}
 * @implements {ILoggerControl}
 */
export class LoggerUtils implements ILoggerAdapter, ILoggerControl {
  /** @private The custom logger instance constructor, defaults to LoggerInstance */
  private LoggerFactory: TLoggerInstanceCtor = LoggerInstance;

  /** @private The configured lifecycle callbacks for logger instances */
  private LoggerCallbacks: Partial<ILoggerInstanceCallbacks> = {};

  /**
   * Memoized function to create or retrieve a logger instance for a client.
   * @param {string} clientId - The client ID.
   * @returns {ILoggerInstance} The logger instance for the client.
   * @private
   */
  private getLogger = memoize(
    ([clientId]: [string]): string => clientId,
    (clientId: string): ILoggerInstance =>
      new this.LoggerFactory(clientId, this.LoggerCallbacks)
  );

  /**
   * Sets a common logger adapter for all logging operations via the swarm logger service.
   * @param {ILogger} logger - The logger instance to use.
   */
  public useCommonAdapter = (logger: ILogger): void => {
    swarm.loggerService.setLogger(logger);
  };

  /**
   * Configures lifecycle callbacks for all logger instances created by this adapter.
   * @param {Partial<ILoggerInstanceCallbacks>} Callbacks - The callbacks to apply.
   */
  public useClientCallbacks = (
    Callbacks: Partial<ILoggerInstanceCallbacks>
  ): void => {
    Object.assign(this.LoggerCallbacks, Callbacks);
  };

  /**
   * Sets a custom logger instance constructor for client-specific logging.
   * @param {TLoggerInstanceCtor} Ctor - The constructor for creating logger instances.
   */
  public useClientAdapter = (Ctor: TLoggerInstanceCtor): void => {
    this.LoggerFactory = Ctor;
  };

  /**
   * Logs a message for a specific client using the common adapter, with session validation.
   * Runs within a method context for tracking purposes.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the log message.
   * @param {...any[]} args - Additional arguments to log.
   * @returns {Promise<void>} A promise that resolves when the log is recorded.
   */
  public logClient = beginContext(
    async (clientId: string, topic: string, ...args: any[]): Promise<void> => {
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
   * Logs an info message for a specific client using the common adapter, with session validation.
   * Runs within a method context for tracking purposes.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the info message.
   * @param {...any[]} args - Additional arguments to info log.
   * @returns {Promise<void>} A promise that resolves when the info message is recorded.
   */
  public infoClient = beginContext(
    async (clientId: string, topic: string, ...args: any[]): Promise<void> => {
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
   * Logs a debug message for a specific client using the common adapter, with session validation.
   * Runs within a method context for tracking purposes.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the debug message.
   * @param {...any[]} args - Additional arguments to debug log.
   * @returns {Promise<void>} A promise that resolves when the debug message is recorded.
   */
  public debugClient = beginContext(
    async (clientId: string, topic: string, ...args: any[]): Promise<void> => {
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
   * Logs a message for a client using the client-specific logger instance.
   * Ensures initialization and session validation before logging.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the log message.
   * @param {...any[]} args - Additional arguments to log.
   * @returns {Promise<void>} A promise that resolves when the log is recorded.
   */
  public log = async (
    clientId: string,
    topic: string,
    ...args: any[]
  ): Promise<void> => {
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
   * Logs a debug message for a client using the client-specific logger instance.
   * Ensures initialization and session validation before logging.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the debug message.
   * @param {...any[]} args - Additional arguments to debug log.
   * @returns {Promise<void>} A promise that resolves when the debug message is recorded.
   */
  public debug = async (
    clientId: string,
    topic: string,
    ...args: any[]
  ): Promise<void> => {
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
   * Logs an info message for a client using the client-specific logger instance.
   * Ensures initialization and session validation before logging.
   * @param {string} clientId - The client ID.
   * @param {string} topic - The topic of the info message.
   * @param {...any[]} args - Additional arguments to info log.
   * @returns {Promise<void>} A promise that resolves when the info message is recorded.
   */
  public info = async (
    clientId: string,
    topic: string,
    ...args: any[]
  ): Promise<void> => {
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
   * Disposes of the logger instance for a client, clearing it from the cache.
   * Ensures initialization before disposal.
   * @param {string} clientId - The client ID.
   * @returns {Promise<void>} A promise that resolves when disposal is complete.
   */
  public dispose = async (clientId: string): Promise<void> => {
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
 * Singleton instance of LoggerUtils implementing the logger adapter and control interfaces.
 * @type {ILoggerAdapter & ILoggerControl}
 */
export const LoggerAdapter = new LoggerUtils();

/**
 * Exported Logger Control interface for configuring logger behavior.
 * @type {ILoggerControl}
 */
export const Logger = LoggerAdapter as ILoggerControl;

export default LoggerAdapter;
