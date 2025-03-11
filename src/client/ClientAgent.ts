import {
  errorData,
  getErrorMessage,
  not,
  queued,
  randomString,
  sleep,
  Subject,
} from "functools-kit";
import { omit } from "lodash-es";
import { IModelMessage } from "../model/ModelMessage.model";
import {
  IAgent,
  IAgentParams,
  IAgentTool,
} from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import { ExecutionMode } from "../interfaces/Session.interface";
import { IToolCall } from "../model/Tool.model";
import { IBusEvent } from "../model/Event.model";

const AGENT_CHANGE_SYMBOL = Symbol("agent-change");

const MODEL_RESQUE_SYMBOL = Symbol("model-resque");

const TOOL_ERROR_SYMBOL = Symbol("tool-error");
const TOOL_STOP_SYMBOL = Symbol("tool-stop");
const TOOL_NO_OUTPUT_WARNING = 15_000;

const createPlaceholder = () =>
  GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS[
    Math.floor(
      Math.random() * GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS.length
    )
  ];

const createToolCall = async (
  idx: number,
  tool: IToolCall,
  toolCalls: IToolCall[],
  targetFn: IAgentTool,
  self: ClientAgent,
  isResqued: () => boolean
) => {
  if (isResqued()) {
    return;
  }
  try {
    await targetFn.call({
      toolId: tool.id,
      clientId: self.params.clientId,
      agentName: self.params.agentName,
      params: tool.function.arguments,
      isLast: idx === toolCalls.length - 1,
      toolCalls,
    });
    targetFn.callbacks?.onAfterCall &&
      targetFn.callbacks?.onAfterCall(
        tool.id,
        self.params.clientId,
        self.params.agentName,
        tool.function.arguments
      );
  } catch (error) {
    console.error(
      `agent-swarm tool call error functionName=${
        tool.function.name
      } error=${getErrorMessage(error)}`,
      {
        clientId: self.params.clientId,
        agentName: self.params.agentName,
        tool_call_id: tool.id,
        arguments: tool.function.arguments,
        error: errorData(error),
      }
    );
    targetFn.callbacks?.onCallError &&
      targetFn.callbacks?.onCallError(
        tool.id,
        self.params.clientId,
        self.params.agentName,
        tool.function.arguments,
        error
      );
    self._toolErrorSubject.next(TOOL_ERROR_SYMBOL);
  }
};

const RUN_FN = async (incoming: string, self: ClientAgent): Promise<string> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} run begin`,
      { incoming }
    );
  self.params.onRun &&
    self.params.onRun(self.params.clientId, self.params.agentName, incoming);
  const messages = await self.params.history.toArrayForAgent(
    self.params.prompt,
    self.params.system
  );
  messages.push({
    agentName: self.params.agentName,
    content: incoming,
    mode: "user" as const,
    role: "assistant",
  });
  const args = {
    clientId: self.params.clientId,
    agentName: self.params.agentName,
    messages,
    mode: "user" as const,
    tools: self.params.tools?.map((t) =>
      omit(t, "toolName", "docNote", "call", "validate", "callbacks")
    ),
  };
  const rawMessage = await self.params.completion.getCompletion(args);
  self.params.completion.callbacks?.onComplete &&
    self.params.completion.callbacks?.onComplete(args, rawMessage);
  const message = await self.params.map(
    rawMessage,
    self.params.clientId,
    self.params.agentName
  );
  const result = await self.params.transform(
    message.content,
    self.params.clientId,
    self.params.agentName
  );
  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "run",
    source: "agent-bus",
    input: {
      message,
    },
    output: {
      result,
    },
    context: {
      agentName: self.params.agentName,
    },
    clientId: self.params.clientId,
  });
  if (message.tool_calls) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      self.params.logger.debug(
        `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} run should not call tools`,
        { incoming, result }
      );
    return "";
  }
  let validation: string | null = null;
  if ((validation = await self.params.validate(result))) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      self.params.logger.debug(
        `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} run validation not passed: ${validation}`,
        { incoming, result }
      );
    return "";
  }
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} run end result=${result}`
    );
  return result;
};

