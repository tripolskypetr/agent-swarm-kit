import { memoize, singleshot } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import { IModelMessage } from "../model/ModelMessage.model";
import swarm from "../lib";

/**
 * Interface for History Adapter Callbacks
 */
export interface IHistoryInstanceCallbacks {
  /**
   * Filter condition for history messages.
   * @param message - The model message.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   * @returns A promise that resolves to a boolean indicating whether the message passes the filter.
   */
  filterCondition?: (
    message: IModelMessage,
    clientId: string,
    agentName: AgentName
  ) => Promise<boolean> | boolean;

  /**
   * Get data for the history.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   * @returns A promise that resolves to an array of model messages.
   */
  getData: (
    clientId: string,
    agentName: AgentName
  ) => Promise<IModelMessage[]> | IModelMessage[];

  /**
   * Callback for when the history changes.
   * @param data - The array of model messages.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   */
  onChange: (
    data: IModelMessage[],
    clientId: string,
    agentName: AgentName
  ) => void;

  /**
   * Callback for when the history get the new message
   * @param data - The array of model messages.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   */
  onPush: (data: IModelMessage, clientId: string, agentName: AgentName) => void;

  /**
   * Callback for when the history is read. Will be called for each message
   * @param message - The model message.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   */
  onRead: (
    message: IModelMessage,
    clientId: string,
    agentName: AgentName
  ) => void;

  /**
   * Callback for when the read is begin
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   */
  onReadBegin: (clientId: string, agentName: AgentName) => void;

  /**
   * Callback for when the read is end
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   */
  onReadEnd: (clientId: string, agentName: AgentName) => void;

  /**
   * Callback for when the history is disposed.
   * @param clientId - The client ID.
   */
  onDispose: (clientId: string) => void;

  /**
   * Callback for when the history is initialized.
   * @param clientId - The client ID.
   */
  onInit: (clientId: string) => void;

  /**
   * Callback to obtain history ref
   * @param clientId - The client ID.
   */
  onRef: (history: HistoryInstance) => void;
}

/**
 * Interface for History Adapter
 */
export interface IHistoryAdapter {
  /**
   * Iterate over the history messages.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   * @returns An async iterable iterator of model messages.
   */
  iterate(
    clientId: string,
    agentName: AgentName
  ): AsyncIterableIterator<IModelMessage>;

  /**
   * Push a new message to the history.
   * @param value - The model message to push.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   * @returns A promise that resolves when the message is pushed.
   */
  push: (
    value: IModelMessage,
    clientId: string,
    agentName: AgentName
  ) => Promise<void>;

  /**
   * Dispose of the history for a given client and agent.
   * @param clientId - The client ID.
   * @param agentName - The agent name or null.
   * @returns A promise that resolves when the history is disposed.
   */
  dispose: (clientId: string, agentName: AgentName | null) => Promise<void>;
}

/**
 * Interface for History Control
 */
export interface IHistoryControl {
  /**
   * Use a custom history adapter.
   * @param Ctor - The constructor for the history instance.
   */
  useHistoryAdapter(Ctor: THistoryInstanceCtor): void;

  /**
   * Use history lifecycle callbacks.
   * @param Callbacks - The callbacks dictionary.
   */
  useHistoryCallbacks: (Callbacks: Partial<IHistoryInstanceCallbacks>) => void;
}

/**
 * Interface for History Instance
 */
export interface IHistoryInstance {
  /**
   * Iterate over the history messages for a given agent.
   * @param agentName - The agent name.
   * @returns An async iterable iterator of model messages.
   */
  iterate(agentName: AgentName): AsyncIterableIterator<IModelMessage>;

  /**
   * Wait for the history to initialize.
   * @param agentName - The agent name.
   * @param init - Whether the history is initializing.
   * @returns A promise that resolves when the history is initialized.
   */
  waitForInit(agentName: AgentName, init: boolean): Promise<void>;

  /**
   * Push a new message to the history for a given agent.
   * @param value - The model message to push.
   * @param agentName - The agent name.
   * @returns A promise that resolves when the message is pushed.
   */
  push(value: IModelMessage, agentName: AgentName): Promise<void>;

