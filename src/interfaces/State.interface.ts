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
  */
  onInit: (clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is disposed of.
   * Useful for cleanup or logging.
  */
  onDispose: (clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is loaded from storage or initialized.
  */
  onLoad: (state: T, clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is read.
   * Useful for monitoring or logging read operations.
  */
  onRead: (state: T, clientId: string, stateName: StateName) => void;

  /**
   * Callback triggered when the state is written or updated.
   * Useful for tracking changes or triggering side effects.
  */
  onWrite: (state: T, clientId: string, stateName: StateName) => void;
}

/**
 * Interface representing the schema for state management.
 * Defines the configuration and behavior of a state within the swarm.
 * @template T - The type of the state data, defaults to IStateData.
*/
export interface IStateSchema<T extends IStateData = IStateData> {
  /** Optional flag to enable serialization of state values to persistent storage (e.g., hard drive).*/
  persist?: boolean;

  /** Optional description for documentation purposes, aiding in state usage understanding.*/
  docDescription?: string;

  /** Optional flag indicating whether the state can be shared across multiple agents.*/
  shared?: boolean;

  /** The unique name of the state within the swarm.*/
  stateName: StateName;

  /**
   * Function to retrieve or compute the default state value.
  */
  getDefaultState: (clientId: string, stateName: StateName) => T | Promise<T>;

  /**
   * Optional function to retrieve the current state, with a fallback to the default state.
   * Overrides default state retrieval behavior if provided.
  */
  getState?: (
    clientId: string,
    stateName: StateName,
    defaultState: T
  ) => T | Promise<T>;

  /**
   * Optional function to set or update the state.
   * Overrides default state setting behavior if provided.
   * @throws {Error} If the state update fails (e.g., due to persistence issues).
  */
  setState?: (
    state: T,
    clientId: string,
    stateName: StateName
  ) => Promise<void> | void;

  /** Optional array of middleware functions to process the state during lifecycle operations.*/
  middlewares?: IStateMiddleware<T>[];

  /** Optional partial set of lifecycle callbacks for the state, allowing customization of state events.*/
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
  /** The unique ID of the client associated with the state instance.*/
  clientId: string;

  /** The logger instance for recording state-related activity and errors.*/
  logger: ILogger;

  /** The bus instance for event communication within the swarm.*/
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
   * @throws {Error} If state retrieval fails (e.g., due to persistence issues or invalid configuration).
  */
  getState: () => Promise<T>;

  /**
   * Updates the state using a dispatch function that computes the new state from the previous state.
   * Applies any configured middleware or custom `setState` logic from the schema.
   * @throws {Error} If state update fails (e.g., due to middleware errors or persistence issues).
  */
  setState: (dispatchFn: (prevState: T) => Promise<T>) => Promise<T>;

  /**
   * Resets the state to its initial default value.
   * Reverts to the value provided by `getDefaultState` in the schema.
   * @throws {Error} If state clearing fails (e.g., due to persistence issues or invalid default state).
  */
  clearState: () => Promise<T>;
}

/**
 * Type representing the unique name of a state within the swarm.
 * Used to identify and reference specific state instances.
*/
export type StateName = string;
