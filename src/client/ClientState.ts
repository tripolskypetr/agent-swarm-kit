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

const DISPATCH_FN = async <State extends IStateData = IStateData>(
  action: Action,
  self: ClientState,
  payload?: DispatchFn<State>
) => {
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

const WAIT_FOR_INIT_FN = async (self: ClientState) => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientState stateName=${self.params.stateName} clientId=${self.params.clientId} shared=${self.params.shared} waitForInit`
    );
  self._state = await self.params.getState(
    self.params.clientId,
    self.params.stateName
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
 * Class representing the client state.
 * @template State - The type of the state data.
 * @implements {IState<State>}
 */
export class ClientState<State extends IStateData = IStateData>
  implements IState<State>
{
  _state: State = null as State;

  dispatch = queued(
    async (action: Action, payload) =>
      await DISPATCH_FN<State>(action, this, payload)
  ) as (action: string, payload?: DispatchFn<State>) => Promise<State>;

  /**
   * Creates an instance of ClientState.
   * @param {IStateParams<State>} params - The state parameters.
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
   * Waits for the state to initialize.
   * @returns {Promise<void>}
   */
  waitForInit = singleshot(async () => await WAIT_FOR_INIT_FN(this));

  /**
   * Sets the state using the provided dispatch function.
   * @param {DispatchFn<State>} dispatchFn - The dispatch function.
   * @returns {Promise<State>}
   */
  async setState(dispatchFn: DispatchFn<State>) {
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
   * Sets the to initial value
   * @returns {Promise<State>}
   */
  async clearState() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientState stateName=${this.params.stateName} clientId=${this.params.clientId} shared=${this.params.shared} clearState`
      );
    await this.dispatch("write", async () => {
      return await this.params.getState(
        this.params.clientId,
        this.params.stateName
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
   * Gets the current state.
   * @returns {Promise<State>}
   */
  async getState() {
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
   * Disposes of the state.
   * @returns {Promise<void>}
   */
  dispose() {
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
