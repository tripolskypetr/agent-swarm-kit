import { IAgent } from "../interfaces/Agent.interface";
import { IOperatorParams } from "../interfaces/Operator.interface";
import { ExecutionMode } from "../interfaces/Session.interface";
import { getErrorMessage, sleep, Subject } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { errorSubject } from "../config/emitters";

/**
 * Type definition for dispose function.
 * Function called to clean up resources and connections.
*/
type DisposeFn = () => void;

/** Symbol representing operator timeout*/
const OPERATOR_SIGNAL_SYMBOL = Symbol("operator-timeout");

/**
 * Manages operator signal communication
*/
class OperatorSignal {
  private _signalFactory: ReturnType<typeof this.params.connectOperator>;
  private _disposeRef: DisposeFn | null = null;

  /**
   * Creates an OperatorSignal instance
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
   */
  public sendMessage(message: string, next: (answer: string) => void) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `OperatorSignal agentName=${this.params.agentName} clientId=${this.params.clientId} sendMessage`,
        { message }
      );
    // Dispose the previous signal before opening a new one: overwriting the
    // ref leaks the pending signal, and its late answer would resolve the
    // NEXT waitForOutput with a reply to the previous question.
    if (this._disposeRef) {
      const disposeRef = this._disposeRef;
      this._disposeRef = null;
      try {
        disposeRef();
      } catch (error) {
        // A throwing user dispose must not prevent the next signal from
        // opening — the previous one is torn down on a best-effort basis.
        console.error(
          `agent-swarm operator signal dispose error agentName=${
            this.params.agentName
          } clientId=${this.params.clientId} error=${getErrorMessage(error)}`
        );
      }
    }
    this._disposeRef = this._signalFactory(message, next);
  }

  /**
   * Disposes the operator signal
   */
  public async dispose() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `OperatorSignal agentName=${this.params.agentName} clientId=${this.params.clientId} dispose`
      );
    if (this._disposeRef) {
      const disposeRef = this._disposeRef;
      this._disposeRef = null;
      try {
        await disposeRef();
      } catch (error) {
        // dispose is awaited from waitForOutput's timeout path: a throwing
        // user dispose would reject waitForOutput and hang the swarm race.
        console.error(
          `agent-swarm operator signal dispose error agentName=${
            this.params.agentName
          } clientId=${this.params.clientId} error=${getErrorMessage(error)}`
        );
      }
    }
  }
}

/**
 * Client operator implementation
*/
export class ClientOperator implements IAgent {
  private _outgoingSubject = new Subject<string>();
  private _operatorSignal: OperatorSignal;

  /**
   * Creates a ClientOperator instance
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
   */
  async execute(input: string, mode: ExecutionMode) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} execute begin`,
        { input, mode }
      );
    if (mode === "tool") {
      // A tool-mode execute reaching an operator is normal: navigation to an
      // operator agent ends with executeForce (mode "tool"). Forward it to the
      // human instead of returning silently — returning would leave the
      // enclosing waitForOutput hanging forever, making the operator agent
      // unreachable through navigation.
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} execute tool mode forwarded to operator`
        );
    }
    try {
      this._operatorSignal.sendMessage(input, this._outgoingSubject.next);
    } catch (error) {
      // execute is fired without await from ClientSession.execute: a throwing
      // operator connector would surface as an unhandled rejection and crash
      // the host process. Surface the error instead; the pending waitForOutput
      // resolves through the operator timeout.
      console.error(
        `agent-swarm operator connector error agentName=${
          this.params.agentName
        } clientId=${this.params.clientId} error=${getErrorMessage(error)}`
      );
      await errorSubject.next([this.params.clientId, error as Error]);
    }
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} execute end`,
        { input, mode }
      );
  }

  /**
   * Waits for operator output with timeout
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
      sleep(GLOBAL_CONFIG.CC_OPERATOR_SIGNAL_TIMEOUT).then(
        () => OPERATOR_SIGNAL_SYMBOL
      ),
    ]);
    if (typeof result === "symbol") {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput timeout after ${GLOBAL_CONFIG.CC_OPERATOR_SIGNAL_TIMEOUT}ms`
        );
      await this._operatorSignal.dispose();
      return "";
    }
    return result;
  }

  /**
   * Commits tool output (not supported)
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
   * Commits a developer message
   */
  commitDeveloperMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientOperator agentName=${this.params.agentName} clientId=${this.params.clientId} commitDeveloperMessage - not supported`,
        { message }
      );
    return Promise.resolve();
  }

  /**
   * Commits tool request (not supported)
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
 * Default export of the ClientOperator class.
*/
export default ClientOperator;