const EXECUTE_FN = async (
  incoming: string,
  mode: ExecutionMode,
  self: ClientAgent
): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute begin`,
      { incoming, mode }
    );
  self.params.onExecute &&
    self.params.onExecute(
      self.params.clientId,
      self.params.agentName,
      incoming,
      mode
    );
  await self.params.history.push({
    role: "user",
    mode,
    agentName: self.params.agentName,
    content: incoming.trim(),
  });
  const rawMessage = await self.getCompletion(mode);
  const message = await self.params.map(
    rawMessage,
    self.params.clientId,
    self.params.agentName
  );
  if (message.tool_calls) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      self.params.logger.debug(
        `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} tool call begin`
      );
    const toolCalls: IToolCall[] = message.tool_calls
      .map((call) => ({
        function: call.function,
        id: call.id ?? randomString(),
        type: call.type ?? "function",
      }))
      .slice(0, GLOBAL_CONFIG.CC_MAX_TOOLS);
    await self.params.history.push({
      ...message,
      agentName: self.params.agentName,
    });
    /**
     * The next `EXECUTE_FN` is going to be started by `execute` call in the tool body after `commitToolOutput`.
     * So the `EXECUTE_FN` should not be dead locked by the direct await of the tool return value
     *
     * But the next tool call triggered in a single assistant message
     * should be chained to avoid the lose of chat history order.
     * We join them by using last call ref
     *
     * The tool call is try-catched so it is safe to chain Promise.resolve values
     */
    let lastToolCallRef = Promise.resolve();
    /**
     * When the inner `execute` in the call trigger `_resurrectModel` method
     * should prevent the next tool from running in the chain
     */
    let isResqued = false;
    {
      const unResque = self._modelResqueSubject.once(() => {
        isResqued = false;
      });
      /**
       * Effective way of garbage collection cause the agent
       * will defenitely say something or will be recreated on change
       *
       * On navigation:
       *
       * 1. Agent.dispose
       * 2. Agent.createAgentRef
       * 3. Swarm.setAgentRef
       *
       * That means the _outputSubject being marked for GC so this
       * does not matter are we listening it or not
       *
       * @see /src/function/navigate/changeToAgent
       */
      self._outputSubject.once(unResque);
    }
    for (let idx = 0; idx !== toolCalls.length; idx++) {
      const tool = toolCalls[idx];
      const targetFn = self.params.tools?.find(
        (t) => t.function.name === tool.function.name
      );
      if (isResqued) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} tool execution canceled due to the model was resqued in the chain`,
            self.params.tools
          );
        return;
      }
      if (!targetFn) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} tool function not found`,
            self.params.tools
          );
        const result = await self._resurrectModel(
          mode,
          `No target function for ${tool.function.name}`
        );
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute end result=${result}`
          );
        await self._emitOuput(mode, result);
        return;
      }
      targetFn.callbacks?.onValidate &&
        targetFn.callbacks?.onValidate(
          self.params.clientId,
          self.params.agentName,
          tool.function.arguments
        );
      if (
        await not(
          targetFn.validate({
            clientId: self.params.clientId,
            agentName: self.params.agentName,
            params: tool.function.arguments,
            toolCalls,
          })
        )
      ) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} tool validation not passed`
          );
        const result = await self._resurrectModel(
          mode,
          `Function validation failed: name=${
            tool.function.name
          } arguments=${JSON.stringify(tool.function.arguments)}`
        );
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute end result=${result}`
          );
        await self._emitOuput(mode, result);
        return;
      }
      targetFn.callbacks?.onBeforeCall &&
        targetFn.callbacks?.onBeforeCall(
          tool.id,
          self.params.clientId,
          self.params.agentName,
          tool.function.arguments
        );
      /**
       * @description Do not await to avoid deadlock! The tool can send the message to other agents by emulating user messages
       */
      lastToolCallRef = lastToolCallRef.then(() =>
        createToolCall(idx, tool, toolCalls, targetFn, self, () => isResqued)
      );
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        self.params.logger.debug(
          `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} tool call executing`
        );
      let isResolved = false;
      sleep(TOOL_NO_OUTPUT_WARNING).then(() => {
        if (!isResolved) {
          console.warn(
            `agent-swarm no tool output after ${TOOL_NO_OUTPUT_WARNING}ms clientId=${self.params.clientId} agentName=${self.params.agentName} toolId=${tool.id} functionName=${tool.function.name}`
          );
        }
      });
      /**
       * The chain is being unblocked by `commitToolOutput` or exceptional case.
       * That means all the next executions are going to be started after all
       * tools commit their output or raise an exception
       */
      const status = await Promise.race([
        self._agentChangeSubject.toPromise(),
        self._toolCommitSubject.toPromise(),
        self._toolErrorSubject.toPromise(),
        self._toolStopSubject.toPromise(),
        self._outputSubject.toPromise(),
        self._modelResqueSubject.toPromise(),
      ]);
      isResolved = true;
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        self.params.logger.debug(
          `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} tool call end`
        );
      if (status === MODEL_RESQUE_SYMBOL) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} the next tool execution stopped due to the model resque`
          );
        self.params.callbacks?.onAfterToolCalls &&
          self.params.callbacks.onAfterToolCalls(
            self.params.clientId,
            self.params.agentName,
            toolCalls
          );
        return;
      }
      if (status === AGENT_CHANGE_SYMBOL) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} the next tool execution stopped due to the agent changed`
          );
        self.params.callbacks?.onAfterToolCalls &&
          self.params.callbacks.onAfterToolCalls(
            self.params.clientId,
            self.params.agentName,
            toolCalls
          );
        return;
      }
      if (status === TOOL_STOP_SYMBOL) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} the next tool execution stopped due to the commitStopTools call`
          );
        self.params.callbacks?.onAfterToolCalls &&
          self.params.callbacks.onAfterToolCalls(
            self.params.clientId,
            self.params.agentName,
            toolCalls
          );
        return;
      }
      if (status === TOOL_ERROR_SYMBOL) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} the next tool execution stopped due to the call error`
          );
        const result = await self._resurrectModel(
          mode,
          `Function call failed with error: name=${
            tool.function.name
          } arguments=${JSON.stringify(tool.function.arguments)}`
        );
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute end result=${result}`
          );
        await self._emitOuput(mode, result);
        return;
      }
    }
    self.params.callbacks?.onAfterToolCalls &&
      self.params.callbacks.onAfterToolCalls(
        self.params.clientId,
        self.params.agentName,
        toolCalls
      );
    return;
  }
  if (!message.tool_calls) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      self.params.logger.debug(
        `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute no tool calls detected`
      );
  }
  const result = await self.params.transform(
    message.content,
    self.params.clientId,
    self.params.agentName
  );
  await self.params.history.push({
    ...message,
    agentName: self.params.agentName,
  });
  let validation: string | null = null;
  if ((validation = await self.params.validate(result))) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      self.params.logger.debug(
        `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute invalid tool call detected: ${validation}`,
        { result }
      );
    const result1 = await self._resurrectModel(
      mode,
      `Invalid model output: ${result}`
    );
    await self._emitOuput(mode, result1);
    return;
  }
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute end result=${result}`
    );
  await self._emitOuput(mode, result);
};

