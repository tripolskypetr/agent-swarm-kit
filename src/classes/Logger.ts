import { ILogger } from "../interfaces/Logger.interface";
import swarm, { MethodContextService } from "../lib";
import { GLOBAL_CONFIG } from "../config/params";
import { makeExtendable, memoize, singleshot } from "functools-kit";
import beginContext from "../utils/beginContext";

/** @private Symbol for memoizing the waitForInit method in LoggerInstance */
const LOGGER_INSTANCE_WAIT_FOR_INIT = Symbol("wait-for-init");

/**
 * Initializes the logger instance by invoking the onInit callback if provided.
 * Ensures initialization runs asynchronously and is executed only once via singleshot.
 * @private
 * @param self - The logger instance to initialize.
 * @returns A promise that resolves when initialization is complete.
 */
const LOGGER_INSTANCE_WAIT_FOR_FN = async (
  self: TLoggerInstance
): Promise<void> => {
  if (self.callbacks.onInit) {
    self.callbacks.onInit(self.clientId);
  }
};

/**
 * Callbacks for managing logger instance lifecycle and log events.
 * Used by LoggerInstance to hook into initialization, disposal, and logging operations.
 */
export interface ILoggerInstanceCallbacks {
  /**
   * Called when the logger instance is initialized, typically during waitForInit.
   * @param clientId - The client ID associated with the logger instance.
   */
  onInit(clientId: string): void;

  /**
   * Called when the logger instance is disposed, cleaning up resources.
   * @param clientId - The client ID associated with the logger instance.
   */
  onDispose(clientId: string): void;

  /**
   * Called when a log message is recorded via the log method.
   * @param clientId - The client ID associated with the logger instance.
   * @param topic - The log topic or category.
   * @param args - Additional arguments to log.
   */
  onLog(clientId: string, topic: string, ...args: any[]): void;

  /**
   * Called when a debug message is recorded via the debug method.
   * @param clientId - The client ID associated with the logger instance.
   * @param topic - The debug topic or category.
   * @param args - Additional arguments to debug log.
   */
  onDebug(clientId: string, topic: string, ...args: any[]): void;

  /**
   * Called when an info message is recorded via the info method.
   * @param clientId - The client ID associated with the logger instance.
   * @param topic - The info topic or category.
   * @param args - Additional arguments to info log.
   */
  onInfo(clientId: string, topic: string, ...args: any[]): void;
}

/**
 * Interface for logger instances, extending the base ILogger with lifecycle methods.
 * Implemented by LoggerInstance for client-specific logging with initialization and disposal support.
 * @extends {ILogger}
 */
export interface ILoggerInstance extends ILogger {
  /**
   * Initializes the logger instance, invoking the onInit callback if provided.
   * Ensures initialization is performed only once, supporting asynchronous setup.
   * @param initial - Whether this is the initial setup (affects caching behavior in LoggerUtils).
   * @returns A promise if initialization is asynchronous, or void if synchronous.
   */
  waitForInit(initial: boolean): Promise<void> | void;

  /**
   * Disposes of the logger instance, invoking the onDispose callback if provided.
   * Cleans up resources associated with the client ID.
   * @returns A promise if disposal is asynchronous, or void if synchronous.
   */
  dispose(): Promise<void> | void;
}

/**
 * Interface defining methods for interacting with a logger adapter.
 * Implemented by LoggerUtils to provide client-specific logging operations.
 */
