import { queued, singleshot, Subject } from "functools-kit";
import {
  IState,
  IStateData,
  IStateParams,
  StateName,
} from "../interfaces/State.interface";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";
import { IStateChangeContract } from "../contract/StateChange.contract";

/**
 * Type representing a dispatch function for updating the state in ClientState.
 * Takes the previous state and returns a promise resolving to the updated state.
 * @template State - The type of the state data, extending IStateData from State.interface.
 * @typedef {(prevState: State) => Promise<State>} DispatchFn
 */
type DispatchFn<State extends IStateData = IStateData> = (
  prevState: State
) => Promise<State>;

/**
 * Type representing possible actions for ClientState operations.
 * Used in dispatch to determine whether to read or write the state.
 * @typedef {"read" | "write"} Action
 */
type Action = "read" | "write";

/**
 * Dispatches an action to read or write the state, used internally by ClientState’s dispatch method.
 * Ensures thread-safe state access and updates, supporting queued operations.
 * @template State - The type of the state data, extending IStateData from State.interface.
 * @param {Action} action - The action to perform ("read" or "write").
 * @param {ClientState} self - The ClientState instance managing the state.
 * @param {DispatchFn<State>} [payload] - The function to update the state, required for "write" actions.
 * @returns {Promise<State>} The current state for "read" or the updated state for "write".
 * @throws {Error} If the action is neither "read" nor "write", or if payload is missing for "write".
 * @private
 */
const DISPATCH_FN = async <State extends IStateData = IStateData>(
  action: Action,
  self: ClientState,
  payload?: DispatchFn<State>
): Promise<State> => {
  if (action === "read") {
    return self._state;
  }
  if (action === "write") {
    console.assert(
      payload,
      `agent-swarm ClientState write action undefined payload`
    );
    return (self._state = await payload(self._state));
  }
  throw new Error("agent-swarm ClientState unknown action");
};

/**
 * Initializes the state by fetching it via params.getState or using the default state from params.getDefaultState.
 * Invokes the onLoad callback if provided, supporting StateConnectionService’s initialization process.
 * @param {ClientState} self - The ClientState instance to initialize.
 * @returns {Promise<void>} Resolves when the state is loaded into _state and logged.
 * @private
 */
const WAIT_FOR_INIT_FN = async (self: ClientState): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientState stateName=${self.params.stateName} clientId=${self.params.clientId} shared=${self.params.shared} waitForInit`
    );
  self._state = await self.params.getState(
    self.params.clientId,
    self.params.stateName,
    await self.params.getDefaultState(
      self.params.clientId,
      self.params.stateName
    )
  );
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientState stateName=${self.params.stateName} clientId=${self.params.clientId} shared=${self.params.shared} waitForInit output`,
      { initialState: self._state }
    );
  if (self.params.callbacks?.onLoad) {
    self.params.callbacks.onLoad(
      self._state,
      self.params.clientId,
      self.params.stateName
    );
  }
};

/**
 * Class representing the client state in the swarm system, implementing the IState interface.
 * Manages a single state object with queued read/write operations, middleware support, and event-driven updates via BusService.
 * Integrates with StateConnectionService (state instantiation), ClientAgent (state-driven behavior),
 * SwarmConnectionService (swarm-level state), and BusService (event emission).
 * @template State - The type of the state data, extending IStateData from State.interface.
 * @implements {IState<State>}
 */