/**
 * Represents a client agent that interacts with the system.
 * @implements {IAgent}
 */
export class ClientAgent implements IAgent {
  readonly _agentChangeSubject = new Subject<typeof AGENT_CHANGE_SYMBOL>();

  readonly _modelResqueSubject = new Subject<typeof MODEL_RESQUE_SYMBOL>();

  readonly _toolErrorSubject = new Subject<typeof TOOL_ERROR_SYMBOL>();
  readonly _toolStopSubject = new Subject<typeof TOOL_STOP_SYMBOL>();
  readonly _toolCommitSubject = new Subject<void>();

  readonly _outputSubject = new Subject<string>();

  /**
   * Creates an instance of ClientAgent.
   * @param {IAgentParams} params - The parameters for the agent.
   */
  constructor(readonly params: IAgentParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
  async _emitOuput(mode: ExecutionMode, rawResult: string): Promise<void> {
    const result = await this.params.transform(
      rawResult,
      this.params.clientId,
      this.params.agentName
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
      this.params.onAssistantMessage &&
        this.params.onAssistantMessage(
          this.params.clientId,
          this.params.agentName,
          result
        );
      await this._outputSubject.next(result);
      await this.params.bus.emit<IBusEvent>(this.params.clientId, {
        type: "emit-output",
        source: "agent-bus",
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
      source: "agent-bus",
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

  /**
   * Resurrects the model based on the given reason.
   * @param {string} [reason] - The reason for resurrecting the model.
   * @returns {Promise<string>}
   * @private
   */
  async _resurrectModel(
    mode: ExecutionMode,
    reason = "unknown"
  ): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resurrectModel`
      );
    console.warn(
      `agent-swarm model ressurect for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY} reason=${reason}`
    );
    this.params.onResurrect &&
      this.params.onResurrect(
        this.params.clientId,
        this.params.agentName,
        mode,
        reason
      );
    if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "recomplete") {
      await this.params.history.push({
        role: "user",
        mode: "tool",
        agentName: this.params.agentName,
        content: GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT,
      });
    } else if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "flush") {
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
        content: GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT,
      });
    } else if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "custom") {
      await GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION(
        this.params.clientId,
        this.params.agentName
      );
    } else {
      throw new Error(
        `agent-swarm _resurrectModel invalid strategy value=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY} agentName=${this.params.agentName} clientId=${this.params.clientId}`
      );
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
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resurrectModel validation error: ${validation}`
        );
      console.warn(
        `agent-swarm model ressurect did not solved the problem for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY}`
      );
      const content = createPlaceholder();
      await this.params.history.push({
        agentName: this.params.agentName,
        role: "assistant",
        mode: "tool",
        content,
      });
      await this._modelResqueSubject.next(MODEL_RESQUE_SYMBOL);
      return content;
    }
    await this.params.history.push({
      ...message,
      agentName: this.params.agentName,
    });
    await this._modelResqueSubject.next(MODEL_RESQUE_SYMBOL);
    return result;
  }

