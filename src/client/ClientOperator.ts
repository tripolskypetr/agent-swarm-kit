import { IAgent } from "src/interfaces/Agent.interface";
import { IOperatorParams } from "src/interfaces/Operator.interface";
import { ExecutionMode } from "../interfaces/Session.interface";
import { sleep, Subject } from "functools-kit";

type DisposeFn = () => void;

const OPERATOR_SIGNAL_TIMEOUT = 90_000;
const OPERATOR_SIGNAL_SYMBOL = Symbol("operator-timeout");

class OperatorSignal {
  private _signalFactory: ReturnType<typeof this.params.connectOperator>;
  private _disposeRef: DisposeFn | null = null;

  constructor(readonly params: IOperatorParams) {
    this._signalFactory = params.connectOperator(
      params.clientId,
      params.agentName
    );
  }

  public sendMessage(message: string, next: (answer: string) => void) {
    this._disposeRef = this._signalFactory(message, next);
  }

  public async dispose() {
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
    this._operatorSignal = new OperatorSignal(params);
  }

  async run() {
    console.warn(
      `ClientOperator: run should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    return "";
  }

  async execute(input: string, mode: ExecutionMode) {
    if (mode === "tool") {
      console.warn(
        `ClientOperator: execute with tool mode should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
      );
      return;
    }
    this._operatorSignal.sendMessage(input, this._outgoingSubject.next);
  }

  async waitForOutput() {
    const result = await Promise.race([
      this._outgoingSubject.toPromise(),
      sleep(OPERATOR_SIGNAL_TIMEOUT).then(() => OPERATOR_SIGNAL_SYMBOL),
    ]);
    if (typeof result === "symbol") {
      await this._operatorSignal.dispose();
      return "";
    }
    return result;
  }

  commitToolOutput(): Promise<void> {
    console.warn(
      `ClientOperator: commitToolOutput should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    return Promise.resolve();
  }

  commitSystemMessage(): Promise<void> {
    console.warn(
      `ClientOperator: commitSystemMessage should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    return Promise.resolve();
  }

  commitUserMessage(content: string): Promise<void> {
    this._operatorSignal.sendMessage(content, this._outgoingSubject.next);
    return Promise.resolve();
  }

  commitAssistantMessage(): Promise<void> {
    console.warn(
      `ClientOperator: commitAssistantMessage should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    return Promise.resolve();
  }

  commitFlush(): Promise<void> {
    console.warn(
      `ClientOperator: commitFlush should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    return Promise.resolve();
  }

  commitStopTools(): Promise<void> {
    console.warn(
      `ClientOperator: commitStopTools should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    return Promise.resolve();
  }

  async commitAgentChange(): Promise<void> {
    await this._operatorSignal.dispose();
  }

  async dispose() {
    await this._operatorSignal.dispose();
  }
}

export default ClientOperator;
