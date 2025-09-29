import { IBus } from "./Bus.interface";
import { ILogger } from "./Logger.interface";

/**
 * Type representing the data structure of a state.
 * Can be any type, serving as a generic placeholder for state values.
 */
export type IStateData = any;

/**
 * Interface representing a middleware function for state management.
 * Allows modification or validation of state during lifecycle operations.
 * @template T - The type of the state data, defaults to IStateData.
 */
export interface IStateMiddleware<T extends IStateData = IStateData> {
  /**
   * Processes the state, potentially modifying it before it’s finalized.
   * @param {T} state - The current state data to process.
   * @param {string} clientId - The unique ID of the client associated with the state.
   * @param {StateName} stateName - The unique name of the state.
   * @returns {Promise<T>} A promise resolving to the updated state after middleware processing.
   * @throws {Error} If middleware processing fails or validation conditions are not met.
   */
  (state: T, clientId: string, stateName: StateName): Promise<T>;
}

/**
 * Interface representing callbacks for state lifecycle events.
 * Provides hooks for initialization, disposal, and state transitions.
 * @template T - The type of the state data, defaults to IStateData.
 */
export interface IStateCallbacks<T extends IStateData = IStateData> {
  /**
   * Callback triggered when the state is initialized.
   * Useful for setup or logging.
   * @param {string} clientId - The unique ID of the client associated with the state.
   * @param {StateName} stateName - The unique name of the state.
   */
  onInit: (clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is disposed of.
   * Useful for cleanup or logging.
   * @param {string} clientId - The unique ID of the client associated with the state.
   * @param {StateName} stateName - The unique name of the state.
   */
  onDispose: (clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is loaded from storage or initialized.
   * @param {T} state - The loaded state data.
   * @param {string} clientId - The unique ID of the client associated with the state.
   * @param {StateName} stateName - The unique name of the state.
   */
  onLoad: (state: T, clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is read.
   * Useful for monitoring or logging read operations.
   * @param {T} state - The current state data being read.
   * @param {string} clientId - The unique ID of the client associated with the state.
   * @param {StateName} stateName - The unique name of the state.
   */
  onRead: (state: T, clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is written or updated.
   * Useful for tracking changes or triggering side effects.
   * @param {T} state - The updated state data being written.
   * @param {string} clientId - The unique ID of the client associated with the state.
   * @param {StateName} stateName - The unique name of the state.
   */
  onWrite: (state: T, clientId: string, stateName: StateName) => void;
}

/**
 * Interface representing the schema for state management.
 * Defines the configuration and behavior of a state within the swarm.
 * @template T - The type of the state data, defaults to IStateData.
 */
export interface IStateSchema<T extends IStateData = IStateData> {
  /** Optional flag to enable serialization of state values to persistent storage (e.g., hard drive). */
  persist?: boolean;

  /** Optional description for documentation purposes, aiding in state usage understanding. */
  docDescription?: string;

  /** Optional flag indicating whether the state can be shared across multiple agents. */
  shared?: boolean;

  /** The unique name of the state within the swarm. */
  stateName: StateName;

  /**
   * Function to retrieve or compute the default state value.
   * @param {string} clientId - The unique ID of the client requesting the state.
   * @param {StateName} stateName - The unique name of the state.
   * @returns {T | Promise<T>} The default state value, synchronously or asynchronously.
   */
  getDefaultState: (clientId: string, stateName: StateName) => T | Promise<T>;

  /**
   * Optional function to retrieve the current state, with a fallback to the default state.
   * Overrides default state retrieval behavior if provided.
   * @param {string} clientId - The unique ID of the client requesting the state.
   * @param {StateName} stateName - The unique name of the state.
   * @param {T} defaultState - The default state value to use if no state is found.
   * @returns {T | Promise<T>} The current state value, synchronously or asynchronously.
   */
  getState?: (
    clientId: string,
    stateName: StateName,
    defaultState: T
  ) => T | Promise<T>;

  /**
   * Optional function to set or update the state.
   * Overrides default state setting behavior if provided.
   * @param {T} state - The new state value to set.
   * @param {string} clientId - The unique ID of the client updating the state.
   * @param {StateName} stateName - The unique name of the state.
   * @returns {Promise<void> | void} A promise that resolves when the state is set, or void if synchronous.
   * @throws {Error} If the state update fails (e.g., due to persistence issues).
   */
  setState?: (
    state: T,
    clientId: string,
    stateName: StateName
  ) => Promise<void> | void;

  /** Optional array of middleware functions to process the state during lifecycle operations. */
  middlewares?: IStateMiddleware<T>[];

  /** Optional partial set of lifecycle callbacks for the state, allowing customization of state events. */
  callbacks?: Partial<IStateCallbacks<T>>;
}

/**
 * Interface representing the runtime parameters for state management.
 * Extends the state schema with client-specific runtime dependencies.
 * @template T - The type of the state data, defaults to IStateData.
 * @extends {IStateSchema<T>}
 */
export interface IStateParams<T extends IStateData = IStateData>
  extends IStateSchema<T> {
  /** The unique ID of the client associated with the state instance. */
  clientId: string;

  /** The logger instance for recording state-related activity and errors. */
  logger: ILogger;

  /** The bus instance for event communication within the swarm. */
  bus: IBus;
}

/**
 * Interface representing the runtime state management API.
 * Provides methods to get, set, and clear the state.
 * @template T - The type of the state data, defaults to IStateData.
 */
export interface IState<T extends IStateData = IStateData> {
  /**
   * Retrieves the current state value.
   * Applies any configured middleware or custom `getState` logic from the schema.
   * @returns {Promise<T>} A promise resolving to the current state value.
   * @throws {Error} If state retrieval fails (e.g., due to persistence issues or invalid configuration).
   */
  getState: () => Promise<T>;

  /**
   * Updates the state using a dispatch function that computes the new state from the previous state.
   * Applies any configured middleware or custom `setState` logic from the schema.
   * @param {(prevState: T) => Promise<T>} dispatchFn - An async function that takes the previous state and returns the new state.
   * @returns {Promise<T>} A promise resolving to the updated state value.
   * @throws {Error} If state update fails (e.g., due to middleware errors or persistence issues).
   */
  setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;

  /**
   * Resets the state to its initial default value.
   * Reverts to the value provided by `getDefaultState` in the schema.
   * @returns {Promise<T>} A promise resolving to the initial state value.
   * @throws {Error} If state clearing fails (e.g., due to persistence issues or invalid default state).
   */
  clearState: () => Promise<T>;
}

/**
 * Type representing the unique name of a state within the swarm.
 * Used to identify and reference specific state instances.
 */
export type StateName = string;
