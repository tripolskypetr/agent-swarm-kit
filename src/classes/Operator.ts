import { memoize, Subject } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";

type DisposeFn = () => void;

interface IOperatorInstanceCallbacks {
  onInit: (clientId: string, agentName: AgentName) => void;
  onAnswer: (answer: string, clientId: string, agentName: AgentName) => void;
  onMessage: (message: string, clientId: string, agentName: AgentName) => void;
  onDispose: (clientId: string, agentName: AgentName) => void;
  onNotify: (answer: string, clientId: string, agentName: AgentName) => void;
}

interface IOperatorInstance {
  connectAnswer(next: (answer: string) => void): void;
  answer(content: string): Promise<void>;
  notify(content: string): Promise<void>;
  recieveMessage(message: string): Promise<void>;
  dispose(): Promise<void>;
}

export type TOperatorInstanceCtor = new (
  clientId: string,
  agentName: AgentName,
  callbacks: Partial<IOperatorInstanceCallbacks>
) => IOperatorInstance;

export class OperatorInstance implements IOperatorInstance {
  private _answerSubject = new Subject<string>();

  constructor(
    readonly clientId: string,
    readonly agentName: AgentName,
    readonly callbacks: Partial<IOperatorInstanceCallbacks>
  ) {
    if (this.callbacks.onInit) {
      this.callbacks.onInit(clientId, agentName);
    }
  }

  public connectAnswer(next: (answer: string) => void) {
    this._answerSubject.unsubscribeAll();
    this._answerSubject.subscribe(next);
  }

  public async notify(content: string) {
    if (this.callbacks.onNotify) {
      this.callbacks.onNotify(content, this.clientId, this.agentName);
    }
  }

  public async answer(content: string) {
    if (this._answerSubject.hasListeners) {
      this.callbacks.onAnswer &&
        this.callbacks.onAnswer(content, this.clientId, this.agentName);
      await this._answerSubject.next(content);
    } else {
      await this.notify(content);
    }
    this._answerSubject.unsubscribeAll();
  }

  public async recieveMessage(message: string) {
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage(message, this.clientId, this.agentName);
    }
  }

  public async dispose() {
    if (this.callbacks.onDispose) {
      this.callbacks.onDispose(this.clientId, this.agentName);
    }
    this._answerSubject.unsubscribeAll();
  }
}

export interface IOperatorControl {
  useOperatorAdapter(Ctor: TOperatorInstanceCtor): void;
  useOperatorCallbacks: (
    Callbacks: Partial<IOperatorInstanceCallbacks>
  ) => void;
}

export class OperatorUtils implements IOperatorControl {
  private OperatorFactory: TOperatorInstanceCtor = OperatorInstance;
  private OperatorCallbacks: Partial<IOperatorInstanceCallbacks> = {};

  private getOperator = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: AgentName) =>
      Reflect.construct(this.OperatorFactory, [
        clientId,
        agentName,
        this.OperatorCallbacks,
      ])
  );

  public useOperatorAdapter(Ctor: TOperatorInstanceCtor) {
    this.OperatorFactory = Ctor;
  }

  public useOperatorCallbacks(Callbacks: Partial<IOperatorInstanceCallbacks>) {
    Object.assign(this.OperatorCallbacks, Callbacks);
  }

  public connectOperator(clientId: string, agentName: AgentName) {
    const operator = this.getOperator(clientId, agentName);
    return (message: string, next: (answer: string) => void): DisposeFn => {
      operator.connectAnswer(next);
      operator.recieveMessage(message);
      return async () => {
        this.getOperator.clear(`${clientId}-${agentName}`);
        await operator.dispose();
      };
    };
  }
}

export const OperatorAdapter = new OperatorUtils();

export const Operator = OperatorAdapter as IOperatorControl;