  /**
   * Dispose of the history for a given agent.
   * @param agentName - The agent name or null.
   * @returns A promise that resolves when the history is disposed.
   */
  dispose(agentName: AgentName | null): Promise<void>;
}

/**
 * Type for History Instance Constructor
 */
export type THistoryInstanceCtor = new (
  clientId: string,
  ...args: unknown[]
) => IHistoryInstance;

/**
 * Class representing a History Instance
 */
export class HistoryInstance implements IHistoryInstance {
  private _array: IModelMessage[] = [];

  /**
   * Wait for the history to initialize.
   * @param agentName - The agent name.
   */
  public waitForInit = singleshot(async (agentName: AgentName) => {
    swarm.loggerService.log("HistoryInstance waitForInit", {
      clientId: this.clientId,
      agentName,
    });
    if (this.callbacks.getData) {
      this._array = await this.callbacks.getData(this.clientId, agentName);
    }
  });

  /**
   * Create a HistoryInstance.
   * @param clientId - The client ID.
   * @param callbacks - The callbacks for the history instance.
   */
  constructor(
    readonly clientId: string,
    readonly callbacks: Partial<IHistoryInstanceCallbacks>
  ) {
    swarm.loggerService.log("HistoryInstance CTOR", {
      clientId: this.clientId,
    });
    if (callbacks.onInit) {
      callbacks.onInit(clientId);
    }
    if (callbacks.onRef) {
      callbacks.onRef(this);
    }
    if (callbacks.filterCondition) {
      this.iterate = async function* (
        agentName: AgentName
      ): AsyncIterableIterator<IModelMessage> {
        swarm.loggerService.log("HistoryInstance iterate condition", {
          clientId: this.clientId,
          agentName,
        });
        if (this.callbacks.onRead) {
          this.callbacks.onReadBegin &&
            this.callbacks.onReadBegin(this.clientId, agentName);
          for (const item of this._array) {
            if (
              await this.callbacks.filterCondition(
                item,
                this.clientId,
                agentName
              )
            ) {
              this.callbacks.onRead(item, this.clientId, agentName);
              yield item;
            }
          }
          this.callbacks.onReadEnd &&
            this.callbacks.onReadEnd(this.clientId, agentName);
          return;
        }
        this.callbacks.onReadBegin &&
          this.callbacks.onReadBegin(this.clientId, agentName);
        for (const item of this._array) {
          if (
            await this.callbacks.filterCondition(item, this.clientId, agentName)
          ) {
            yield item;
          }
        }
        this.callbacks.onReadEnd &&
          this.callbacks.onReadEnd(this.clientId, agentName);
      };
    }
  }

  /**
   * Iterate over the history messages for a given agent.
   * @param agentName - The agent name.
   * @returns An async iterable iterator of model messages.
   */
  public async *iterate(
    agentName: AgentName
  ): AsyncIterableIterator<IModelMessage> {
    swarm.loggerService.log("HistoryInstance iterate", {
      clientId: this.clientId,
      agentName,
    });
    if (this.callbacks.onRead) {
      this.callbacks.onReadBegin &&
        this.callbacks.onReadBegin(this.clientId, agentName);
      for (const item of this._array) {
        this.callbacks.onRead(item, this.clientId, agentName);
        yield item;
      }
      this.callbacks.onReadEnd &&
        this.callbacks.onReadEnd(this.clientId, agentName);
      return;
    }
    this.callbacks.onReadBegin &&
      this.callbacks.onReadBegin(this.clientId, agentName);
    for (const item of this._array) {
      yield item;
    }
    this.callbacks.onReadEnd &&
      this.callbacks.onReadEnd(this.clientId, agentName);
  }

