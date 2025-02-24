import { queued, singleshot } from "functools-kit";
import {
  IState,
  IStateData,
  IStateParams,
} from "../interfaces/State.interface";

type DispatchFn<State extends IStateData = IStateData> = (
  prevState: State
) => Promise<State>;

type Action = "read" | "write";

export class ClientState<State extends IStateData = IStateData>
  implements IState<State>
{
  private _state: State = null as State;

  private dispatch = queued(
    async (action: Action, payload?: DispatchFn<State>) => {
      if (action === "read") {
        return this._state;
      }
      if (action === "write") {
        console.assert(
          payload,
          `agent-swarm ClientState write action undefined payload`
        );
        return this._state = await payload(this._state);
      }
      throw new Error("agent-swarm ClientState unknown action");
    }
  ) as (action: string, payload?: DispatchFn<State>) => Promise<State>;

  constructor(readonly params: IStateParams<State>) {
    if (this.params.callbacks?.onInit) {
      this.params.callbacks.onInit(this.params.clientId, this.params.stateName);
    }
  }

  public waitForInit = singleshot(async () => {
    this.params.logger.debug(
      `ClientStorage stateName=${this.params.stateName} clientId=${this.params.clientId} waitForInit`
    );
    this._state = await this.params.getState(
      this.params.clientId,
      this.params.stateName
    );
    this.params.logger.debug(
      `ClientStorage stateName=${this.params.stateName} clientId=${this.params.clientId} waitForInit output`,
      { initialState: this._state }
    );
    if (this.params.callbacks?.onLoad) {
      this.params.callbacks.onLoad(
        this._state,
        this.params.clientId,
        this.params.stateName
      );
    }
  });

  public setState = async (dispatchFn: DispatchFn<State>) => {
    this.params.logger.debug(
      `ClientStorage stateName=${this.params.stateName} clientId=${this.params.clientId} setState`
    );
    await this.dispatch(
      "write",
      async (currentState: State) => {
        for (const middleware of this.params.middlewares) {
          currentState = await middleware(
            currentState,
            this.params.clientId,
            this.params.stateName
          );
        }
        return await dispatchFn(currentState);
      }
    );
    this.params.logger.debug(
      `ClientStorage stateName=${this.params.stateName} clientId=${this.params.clientId} setState output`,
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
    return this._state;
  };

  public getState = async () => {
    this.params.logger.debug(
      `ClientStorage stateName=${this.params.stateName} clientId=${this.params.clientId} getState`
    );
    await this.dispatch("read");
    if (this.params.callbacks?.onRead) {
      this.params.callbacks.onRead(
        this._state,
        this.params.clientId,
        this.params.stateName
      );
    }
    return this._state;
  };

  public dispose = async () => {
    this.params.logger.debug(
      `ClientStorage stateName=${this.params.stateName} clientId=${this.params.clientId} dispose`
    );
    if (this.params.callbacks?.onDispose) {
      this.params.callbacks.onDispose(
        this.params.clientId,
        this.params.stateName
      );
    }
  };
}

export default ClientState;