export interface ILoggerAdapter {
  /**
   * Logs a message for a client using the client-specific logger instance.
   * Ensures session validation and initialization before logging.
   * @param clientId - The client ID associated with the log.
   * @param topic - The log topic or category.
   * @param args - Additional arguments to log.
   * @returns A promise that resolves when the log is recorded.
   */
  log(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs a debug message for a client using the client-specific logger instance.
   * Ensures session validation and initialization before logging.
   * @param clientId - The client ID associated with the debug log.
   * @param topic - The debug topic or category.
   * @param args - Additional arguments to debug log.
   * @returns A promise that resolves when the debug message is recorded.
   */
  debug(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs an info message for a client using the client-specific logger instance.
   * Ensures session validation and initialization before logging.
   * @param clientId - The client ID associated with the info log.
   * @param topic - The info topic or category.
   * @param args - Additional arguments to info log.
   * @returns A promise that resolves when the info message is recorded.
   */
  info(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Disposes of the logger instance for a client, clearing it from the cache.
   * Ensures initialization before disposal.
   * @param clientId - The client ID to dispose.
   * @returns A promise that resolves when disposal is complete.
   */
  dispose(clientId: string): Promise<void>;
}

/**
 * Interface defining control methods for configuring logger behavior.
 * Implemented by LoggerUtils to manage common adapters, callbacks, and custom constructors.
 */
export interface ILoggerControl {
  /**
   * Sets a common logger adapter for all logging operations via swarm.loggerService.
   * Overrides the default logger service behavior for centralized logging.
   * @param logger - The logger instance to set as the common adapter.
   */
  useCommonAdapter(logger: ILogger): void;

  /**
   * Configures client-specific lifecycle callbacks for logger instances.
   * Applies to all instances created by LoggerUtils' LoggerFactory.
   * @param Callbacks - The callbacks to configure.
   */
  useClientCallbacks(Callbacks: Partial<ILoggerInstanceCallbacks>): void;

  /**
   * Sets a custom logger instance constructor for client-specific logging.
   * Replaces the default LoggerInstance with a user-defined constructor.
   * @param Ctor - The constructor for creating logger instances.
   */
  useClientAdapter(Ctor: TLoggerInstanceCtor): void;

  /**
   * Logs a message for a specific client using the common adapter (swarm.loggerService).
   * Includes session validation and method context tracking.
   * @param clientId - The client ID associated with the log.
   * @param topic - The log topic or category.
   * @param args - Additional arguments to log.
   * @returns A promise that resolves when the log is recorded.
   */
  logClient(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs an info message for a specific client using the common adapter (swarm.loggerService).
   * Includes session validation and method context tracking.
   * @param clientId - The client ID associated with the info log.
   * @param topic - The info topic or category.
   * @param args - Additional arguments to info log.
   * @returns A promise that resolves when the info message is recorded.
   */
  infoClient(clientId: string, topic: string, ...args: any[]): Promise<void>;

  /**
   * Logs a debug message for a specific client using the common adapter (swarm.loggerService).
   * Includes session validation and method context tracking.
   * @param clientId - The client ID associated with the debug log.
   * @param topic - The debug topic or category.
   * @param args - Additional arguments to debug log.
   * @returns A promise that resolves when the debug message is recorded.
   */
  debugClient(clientId: string, topic: string, ...args: any[]): Promise<void>;
}

/**
 * Constructor type for creating logger instances.
 * Used by LoggerUtils to instantiate custom or default LoggerInstance objects.
 */
export type TLoggerInstanceCtor = new (
  clientId: string,
  callbacks: Partial<ILoggerInstanceCallbacks>
) => ILoggerInstance;

/**
 * Manages logging operations for a specific client, with customizable callbacks and console output.
 * Implements ILoggerInstance for client-specific logging with lifecycle management.
 * Integrates with GLOBAL_CONFIG for console logging control and callbacks for custom behavior.
 * @implements {ILoggerInstance}
 */
export const LoggerInstance = makeExtendable(
  class implements ILoggerInstance {
    /**
     * Creates a new logger instance for a specific client.
     * @param clientId - The client ID associated with this logger instance, used in log prefixes.
     * @param callbacks - Optional lifecycle callbacks for initialization, disposal, and logging.
     */
    constructor(
      readonly clientId: string,
      readonly callbacks: Partial<ILoggerInstanceCallbacks>
    ) {}

    /**
     * Memoized initialization function to ensure it runs only once using singleshot.
     * Invokes LOGGER_INSTANCE_WAIT_FOR_FN to handle onInit callback execution.
     * @private
     * @returns A promise that resolves when initialization is complete.
     */
    [LOGGER_INSTANCE_WAIT_FOR_INIT] = singleshot(
      async (): Promise<void> => await LOGGER_INSTANCE_WAIT_FOR_FN(this)
    );

    /**
     * Initializes the logger instance, invoking the onInit callback if provided.
     * Ensures initialization is performed only once, memoized via singleshot.
     * @param initial - Whether this is the initial setup (unused here but required by ILoggerInstance).
     * @returns A promise that resolves when initialization is complete.
     */
    async waitForInit(): Promise<void> {
      return await this[LOGGER_INSTANCE_WAIT_FOR_INIT]();
    }

    /**
     * Logs a message to the console (if enabled) and invokes the onLog callback if provided.
     * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.
     * @param topic - The topic or category of the log message.
     * @param args - Additional arguments to include in the log.
     */
    log(topic: string, ...args: any[]): void {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
        console.log(`[clientId=${this.clientId}]`, topic, ...args);
      if (this.callbacks.onLog) {
        this.callbacks.onLog(this.clientId, topic, ...args);
      }
    }

    /**
     * Logs a debug message to the console (if enabled) and invokes the onDebug callback if provided.
     * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.
     * @param topic - The topic or category of the debug message.
     * @param args - Additional arguments to include in the debug log.
     */
    debug(topic: string, ...args: any[]): void {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
        console.debug(`[clientId=${this.clientId}]`, topic, ...args);
      if (this.callbacks.onDebug) {
        this.callbacks.onDebug(this.clientId, topic, ...args);
      }
    }

    /**
     * Logs an info message to the console (if enabled) and invokes the onInfo callback if provided.
     * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE for console output.
     * @param topic - The topic or category of the info message.
     * @param args - Additional arguments to include in the info log.
     */
    info(topic: string, ...args: any[]): void {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_CONSOLE &&
        console.info(`[clientId=${this.clientId}]`, topic, ...args);
      if (this.callbacks.onInfo) {
        this.callbacks.onInfo(this.clientId, topic, ...args);
      }
    }

    /**
     * Disposes of the logger instance, invoking the onDispose callback if provided.
     * Performs synchronous cleanup without additional resource management.
     * @returns No return value, operation is synchronous.
     */
    dispose(): void {
      if (this.callbacks.onDispose) {
        this.callbacks.onDispose(this.clientId);
      }
    }
  }
);

/**
 * Type alias for an instance of LoggerInstance.
 */
export type TLoggerInstance = InstanceType<typeof LoggerInstance>;

/**
 * Provides utilities for managing logger instances and common logging operations.
 * Implements ILoggerAdapter for client-specific logging and ILoggerControl for configuration.
 * Integrates with swarm.loggerService (common logging), SessionValidationService (session checks),
 * MethodContextService (execution context), and GLOBAL_CONFIG (logging control).
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
   * Ensures a single instance per clientId, cached for performance.
   * @private
   * @param clientId - The client ID to retrieve or create a logger for.
   * @returns The logger instance for the specified client.
   */
  private getLogger = memoize(
    ([clientId]: [string]): string => clientId,
    (clientId: string): ILoggerInstance =>
      Reflect.construct(this.LoggerFactory, [clientId, this.LoggerCallbacks])
  );

  /**
   * Sets a common logger adapter for all logging operations via swarm.loggerService.
   * Configures the base LoggerService for centralized logging across the swarm system.
   * @param logger - The logger instance to set as the common adapter.
   */
  public useCommonAdapter = (logger: ILogger): void => {
    swarm.loggerService.setLogger(logger);
  };

  /**
   * Configures lifecycle callbacks for all logger instances created by this adapter.
   * Applies to both default (LoggerInstance) and custom constructors set via useClientAdapter.
   * @param Callbacks - The callbacks to apply to logger instances.
   */
  public useClientCallbacks = (
    Callbacks: Partial<ILoggerInstanceCallbacks>
  ): void => {
    Object.assign(this.LoggerCallbacks, Callbacks);
  };

  /**
   * Sets a custom logger instance constructor for client-specific logging.
   * Replaces the default LoggerInstance with a user-defined implementation.
   * @param Ctor - The constructor for creating logger instances.
   */
  public useClientAdapter = (Ctor: TLoggerInstanceCtor): void => {
    this.LoggerFactory = Ctor;
  };

  /**
   * Logs a message for a specific client using the common adapter (swarm.loggerService).
   * Validates session existence and runs within a MethodContextService context for tracking.
   * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG.
   * @param clientId - The client ID associated with the log.
   * @param topic - The topic or category of the log message.
   * @param args - Additional arguments to log.
   * @returns A promise that resolves when the log is recorded.
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
          mcpName: "",
        }
      );
    }
  );

  /**
   * Logs an info message for a specific client using the common adapter (swarm.loggerService).
   * Validates session existence and runs within a MethodContextService context for tracking.
   * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @param clientId - The client ID associated with the info log.
   * @param topic - The topic or category of the info message.
   * @param args - Additional arguments to info log.
   * @returns A promise that resolves when the info message is recorded.
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
          mcpName: "",
        }
      );
    }
  );

  /**
   * Logs a debug message for a specific client using the common adapter (swarm.loggerService).
   * Validates session existence and runs within a MethodContextService context for tracking.
   * Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG.
   * @param clientId - The client ID associated with the debug log.
   * @param topic - The topic or category of the debug message.
   * @param args - Additional arguments to debug log.
   * @returns A promise that resolves when the debug message is recorded.
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
          mcpName: "",
        }
      );
    }
  );

  /**
   * Logs a message for a client using the client-specific logger instance.
   * Ensures session validation and initialization before logging, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG.
   * @param clientId - The client ID associated with the log.
   * @param topic - The topic or category of the log message.
   * @param args - Additional arguments to log.
   * @returns A promise that resolves when the log is recorded.
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
    const isInitial = !this.getLogger.has(clientId);
    const logger = this.getLogger(clientId);
    await logger.waitForInit(isInitial);
    logger.log(topic, ...args);
  };

  /**
   * Logs a debug message for a client using the client-specific logger instance.
   * Ensures session validation and initialization before logging, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG.
   * @param clientId - The client ID associated with the debug log.
   * @param topic - The topic or category of the debug message.
   * @param args - Additional arguments to debug log.
   * @returns A promise that resolves when the debug message is recorded.
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
    const isInitial = !this.getLogger.has(clientId);
    const logger = this.getLogger(clientId);
    await logger.waitForInit(isInitial);
    logger.debug(topic, ...args);
  };

  /**
   * Logs an info message for a client using the client-specific logger instance.
   * Ensures session validation and initialization before logging, controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
   * @param clientId - The client ID associated with the info log.
   * @param topic - The topic or category of the info message.
   * @param args - Additional arguments to info log.
   * @returns A promise that resolves when the info message is recorded.
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
    const isInitial = !this.getLogger.has(clientId);
    const logger = this.getLogger(clientId);
    await logger.waitForInit(isInitial);
    logger.info(topic, ...args);
  };

  /**
   * Disposes of the logger instance for a client, clearing it from the memoized cache.
   * Ensures initialization before disposal to handle any pending onInit callbacks.
   * @param clientId - The client ID to dispose the logger for.
   * @returns A promise that resolves when disposal is complete.
   */
  public dispose = async (clientId: string): Promise<void> => {
    if (!this.getLogger.has(clientId)) {
      return;
    }
    const logger = this.getLogger(clientId);
    await logger.waitForInit(false);
    logger.dispose();
    this.getLogger.clear(clientId);
  };
}

/**
 * Singleton instance of LoggerUtils implementing the logger adapter and control interfaces.
 * Provides a centralized utility for client-specific and common logging operations.
 * @type {ILoggerAdapter & ILoggerControl}
 */
export const LoggerAdapter = new LoggerUtils();

/**
 * Exported Logger Control interface for configuring logger behavior.
 * Exposes LoggerUtils' control methods (useCommonAdapter, useClientCallbacks, useClientAdapter, etc.).
 * @type {ILoggerControl}
 */
export const Logger = LoggerAdapter as ILoggerControl;

/**
 * Default export of the LoggerAdapter singleton.
 * Combines ILoggerAdapter and ILoggerControl implementations for comprehensive logging management.
 * @type {ILoggerAdapter & ILoggerControl}
 */
export default LoggerAdapter;