  /**
   * Push a new message to the history for a given agent.
   * @param value - The model message to push.
   * @param agentName - The agent name.
   * @returns A promise that resolves when the message is pushed.
   */
  public push = async (value: IModelMessage, agentName: AgentName) => {
    swarm.loggerService.log("HistoryInstance push", {
      clientId: this.clientId,
      agentName,
    });
    this.callbacks.onPush &&
      this.callbacks.onPush(value, this.clientId, agentName);
    this._array.push(value);
    this.callbacks.onChange &&
      this.callbacks.onChange(this._array, this.clientId, agentName);
    return Promise.resolve();
  };

  /**
   * Dispose of the history for a given agent.
   * @param agentName - The agent name or null.
   * @returns A promise that resolves when the history is disposed.
   */
  public dispose = async (agentName: AgentName | null) => {
    swarm.loggerService.log("HistoryInstance dispose", {
      clientId: this.clientId,
      agentName,
    });
    if (agentName === null) {
      this.callbacks.onDispose && this.callbacks.onDispose(this.clientId);
      this._array = [];
    }
    return Promise.resolve();
  };
}

/**
 * Class representing History Utilities
 */
class HistoryUtils implements IHistoryAdapter, IHistoryControl {
  private HistoryFactory: THistoryInstanceCtor = HistoryInstance;
  private HistoryCallbacks: Partial<IHistoryInstanceCallbacks> = {};

  private getHistory = memoize(
    ([clientId]) => clientId,
    (clientId: string) =>
      new this.HistoryFactory(clientId, this.HistoryCallbacks)
  );

  /**
   * Use a custom history adapter.
   * @param Ctor - The constructor for the history instance.
   */
  public useHistoryAdapter = (Ctor: THistoryInstanceCtor) => {
    swarm.loggerService.log("HistoryUtils useHistoryAdapter");
    this.HistoryFactory = Ctor;
  };

  /**
   * Use history lifecycle callbacks.
   * @param Callbacks - The callbacks dictionary.
   */
  public useHistoryCallbacks = (
    Callbacks: Partial<IHistoryInstanceCallbacks>
  ) => {
    swarm.loggerService.log("HistoryUtils useHistoryCallbacks");
    Object.assign(this.HistoryCallbacks, Callbacks);
  };

  /**
   * Iterate over the history messages.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   * @returns An async iterable iterator of model messages.
   */
  public async *iterate(
    clientId: string,
    agentName: AgentName
  ): AsyncIterableIterator<IModelMessage> {
    swarm.loggerService.log("HistoryUtils iterate", {
      clientId,
      agentName,
    });
    const isInitial = this.getHistory.has(clientId);
    const history = await this.getHistory(clientId);
    await history.waitForInit(agentName, isInitial);
    for await (const item of history.iterate(agentName)) {
      yield item;
    }
  }

  /**
   * Push a new message to the history.
   * @param value - The model message to push.
   * @param clientId - The client ID.
   * @param agentName - The agent name.
   * @returns A promise that resolves when the message is pushed.
   */
  public push = async (
    value: IModelMessage,
    clientId: string,
    agentName: AgentName
  ) => {
    swarm.loggerService.log("HistoryUtils push", {
      clientId,
      agentName,
      value,
    });
    const isInitial = this.getHistory.has(clientId);
    const history = await this.getHistory(clientId);
    await history.waitForInit(agentName, isInitial);
    return await history.push(value, agentName);
  };

  /**
   * Dispose of the history for a given client and agent.
   * @param clientId - The client ID.
   * @param agentName - The agent name or null.
   * @returns A promise that resolves when the history is disposed.
   */
  public dispose = async (clientId: string, agentName: AgentName | null) => {
    swarm.loggerService.log("HistoryUtils dispose", {
      clientId,
      agentName,
    });
    const isInitial = this.getHistory.has(clientId);
    const history = await this.getHistory(clientId);
    await history.waitForInit(agentName, isInitial);
    await history.dispose(agentName);
    if (agentName === null) {
      this.getHistory.clear(clientId);
    }
  };
}

/**
 * Exported History Adapter instance
 */
export const HistoryAdapter = new HistoryUtils();

/**
 * Exported History Control instance
 */
export const History = HistoryAdapter as IHistoryControl;

export default HistoryAdapter;
