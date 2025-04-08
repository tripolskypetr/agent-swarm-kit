import { IAgent } from "src/interfaces/Agent.interface";
import { IOperatorParams } from "src/interfaces/Operator.interface";
import { ExecutionMode } from "../interfaces/Session.interface";
import { sleep, Subject } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params"; // Assuming this is available as in ClientAgent

type DisposeFn = () => void;

const OPERATOR_SIGNAL_TIMEOUT = 90_000;
const OPERATOR_SIGNAL_SYMBOL = Symbol("operator-timeout");

class OperatorSignal {
  private _signalFactory: ReturnType<typeof this.params.connectOperator>;
  private _disposeRef: DisposeFn | null = null;

  constructor(readonly params: IOperatorParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      params.logger.debug(
        `OperatorSignal agentName=${params.agentName} clientId=${params.clientId} CTOR`
      );
    this._signalFactory = params.connectOperator(
      params.clientId,
      params.agentName
    );
  }

  public sendMessage(message: string, next: (answer: string) => void) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `OperatorSignal agentName=${this.params.agentName} clientId=${this.params.clientId} sendMessage`,
        { message }
      );
    this._disposeRef = this._signalFactory(message, next);
  }

  public async dispose() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `OperatorSignal agentName=${this.params.agentName} clientId=${this.params.clientId} dispose`
      );
    if (this._disposeRef) {
      this._disposeRef = null;
      await this._disposeRef();
    }
  }
}

export class ClientOperator implements IAgent {
  private _outgoingSubject = new Subject<string>();
  private _operatorSignal: OperatorSignal;

  constructor(readonly params: IOperatorParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} CTOR`,
        { params }
      );
    this._operatorSignal = new OperatorSignal(params);
    this.params.onInit && this.params.onInit(params.clientId, params.agentName);
  }

  async run() {
    console.warn(
      `ClientOperator: run should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} run - not supported`
      );
    return "";
  }

  async execute(input: string, mode: ExecutionMode) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} execute begin`,
        { input, mode }
      );
    if (mode === "tool") {
      console.warn(
        `ClientOperator: execute with tool mode should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
      );
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} execute - tool mode not supported`
        );
      return;
    }
    this._operatorSignal.sendMessage(input, this._outgoingSubject.next);
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} execute end`,
        { input, mode }
      );
  }

  async waitForOutput() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput begin`
      );
    const result = await Promise.race([
      this._outgoingSubject.toPromise(),
      sleep(OPERATOR_SIGNAL_TIMEOUT).then(() => OPERATOR_SIGNAL_SYMBOL),
    ]);
    if (typeof result === "symbol") {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput timeout after ${OPERATOR_SIGNAL_TIMEOUT}ms`
        );
      await this._operatorSignal.dispose();
      return "";
    }
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput end`,
        { result }
      );
    return result;
  }

  commitToolOutput(): Promise<void> {
    console.warn(
      `ClientOperator: commitToolOutput should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitToolOutput - not supported`
      );
    return Promise.resolve();
  }

  commitSystemMessage(): Promise<void> {
    console.warn(
      `ClientOperator: commitSystemMessage should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitSystemMessage - not supported`
      );
    return Promise.resolve();
  }

  commitUserMessage(content: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitUserMessage`,
        { content }
      );
    this._operatorSignal.sendMessage(content, this._outgoingSubject.next);
    return Promise.resolve();
  }

  commitAssistantMessage(): Promise<void> {
    console.warn(
      `ClientOperator: commitAssistantMessage should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitAssistantMessage - not supported`
      );
    return Promise.resolve();
  }

  commitFlush(): Promise<void> {
    console.warn(
      `ClientOperator: commitFlush should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitFlush - not supported`
      );
    return Promise.resolve();
  }

  commitStopTools(): Promise<void> {
    console.warn(
      `ClientOperator: commitStopTools should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitStopTools - not supported`
      );
    return Promise.resolve();
  }

  async commitAgentChange(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitAgentChange`
      );
    await this._operatorSignal.dispose();
  }

  async dispose() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} dispose`
      );
    await this._operatorSignal.dispose();
    this._outgoingSubject.unsubscribeAll();
    this.params.onDispose &&
      this.params.onDispose(this.params.clientId, this.params.agentName);
  }
}

export default ClientOperator;