  /**
   * Waits for the output to be available.
   * @returns {Promise<string>}
   */
  async waitForOutput(): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput`
      );
    return await this._outputSubject.toPromise();
  }

  /**
   * Gets the completion message from the model.
   * @returns {Promise<IModelMessage>}
   */
  async getCompletion(mode: ExecutionMode): Promise<IModelMessage> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
        omit(t, "toolName", "docNote", "call", "validate", "callbacks")
      ),
    };
    const output = await this.params.completion.getCompletion(args);
    this.params.completion.callbacks?.onComplete &&
      this.params.completion.callbacks?.onComplete(args, output);
    return {
      ...output,
      content: output.content || "",
    };
  }

  /**
   * Commits a user message to the history without answer.
   * @param {string} message - The message to commit.
   * @returns {Promise<void>}
   */
  async commitUserMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
      source: "agent-bus",
      input: {
        message,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Commits flush of agent history
   * @returns {Promise<void>}
   */
  async commitFlush(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
      source: "agent-bus",
      input: {},
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Commits change of agent to prevent the next tool execution from being called.
   * @returns {Promise<void>}
   */
  async commitAgentChange(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitAgentChange`
      );
    await this._agentChangeSubject.next(AGENT_CHANGE_SYMBOL);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-agent-change",
      source: "agent-bus",
      input: {},
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Commits change of agent to prevent the next tool execution from being called.
   * @returns {Promise<void>}
   */
  async commitStopTools(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitStopTools`
      );
    await this._toolStopSubject.next(TOOL_STOP_SYMBOL);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-stop-tools",
      source: "agent-bus",
      input: {},
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Commits a system message to the history.
   * @param {string} message - The system message to commit.
   * @returns {Promise<void>}
   */
  async commitSystemMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
      source: "agent-bus",
      input: {
        message,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Commits an assistant message to the history without execute.
   * @param {string} message - The system message to commit.
   * @returns {Promise<void>}
   */
  async commitAssistantMessage(message: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitAssistantMessage`,
        { message }
      );
    this.params.onAssistantMessage &&
      this.params.onAssistantMessage(
        this.params.clientId,
        this.params.agentName,
        message
      );
    await this.params.history.push({
      role: "assistant",
      agentName: this.params.agentName,
      mode: "tool",
      content: message.trim(),
    });
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-assistant-message",
      source: "agent-bus",
      input: {
        message,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Commits the tool output to the history.
   * @param {string} content - The tool output content.
   * @returns {Promise<void>}
   */
  async commitToolOutput(toolId: string, content: string): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
      source: "agent-bus",
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
  }

  /**
   * Executes the incoming message and processes tool calls if any.
   * @param {string} incoming - The incoming message content.
   * @returns {Promise<void>}
   */
  execute = queued(
    async (incoming, mode) => await EXECUTE_FN(incoming, mode, this)
  ) as IAgent["execute"];

  /**
   * Run the completion stateless and return the output
   * @param {string} incoming - The incoming message content.
   * @returns {Promise<void>}
   */
  run = queued(
    async (incoming) => await RUN_FN(incoming, this)
  ) as IAgent["run"];

  /**
   * Should call on agent dispose
   * @returns {Promise<void>}
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} dispose`
      );
    this.params.onDispose &&
      this.params.onDispose(this.params.clientId, this.params.agentName);
  }
}

export default ClientAgent;
