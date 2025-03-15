import { queued, singleshot } from "functools-kit";
import {
  IState,
  IStateData,
  IStateParams,
} from "../interfaces/State.interface";
import { IBusEvent } from "../model/Event.model";
import { GLOBAL_CONFIG } from "../config/params";

type DispatchFn<State extends IStateData = IStateData> = (
  prevState: State
) => Promise<State>;

type Action = "read" | "write";

/**
 * Dispatches an action to read or write the state.
 * @template State - The type of the state data.
 * @param {Action} action - The action to perform ("read" or "write").
 * @param {ClientState} self - The instance of ClientState.
 * @param {DispatchFn<State>} [payload] - The function to update the state (required for "write").
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
 * Initializes the state by fetching it or using the default state.
 * Invokes the onLoad callback if provided.
 * @param {ClientState} self - The instance of ClientState.
 * @returns {Promise<void>}
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
 * Class representing the client state, managing state data with read/write operations.
 * @template State - The type of the state data, extending IStateData.
 * @implements {IState<State>}
 */
export class ClientState<State extends IStateData = IStateData>
  implements IState<State>
{
  /**
   * The current state data, initialized as null and set during waitForInit.
   */
  _state: State = null as State;

  /**
   * Queued dispatch function to read or write the state.
   * @param {string} action - The action to perform ("read" or "write").
   * @param {DispatchFn<State>} [payload] - The function to update the state (required for "write").
   * @returns {Promise<State>} The current or updated state.
   */
  dispatch = queued(
    async (action: Action, payload) =>
      await DISPATCH_FN<State>(action, this, payload)
  ) as (action: string, payload?: DispatchFn<State>) => Promise<State>;

  /**
   * Creates an instance of ClientState.
   * Invokes the onInit callback if provided.
   * @param {IStateParams<State>} params - The parameters for initializing the state.
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
   * Waits for the state to initialize, ensuring it’s only called once.
   * Uses singleshot to prevent multiple initializations.
   * @returns {Promise<void>}
   */
  waitForInit = singleshot(async (): Promise<void> => await WAIT_FOR_INIT_FN(this));

  /**
   * Sets the state using the provided dispatch function, applying middlewares and persisting the result.
   * Invokes the onWrite callback and emits an event if configured.
   * @param {DispatchFn<State>} dispatchFn - The function to update the state.
   * @returns {Promise<State>} The updated state.
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
    return this._state;
  }

  /**
   * Resets the state to its initial value as determined by getState and getDefaultState.
   * Persists the result and invokes the onWrite callback if configured.
   * @returns {Promise<State>} The reset state.
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
   * Retrieves the current state.
   * Invokes the onRead callback and emits an event if configured.
   * @returns {Promise<State>} The current state.
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
   * Disposes of the state, performing cleanup and invoking the onDispose callback if provided.
   * @returns {Promise<void>}
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
  }
}

export default ClientState;