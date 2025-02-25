import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";

export type IStateData = any;

/**
 * Middleware function for state management.
 * @template T - The type of the state data.
 * @param {T} state - The current state.
 * @param {string} clientId - The client ID.
 * @param {StateName} stateName - The name of the state.
 * @returns {Promise<T>} - The updated state.
 */
export interface IStateMiddleware<T extends IStateData = IStateData> {
  (state: T, clientId: string, stateName: StateName): Promise<T>;
}

/**
 * Callbacks for state lifecycle events.
 * @template T - The type of the state data.
 */
export interface IStateCallbacks<T extends IStateData = IStateData> {
  /**
   * Called when the state is initialized.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   */
  onInit: (clientId: string, stateName: StateName) => void;

  /**
   * Called when the state is disposed.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   */
  onDispose: (clientId: string, stateName: StateName) => void;

  /**
   * Called when the state is loaded.
   * @param {T} state - The current state.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   */
  onLoad: (state: T, clientId: string, stateName: StateName) => void;

  /**
   * Called when the state is read.
   * @param {T} state - The current state.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   */
  onRead: (state: T, clientId: string, stateName: StateName) => void;

  /**
   * Called when the state is written.
   * @param {T} state - The current state.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   */
  onWrite: (state: T, clientId: string, stateName: StateName) => void;
}

/**
 * Schema for state management.
 * @template T - The type of the state data.
 */
export interface IStateSchema<T extends IStateData = IStateData> {
  /**
   * The agents can share the state
   */
  shared?: boolean;

  /**
   * The name of the state.
   */
  stateName: StateName;

  /**
   * Gets the state.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   * @returns {T | Promise<T>} - The current state.
   */
  getState: (clientId: string, stateName: StateName) => T | Promise<T>;

  /**
   * Sets the state.
   * @param {T} state - The new state.
   * @param {string} clientId - The client ID.
   * @param {StateName} stateName - The name of the state.
   * @returns {Promise<void> | void} - A promise that resolves when the state is set.
   */
  setState?: (
    state: T,
    clientId: string,
    stateName: StateName
  ) => Promise<void> | void;

  /**
   * Middleware functions for state management.
   */
  middlewares?: IStateMiddleware<T>[];

  /**
   * Callbacks for state lifecycle events.
   */
  callbacks?: Partial<IStateCallbacks<T>>;
}

/**
 * Parameters for state management.
 * @template T - The type of the state data.
 */
export interface IStateParams<T extends IStateData = IStateData>
  extends IStateSchema<T> {
  /**
   * The client ID.
   */
  clientId: string;

  /**
   * The logger instance.
   */
  logger: ILogger;

  /** The bus instance. */
  bus: IBus;
}

/**
 * State management interface.
 * @template T - The type of the state data.
 */
export interface IState<T extends IStateData = IStateData> {
  /**
   * Gets the state.
   * @returns {Promise<T>} - The current state.
   */
  getState: () => Promise<T>;

  /**
   * Sets the state.
   * @param {(prevState: T) => Promise<T>} dispatchFn - The function to dispatch the new state.
   * @returns {Promise<T>} - The updated state.
   */
  setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;
}

/**
 * The name of the state.
 */
export type StateName = string;
