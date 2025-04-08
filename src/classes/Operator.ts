import { memoize, Subject } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

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

/** @private Constant for logging the constructor in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_CTOR = "OperatorInstance.CTOR";

/** @private Constant for logging the connectAnswer method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_CONNECT_ANSWER = "OperatorInstance.connectAnswer";

/** @private Constant for logging the notify method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_NOTIFY = "OperatorInstance.notify";

/** @private Constant for logging the answer method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_ANSWER = "OperatorInstance.answer";

/** @private Constant for logging the recieveMessage method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_RECEIVE_MESSAGE = "OperatorInstance.recieveMessage";

/** @private Constant for logging the dispose method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_DISPOSE = "OperatorInstance.dispose";

/** @private Constant for logging the useOperatorAdapter method in OperatorUtils */
const METHOD_NAME_USE_OPERATOR_ADAPTER = "OperatorUtils.useOperatorAdapter";

/** @private Constant for logging the useOperatorCallbacks method in OperatorUtils */
const METHOD_NAME_USE_OPERATOR_CALLBACKS = "OperatorUtils.useOperatorCallbacks";

/** @private Constant for logging the connectOperator method in OperatorUtils */
const METHOD_NAME_CONNECT_OPERATOR = "OperatorUtils.connectOperator";

export class OperatorInstance implements IOperatorInstance {
  private _answerSubject = new Subject<string>();

  constructor(
    readonly clientId: string,
    readonly agentName: AgentName,
    readonly callbacks: Partial<IOperatorInstanceCallbacks>
  ) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_CTOR, {
        clientId: this.clientId,
        agentName,
      });
    if (this.callbacks.onInit) {
      this.callbacks.onInit(clientId, agentName);
    }
  }

  public connectAnswer(next: (answer: string) => void) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_CONNECT_ANSWER, {
        clientId: this.clientId,
        agentName: this.agentName,
      });
    this._answerSubject.unsubscribeAll();
    this._answerSubject.subscribe(next);
  }

  public async notify(content: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_NOTIFY, {
        clientId: this.clientId,
        agentName: this.agentName,
        content,
      });
    if (this.callbacks.onNotify) {
      this.callbacks.onNotify(content, this.clientId, this.agentName);
    }
  }

  public async answer(content: string) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_ANSWER, {
        clientId: this.clientId,
        agentName: this.agentName,
        content,
      });
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
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_RECEIVE_MESSAGE, {
        clientId: this.clientId,
        agentName: this.agentName,
        message,
      });
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage(message, this.clientId, this.agentName);
    }
  }

  public async dispose() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_DISPOSE, {
        clientId: this.clientId,
        agentName: this.agentName,
      });
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
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_USE_OPERATOR_ADAPTER);
    this.OperatorFactory = Ctor;
  }

  public useOperatorCallbacks(Callbacks: Partial<IOperatorInstanceCallbacks>) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_USE_OPERATOR_CALLBACKS);
    Object.assign(this.OperatorCallbacks, Callbacks);
  }

  public connectOperator(clientId: string, agentName: AgentName) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_CONNECT_OPERATOR, {
        clientId,
        agentName,
      });
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
