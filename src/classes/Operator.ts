import { makeExtendable, memoize, Subject } from "functools-kit";
import { AgentName } from "../interfaces/Agent.interface";
import swarm from "../lib";
import { GLOBAL_CONFIG } from "../config/params";

type DisposeFn = () => void;

/**
 * Callbacks interface for OperatorInstance events
 * @interface IOperatorInstanceCallbacks
 */
interface IOperatorInstanceCallbacks {
  /** Called when operator instance is initialized */
  onInit: (clientId: string, agentName: AgentName) => void;
  /** Called when operator provides an answer */
  onAnswer: (answer: string, clientId: string, agentName: AgentName) => void;
  /** Called when operator receives a message */
  onMessage: (message: string, clientId: string, agentName: AgentName) => void;
  /** Called when operator instance is disposed */
  onDispose: (clientId: string, agentName: AgentName) => void;
  /** Called when operator sends a notification */
  onNotify: (answer: string, clientId: string, agentName: AgentName) => void;
}

/**
 * Interface for Operator instance functionality
 * @interface IOperatorInstance
 */
interface IOperatorInstance {
  /** Connects an answer handler */
  connectAnswer(next: (answer: string) => void): void;
  /** Sends an answer */
  answer(content: string): Promise<void>;
  /** Sends a notification */
  notify(content: string): Promise<void>;
  /** Receives a message */
  recieveMessage(message: string): Promise<void>;
  /** Disposes the operator instance */
  dispose(): Promise<void>;
}

/**
 * Constructor type for OperatorInstance
 * @typedef {new (clientId: string, agentName: AgentName, callbacks: Partial<IOperatorInstanceCallbacks>) => IOperatorInstance} TOperatorInstanceCtor
 */
export type TOperatorInstanceCtor = new (
  clientId: string,
  agentName: AgentName,
  callbacks: Partial<IOperatorInstanceCallbacks>
) => IOperatorInstance;

/** @private Constant for logging the constructor in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_CTOR = "OperatorInstance.CTOR";

/** @private Constant for logging the connectAnswer method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_CONNECT_ANSWER =
  "OperatorInstance.connectAnswer";

/** @private Constant for logging the notify method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_NOTIFY = "OperatorInstance.notify";

/** @private Constant for logging the answer method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_ANSWER = "OperatorInstance.answer";

/** @private Constant for logging the recieveMessage method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_RECEIVE_MESSAGE =
  "OperatorInstance.recieveMessage";

/** @private Constant for logging the dispose method in OperatorInstance */
const OPERATOR_INSTANCE_METHOD_NAME_DISPOSE = "OperatorInstance.dispose";

/** @private Constant for logging the useOperatorAdapter method in OperatorUtils */
const METHOD_NAME_USE_OPERATOR_ADAPTER = "OperatorUtils.useOperatorAdapter";

/** @private Constant for logging the useOperatorCallbacks method in OperatorUtils */
const METHOD_NAME_USE_OPERATOR_CALLBACKS = "OperatorUtils.useOperatorCallbacks";

/** @private Constant for logging the connectOperator method in OperatorUtils */
const METHOD_NAME_CONNECT_OPERATOR = "OperatorUtils.connectOperator";

/**
 * Operator instance implementation
 * @class OperatorInstance
 * @implements {IOperatorInstance}
 */
export const OperatorInstance = makeExtendable(
  class implements IOperatorInstance {
    _answerSubject = new Subject<string>();
    _isDisposed = false;

    /**
     * Disposed flag for child class
     */
    get isDisposed() {
      return this._isDisposed;
    }

    /**
     * Creates an OperatorInstance
     * @param {string} clientId - The client identifier
     * @param {AgentName} agentName - The agent name
     * @param {Partial<IOperatorInstanceCallbacks>} callbacks - Event callbacks
     */
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

    /**
     * Connects an answer subscription
     * @param {(answer: string) => void} next - Answer handler callback
     */
    public connectAnswer(next: (answer: string) => void) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug(
          OPERATOR_INSTANCE_METHOD_NAME_CONNECT_ANSWER,
          {
            clientId: this.clientId,
            agentName: this.agentName,
          }
        );
      this._answerSubject.unsubscribeAll();
      this._answerSubject.subscribe(next);
    }

    /**
     * Sends a notification
     * @param {string} content - Notification content
     * @returns {Promise<void>}
     */
    public async notify(content: string) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_NOTIFY, {
          clientId: this.clientId,
          agentName: this.agentName,
          content,
        });
      if (this._isDisposed) {
        return;
      }
      if (this.callbacks.onNotify) {
        this.callbacks.onNotify(content, this.clientId, this.agentName);
      }
    }

    /**
     * Sends an answer
     * @param {string} content - Answer content
     * @returns {Promise<void>}
     */
    public async answer(content: string) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug(OPERATOR_INSTANCE_METHOD_NAME_ANSWER, {
          clientId: this.clientId,
          agentName: this.agentName,
          content,
        });
      if (this._isDisposed) {
        return;
      }
      if (this._answerSubject.hasListeners) {
        this.callbacks.onAnswer &&
          this.callbacks.onAnswer(content, this.clientId, this.agentName);
        await this._answerSubject.next(content);
      } else {
        await this.notify(content);
      }
      this._answerSubject.unsubscribeAll();
    }

    /**
     * Receives a message
     * @param {string} message - Message content
     * @returns {Promise<void>}
     */
    public async recieveMessage(message: string) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        swarm.loggerService.debug(
          OPERATOR_INSTANCE_METHOD_NAME_RECEIVE_MESSAGE,
          {
            clientId: this.clientId,
            agentName: this.agentName,
            message,
          }
        );
      if (this.callbacks.onMessage) {
        this.callbacks.onMessage(message, this.clientId, this.agentName);
      }
    }

    /**
     * Disposes the operator instance
     * @returns {Promise<void>}
     */
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
      this._isDisposed = true;
    }
  }
);

/**
 * Operator control interface
 * @interface IOperatorControl
 */
export interface IOperatorControl {
  /** Sets custom operator adapter */
  useOperatorAdapter(Ctor: TOperatorInstanceCtor): void;
  /** Sets operator callbacks */
  useOperatorCallbacks: (
    Callbacks: Partial<IOperatorInstanceCallbacks>
  ) => void;
}

/**
 * Operator utilities class
 * @class OperatorUtils
 * @implements {IOperatorControl}
 */
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

  /**
   * Sets custom operator adapter constructor
   * @param {TOperatorInstanceCtor} Ctor - Operator constructor
   */
  public useOperatorAdapter(Ctor: TOperatorInstanceCtor) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_USE_OPERATOR_ADAPTER);
    this.OperatorFactory = Ctor;
  }

  /**
   * Sets operator callbacks
   * @param {Partial<IOperatorInstanceCallbacks>} Callbacks - Callback functions
   */
  public useOperatorCallbacks(Callbacks: Partial<IOperatorInstanceCallbacks>) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_LOG &&
      swarm.loggerService.log(METHOD_NAME_USE_OPERATOR_CALLBACKS);
    Object.assign(this.OperatorCallbacks, Callbacks);
  }

  /**
   * Connects an operator instance
   * @param {string} clientId - Client identifier
   * @param {AgentName} agentName - Agent name
   * @returns {(message: string, next: (answer: string) => void) => DisposeFn} Connection function
   */
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

/** @type {OperatorUtils} Operator adapter instance */
export const OperatorAdapter = new OperatorUtils();

/** @type {IOperatorControl} Operator control instance */
export const Operator = OperatorAdapter as IOperatorControl;
