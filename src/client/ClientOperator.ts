import { IAgent } from "../interfaces/Agent.interface";
import { IOperatorParams } from "../interfaces/Operator.interface";
import { ExecutionMode } from "../interfaces/Session.interface";
import { sleep, Subject } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Type definition for dispose function
 * @typedef {() => void} DisposeFn
 */
type DisposeFn = () => void;

/** @private Timeout duration for operator signal in milliseconds */
const OPERATOR_SIGNAL_TIMEOUT = 90_000;

/** @private Symbol representing operator timeout */
const OPERATOR_SIGNAL_SYMBOL = Symbol("operator-timeout");

/**
 * Manages operator signal communication
 * @class OperatorSignal
 */
class OperatorSignal {
  private _signalFactory: ReturnType<typeof this.params.connectOperator>;
  private _disposeRef: DisposeFn | null = null;

  /**
   * Creates an OperatorSignal instance
   * @param {IOperatorParams} params - Operator parameters
   */
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

  /**
   * Sends a message through the operator signal
   * @param {string} message - Message content
   * @param {(answer: string) => void} next - Callback for response
   */
  public sendMessage(message: string, next: (answer: string) => void) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `OperatorSignal agentName=${this.params.agentName} clientId=${this.params.clientId} sendMessage`,
        { message }
      );
    this._disposeRef = this._signalFactory(message, next);
  }

  /**
   * Disposes the operator signal
   * @returns {Promise<void>}
   */
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

/**
 * Client operator implementation
 * @class ClientOperator
 * @implements {IAgent}
 */
export class ClientOperator implements IAgent {
  private _outgoingSubject = new Subject<string>();
  private _operatorSignal: OperatorSignal;

  /**
   * Creates a ClientOperator instance
   * @param {IOperatorParams} params - Operator parameters
   */
  constructor(readonly params: IOperatorParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} CTOR`,
        { params }
      );
    this._operatorSignal = new OperatorSignal(params);
    this.params.onInit && this.params.onInit(params.clientId, params.agentName);
  }

  /**
   * Runs the operator (not supported)
   * @returns {Promise<string>}
   */
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

  /**
   * Executes an input with specified mode
   * @param {string} input - Input content
   * @param {ExecutionMode} mode - Execution mode
   * @returns {Promise<void>}
   */
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

  /**
   * Waits for operator output with timeout
   * @returns {Promise<string>} Output result or empty string on timeout
   */
  async waitForOutput() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput begin`
      );
    if (!GLOBAL_CONFIG.CC_ENABLE_OPERATOR_TIMEOUT) {
      return await this._outgoingSubject.toPromise();
    }
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
    return result;
  }

  /**
   * Commits tool output (not supported)
   * @returns {Promise<void>}
   */
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

  /**
   * Commits system message (not supported)
   * @returns {Promise<void>}
   */
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

  /**
   * Commits tool request (not supported)
   * @returns {Promise<string[]>}
   */
  commitToolRequest(): Promise<string[]> {
    console.warn(
      `ClientOperator: commitToolRequest should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitToolRequest - not supported`
      );
    return Promise.resolve([]);
  }

  /**
   * Commits user message
   * @param {string} content - Message content
   * @returns {Promise<void>}
   */
  commitUserMessage(content: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitUserMessage`,
        { content }
      );
    this._operatorSignal.sendMessage(content, this._outgoingSubject.next);
    return Promise.resolve();
  }

  /**
   * Commits assistant message (not supported)
   * @returns {Promise<void>}
   */
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

  /**
   * Commits flush (not supported)
   * @returns {Promise<void>}
   */
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

  /**
   * Commits stop tools (not supported)
   * @returns {Promise<void>}
   */
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

  /**
   * Commits stop tools (not supported)
   * @returns {Promise<void>}
   */
  commitCancelOutput(): Promise<void> {
    console.warn(
      `ClientOperator: commitCancelOutput should not be called for clientId=${this.params.clientId} agentName=${this.params.agentName}`
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitCancelOutput - not supported`
      );
    return Promise.resolve();
  }

  /**
   * Commits agent change
   * @returns {Promise<void>}
   */
  async commitAgentChange(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitAgentChange`
      );
    await this._operatorSignal.dispose();
  }

  /**
   * Disposes the client operator
   * @returns {Promise<void>}
   */
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

/**
 * @exports ClientOperator
 * @default
 */
export default ClientOperator;