export class ClientState<State extends IStateData = IStateData>
  implements IState<State>, IStateChangeContract
{
  public readonly stateChanged = new Subject<StateName>();

  /**
   * The current state data, initialized as null and set during waitForInit.
   * Updated by setState and clearState, persisted via params.setState if provided.
   * @type {State}
   */
  _state: State = null as State;

  /**
   * Queued dispatch function to read or write the state, delegating to DISPATCH_FN.
   * Ensures thread-safe state operations, supporting concurrent access from ClientAgent or tools.
   * @param {Action} action - The action to perform ("read" or "write").
   * @param {DispatchFn<State>} [payload] - The function to update the state, required for "write".
   * @returns {Promise<State>} The current state for "read" or the updated state for "write".
   */
  dispatch = queued(
    async (action: Action, payload) =>
      await DISPATCH_FN<State>(action, this, payload)
  ) as (action: Action, payload?: DispatchFn<State>) => Promise<State>;

  /**
   * Constructs a ClientState instance with the provided parameters.
   * Invokes the onInit callback if provided and logs construction if debugging is enabled.
   * @param {IStateParams<State>} params - The parameters for initializing the state, including clientId, stateName, getState, etc.
   */
  constructor(readonly params: IStateParams<State>) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} CTOR`,
        {
          params,
        }
      );
    if (this.params.callbacks?.onInit) {
      this.params.callbacks.onInit(this.params.clientId, this.params.stateName);
    }
  }

  /**
   * Waits for the state to initialize via WAIT_FOR_INIT_FN, ensuring it’s only called once using singleshot.
   * Loads the initial state into _state, supporting StateConnectionService’s lifecycle management.
   * @returns {Promise<void>} Resolves when the state is initialized and loaded.
   */
  waitForInit = singleshot(
    async (): Promise<void> => await WAIT_FOR_INIT_FN(this)
  );

  /**
   * Sets the state using the provided dispatch function, applying middlewares and persisting via params.setState.
   * Invokes the onWrite callback and emits an event via BusService, supporting ClientAgent’s state updates.
   * @param {DispatchFn<State>} dispatchFn - The function to update the state, taking the previous state as input.
   * @returns {Promise<State>} The updated state after applying dispatchFn and middlewares.
   */
  async setState(dispatchFn: DispatchFn<State>): Promise<State> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} setState`
      );
    await this.dispatch("write", async (currentState: State) => {
      currentState = await dispatchFn(currentState);
      for (const middleware of this.params.middlewares) {
        currentState = await middleware(
          currentState,
          this.params.clientId,
          this.params.stateName
        );
      }
      return currentState;
    });
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} setState output`,
        { pendingState: this._state }
      );
    this.params.setState &&
      this.params.setState(
        this._state,
        this.params.clientId,
        this.params.stateName
      );
    if (this.params.callbacks?.onWrite) {
      this.params.callbacks.onWrite(
        this._state,
        this.params.clientId,
        this.params.stateName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "set-state",
      source: "state-bus",
      input: {},
      output: {
        state: this._state,
      },
      context: {
        stateName: this.params.stateName,
      },
      clientId: this.params.clientId,
    });
    await this.stateChanged.next(this.params.stateName);
    return this._state;
  }

  /**
   * Resets the state to its initial value as determined by params.getState and params.getDefaultState.
   * Persists the result via params.setState, invokes the onWrite callback, and emits an event via BusService.
   * Supports resetting state for ClientAgent or swarm-level operations.
   * @returns {Promise<State>} The reset state after reinitialization.
   */
  async clearState(): Promise<State> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} clearState`
      );
    await this.dispatch("write", async () => {
      return await this.params.getState(
        this.params.clientId,
        this.params.stateName,
        await this.params.getDefaultState(
          this.params.clientId,
          this.params.stateName
        )
      );
    });
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} clearState output`,
        { pendingState: this._state }
      );
    this.params.setState &&
      this.params.setState(
        this._state,
        this.params.clientId,
        this.params.stateName
      );
    if (this.params.callbacks?.onWrite) {
      this.params.callbacks.onWrite(
        this._state,
        this.params.clientId,
        this.params.stateName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "clear-state",
      source: "state-bus",
      input: {},
      output: {
        state: this._state,
      },
      context: {
        stateName: this.params.stateName,
      },
      clientId: this.params.clientId,
    });
    return this._state;
  }

  /**
   * Retrieves the current state from _state via the dispatch queue.
   * Invokes the onRead callback and emits an event via BusService, supporting ClientAgent’s state queries.
   * @returns {Promise<State>} The current state as stored in _state.
   */
  async getState(): Promise<State> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} getState`
      );
    await this.dispatch("read");
    if (this.params.callbacks?.onRead) {
      this.params.callbacks.onRead(
        this._state,
        this.params.clientId,
        this.params.stateName
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "get-state",
      source: "state-bus",
      input: {},
      output: {
        state: this._state,
      },
      context: {
        stateName: this.params.stateName,
      },
      clientId: this.params.clientId,
    });
    return this._state;
  }

  /**
   * Disposes of the state instance, performing cleanup and invoking the onDispose callback if provided.
   * Ensures proper resource release with StateConnectionService when the state is no longer needed.
   * @returns {Promise<void>} Resolves when disposal is complete and logged.
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} dispose`
      );
    if (this.params.callbacks?.onDispose) {
      this.params.callbacks.onDispose(
        this.params.clientId,
        this.params.stateName
      );
    }
    this.stateChanged.unsubscribeAll();
  }
}

/**
 * Default export of the ClientState class.
 * Provides the primary implementation of the IState interface for managing client state in the swarm system,
 * integrating with StateConnectionService, ClientAgent, SwarmConnectionService, and BusService,
 * with queued read/write operations, middleware support, and event-driven updates.
 * @type {typeof ClientState}
 */
export default ClientState;
