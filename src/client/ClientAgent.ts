import {
  errorData,
  getErrorMessage,
  not,
  queued,
  randomString,
  Subject,
} from "functools-kit";
import { omit } from "lodash-es";
import { IModelMessage } from "../model/ModelMessage.model";
import { IAgent, IAgentParams } from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import { ExecutionMode } from "../interfaces/Session.interface";
import { IToolCall } from "../model/Tool.model";
import { IBusEvent } from "../model/Event.model";

const AGENT_CHANGE_SYMBOL = Symbol("agent-change");

const getPlaceholder = () =>
  GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS[
    Math.floor(
      Math.random() * GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS.length
    )
  ];

/**
 * Represents a client agent that interacts with the system.
 * @implements {IAgent}
 */
export class ClientAgent implements IAgent {
  readonly _agentChangeSubject = new Subject<typeof AGENT_CHANGE_SYMBOL>();
  readonly _toolCommitSubject = new Subject<void>();
  readonly _toolErrorSubject = new Subject<void>();
  readonly _outputSubject = new Subject<string>();

  /**
   * Creates an instance of ClientAgent.
   * @param {IAgentParams} params - The parameters for the agent.
   */
  constructor(readonly params: IAgentParams) {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} CTOR`,
      {
        params,
      }
    );
    this.params.onInit && this.params.onInit(params.clientId, params.agentName);
  }

  /**
   * Emits the output result after validation.
   * @param {string} result - The result to be emitted.
   * @returns {Promise<void>}
   * @private
   */
  _emitOuput = async (
    mode: ExecutionMode,
    rawResult: string
  ): Promise<void> => {
    const result = await this.params.transform(
      rawResult,
      this.params.clientId,
      this.params.agentName
    );
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _emitOuput`,
      { mode, result, rawResult }
    );
    let validation: string | null = null;
    if ((validation = await this.params.validate(result))) {
      const rawResult = await this._resurrectModel(mode, validation);
      const result = await this.params.transform(
        rawResult,
        this.params.clientId,
        this.params.agentName
      );
      if ((validation = await this.params.validate(result))) {
        throw new Error(
          `agent-swarm-kit ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} model ressurect failed: ${validation}`
        );
      }
      this.params.onOutput &&
        this.params.onOutput(
          this.params.clientId,
          this.params.agentName,
          result
        );
      await this._outputSubject.next(result);
      await this.params.bus.emit<IBusEvent>(this.params.clientId, {
        type: "emit-output",
        source: "agent",
        input: {
          mode,
          rawResult,
        },
        output: {
          result,
        },
        context: {
          agentName: this.params.agentName,
        },
        clientId: this.params.clientId,
      });
      return;
    }
    this.params.onOutput &&
      this.params.onOutput(this.params.clientId, this.params.agentName, result);
    await this._outputSubject.next(result);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "emit-output",
      source: "agent",
      input: {
        mode,
        rawResult,
      },
      output: {
        result,
      },
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
    return;
  };

  /**
   * Resurrects the model based on the given reason.
   * @param {string} [reason] - The reason for resurrecting the model.
   * @returns {Promise<string>}
   * @private
   */
  _resurrectModel = async (
    mode: ExecutionMode,
    reason?: string
  ): Promise<string> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resurrectModel`
    );
    this.params.onResurrect &&
      this.params.onResurrect(
        this.params.clientId,
        this.params.agentName,
        mode,
        reason
      );
    {
      await this.params.history.push({
        role: "resque",
        mode: "tool",
        agentName: this.params.agentName,
        content: reason || "Unknown error",
      });
      await this.params.history.push({
        role: "user",
        mode: "tool",
        agentName: this.params.agentName,
        content: GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_PROMPT,
      });
    }
    const rawMessage = await this.getCompletion(mode);
    const message = await this.params.map(
      rawMessage,
      this.params.clientId,
      this.params.agentName
    );
    const result = await this.params.transform(
      message.content,
      this.params.clientId,
      this.params.agentName
    );
    let validation: string | null = null;
    if ((validation = await this.params.validate(result))) {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resurrectModel validation error: ${validation}`
      );
      const content = getPlaceholder();
      await this.params.history.push({
        agentName: this.params.agentName,
        role: "assistant",
        mode: "tool",
        content,
      });
      return content;
    }
    await this.params.history.push({
      ...message,
      agentName: this.params.agentName,
    });
    return result;
  };

  /**
   * Waits for the output to be available.
   * @returns {Promise<string>}
   */
  waitForOutput = async (): Promise<string> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput`
    );
    return await this._outputSubject.toPromise();
  };

  /**
   * Gets the completion message from the model.
   * @returns {Promise<IModelMessage>}
   */
  getCompletion = async (mode: ExecutionMode): Promise<IModelMessage> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} getCompletion`
    );
    const messages = await this.params.history.toArrayForAgent(
      this.params.prompt,
      this.params.system
    );
    const args = {
      clientId: this.params.clientId,
      agentName: this.params.agentName,
      messages,
      mode,
      tools: this.params.tools?.map((t) =>
        omit(t, "toolName", "call", "validate", "callbacks")
      ),
    };
    const output = await this.params.completion.getCompletion(args);
    this.params.completion.callbacks?.onComplete &&
      this.params.completion.callbacks?.onComplete(args, output);
    return output;
  };

  /**
   * Commits a user message to the history without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  commitUserMessage = async (message: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitUserMessage`,
      { message }
    );
    this.params.onUserMessage &&
      this.params.onUserMessage(
        this.params.clientId,
        this.params.agentName,
        message
      );
    await this.params.history.push({
      role: "user",
      agentName: this.params.agentName,
      mode: "user",
      content: message.trim(),
    });
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-user-message",
      source: "agent",
      input: {
        message,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  };

  /**
   * Commits flush of agent history
   * @returns {Promise<void>}
   */
  commitFlush = async (): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitFlush`
    );
    this.params.onFlush &&
      this.params.onFlush(this.params.clientId, this.params.agentName);
    await this.params.history.push({
      role: "flush",
      agentName: this.params.agentName,
      mode: "tool",
      content: "",
    });
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-flush",
      source: "agent",
      input: {},
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  };

  /**
   * Commits change of agent to prevent the next tool execution from being called.
   * @returns {Promise<void>}
   */
  commitAgentChange = async (): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitAgentChange`
    );
    await this._agentChangeSubject.next(AGENT_CHANGE_SYMBOL);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-agent-change",
      source: "agent",
      input: {},
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  };

  /**
   * Commits a system message to the history.
   * @param {string} message - The system message to commit.
   * @returns {Promise<void>}
   */
  commitSystemMessage = async (message: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitSystemMessage`,
      { message }
    );
    this.params.onSystemMessage &&
      this.params.onSystemMessage(
        this.params.clientId,
        this.params.agentName,
        message
      );
    await this.params.history.push({
      role: "system",
      agentName: this.params.agentName,
      mode: "tool",
      content: message.trim(),
    });
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-system-message",
      source: "agent",
      input: {
        message,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  };

  /**
   * Commits the tool output to the history.
   * @param {string} content - The tool output content.
   * @returns {Promise<void>}
   */
  commitToolOutput = async (toolId: string, content: string): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitToolOutput`,
      { content, toolId }
    );
    this.params.onToolOutput &&
      this.params.onToolOutput(
        toolId,
        this.params.clientId,
        this.params.agentName,
        content
      );
    await this.params.history.push({
      role: "tool",
      agentName: this.params.agentName,
      mode: "tool",
      content,
      tool_call_id: toolId,
    });
    await this._toolCommitSubject.next();
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-tool-output",
      source: "agent",
      input: {
        toolId,
        content,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  };

  /**
   * Executes the incoming message and processes tool calls if any.
   * @param {string} incoming - The incoming message content.
   * @returns {Promise<void>}
   */
  execute = queued(
    async (incoming: string, mode: ExecutionMode): Promise<void> => {
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute begin`,
        { incoming, mode }
      );
      this.params.onExecute &&
        this.params.onExecute(
          this.params.clientId,
          this.params.agentName,
          incoming,
          mode
        );
      await this.params.history.push({
        role: "user",
        mode,
        agentName: this.params.agentName,
        content: incoming.trim(),
      });
      const rawMessage = await this.getCompletion(mode);
      const message = await this.params.map(
        rawMessage,
        this.params.clientId,
        this.params.agentName
      );
      if (message.tool_calls) {
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} tool call begin`
        );
        const toolCalls: IToolCall[] = message.tool_calls.map((call) => ({
          function: call.function,
          id: call.id ?? randomString(),
          type: call.type ?? "function",
        }));
        await this.params.history.push({
          ...message,
          agentName: this.params.agentName,
        });
        for (let idx = 0; idx !== toolCalls.length; idx++) {
          const tool = toolCalls[idx];
          const targetFn = this.params.tools?.find(
            (t) => t.function.name === tool.function.name
          );
          if (!targetFn) {
            this.params.logger.debug(
              `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool function not found`,
              this.params.tools
            );
            const result = await this._resurrectModel(
              mode,
              `No target function for ${tool.function.name}`
            );
            this.params.logger.debug(
              `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute end result=${result}`
            );
            await this._emitOuput(mode, result);
            return;
          }
          targetFn.callbacks?.onValidate &&
            targetFn.callbacks?.onValidate(
              this.params.clientId,
              this.params.agentName,
              tool.function.arguments
            );
          if (
            await not(
              targetFn.validate({
                clientId: this.params.clientId,
                agentName: this.params.agentName,
                params: tool.function.arguments,
                toolCalls,
              })
            )
          ) {
            this.params.logger.debug(
              `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool validation not passed`
            );
            const result = await this._resurrectModel(
              mode,
              `Function validation failed: name=${
                tool.function.name
              } arguments=${JSON.stringify(tool.function.arguments)}`
            );
            this.params.logger.debug(
              `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute end result=${result}`
            );
            await this._emitOuput(mode, result);
            return;
          }
          targetFn.callbacks?.onBeforeCall &&
            targetFn.callbacks?.onBeforeCall(
              tool.id,
              this.params.clientId,
              this.params.agentName,
              tool.function.arguments
            );
          /**
           * @description Do not await to avoid deadlock! The tool can send the message to other agents by emulating user messages
           */
          Promise.resolve(
            targetFn.call({
              toolId: tool.id,
              clientId: this.params.clientId,
              agentName: this.params.agentName,
              params: tool.function.arguments,
              isLast: idx === toolCalls.length - 1,
              toolCalls,
            })
          )
            .then(() => {
              targetFn.callbacks?.onAfterCall &&
                targetFn.callbacks?.onAfterCall(
                  tool.id,
                  this.params.clientId,
                  this.params.agentName,
                  tool.function.arguments
                );
            })
            .catch((error) => {
              console.error(
                `agent-swarm tool call error functionName=${
                  tool.function.name
                } error=${getErrorMessage(error)}`,
                {
                  clientId: this.params.clientId,
                  agentName: this.params.agentName,
                  tool_call_id: tool.id,
                  arguments: tool.function.arguments,
                  error: errorData(error),
                }
              );
              targetFn.callbacks?.onCallError &&
                targetFn.callbacks?.onCallError(
                  tool.id,
                  this.params.clientId,
                  this.params.agentName,
                  tool.function.arguments,
                  error
                );
              this._toolErrorSubject.next();
            });
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool call executing`
          );
          const status = await Promise.race([
            this._agentChangeSubject.toPromise(),
            this._toolCommitSubject.toPromise(),
            this._toolErrorSubject.toPromise(),
            this._outputSubject.toPromise(),
          ]);
          this.params.logger.debug(
            `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} tool call end`
          );
          if (status === AGENT_CHANGE_SYMBOL) {
            this.params.logger.debug(
              `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} functionName=${tool.function.name} the next tool execution stopped due to the agent changed`
            );
            this.params.callbacks?.onAfterToolCalls &&
              this.params.callbacks.onAfterToolCalls(
                this.params.clientId,
                this.params.agentName,
                toolCalls
              );
            return;
          }
        }
        this.params.callbacks?.onAfterToolCalls &&
          this.params.callbacks.onAfterToolCalls(
            this.params.clientId,
            this.params.agentName,
            toolCalls
          );
        return;
      }
      if (!message.tool_calls) {
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute no tool calls detected`
        );
      }
      const result = await this.params.transform(
        message.content,
        this.params.clientId,
        this.params.agentName
      );
      await this.params.history.push({
        ...message,
        agentName: this.params.agentName,
      });
      let validation: string | null = null;
      if ((validation = await this.params.validate(result))) {
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute invalid tool call detected: ${validation}`,
          { result }
        );
        const result1 = await this._resurrectModel(
          mode,
          `Invalid model output: ${result}`
        );
        await this._emitOuput(mode, result1);
        return;
      }
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} execute end result=${result}`
      );
      await this._emitOuput(mode, result);
    }
  ) as IAgent["execute"];

  /**
   * Should call on agent dispose
   * @returns {Promise<void>}
   */
  dispose = async (): Promise<void> => {
    this.params.logger.debug(
      `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} dispose`
    );
    this.params.onDispose &&
      this.params.onDispose(this.params.clientId, this.params.agentName);
  };
}

export default ClientAgent;
