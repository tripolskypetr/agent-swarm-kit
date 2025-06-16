import {
  createAwaiter,
  errorData,
  getErrorMessage,
  not,
  queued,
  randomString,
  sleep,
  Subject,
} from "functools-kit";
import { IModelMessage } from "../model/ModelMessage.model";
import {
  IAgent,
  IAgentParams,
  IAgentTool,
} from "../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../config/params";
import { ExecutionMode } from "../interfaces/Session.interface";
import { IToolCall, IToolRequest } from "../model/Tool.model";
import { IBusEvent } from "../model/Event.model";
import { MCPToolProperties } from "../interfaces/MCP.interface";
import createToolRequest from "../utils/createToolRequest";
import { resolveTools } from "../utils/resolveTools";
import swarm from "../lib";

const CANCEL_OUTPUT_SYMBOL = Symbol("cancel-output");
const AGENT_CHANGE_SYMBOL = Symbol("agent-change");
const MODEL_RESQUE_SYMBOL = Symbol("model-resque");
const TOOL_ERROR_SYMBOL = Symbol("tool-error");
const TOOL_STOP_SYMBOL = Symbol("tool-stop");
const TOOL_NO_OUTPUT_WARNING_TIMEOUT = 15_000;
const TOOL_NO_OUTPUT_WARNING_SYMBOL = Symbol("tool-warning-timeout");

/**
 * A utility class for managing the lifecycle of an `AbortController` instance.
 * Provides a mechanism to signal and handle abort events for asynchronous operations.
 *
 * This class is used to create and manage an `AbortController` instance, allowing
 * consumers to access the `AbortSignal` and trigger abort events when necessary.
 */
class ToolAbortController {
  /**
   * The internal `AbortController` instance used to manage abort signals.
   * If `AbortController` is not available in the global environment, this will be `null`.
   * @private
   */
  private _abortController: AbortController | null = null;

  /**
   * Initializes a new instance of the `ToolAbortController` class.
   * If the `AbortController` API is available in the global environment, an instance is created.
   */
  constructor() {
    if ("AbortController" in globalThis) {
      this._abortController = new AbortController();
    }
  }

  /**
   * Gets the `AbortSignal` associated with the internal `AbortController`.
   * This signal can be used to monitor or respond to abort events.
   *
   * @returns {AbortSignal} The `AbortSignal` instance, or throws an error if `AbortController` is not supported.
   */
  get signal(): AbortSignal {
    if (!this._abortController) {
      return undefined as never;
    }
    return this._abortController.signal;
  }

  /**
   * Triggers the abort event on the internal `AbortController`, signaling any listeners
   * that the associated operation should be aborted.
   *
   * If no `AbortController` instance exists, this method does nothing.
   */
  abort() {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = new AbortController();
    }
  }
}

/**
 * Creates a random placeholder string from the configured empty output placeholders.
 * Used in error recovery scenarios (e.g., _resurrectModel) to provide a fallback output.
 * @returns {string} A randomly selected placeholder string from GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS.
 */
export const createPlaceholder = () =>
  GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS[
    Math.floor(
      Math.random() * GLOBAL_CONFIG.CC_EMPTY_OUTPUT_PLACEHOLDERS.length
    )
  ];

/**
 * Executes a tool call asynchronously, handling success or error scenarios and invoking relevant callbacks.
 * Emits events via subjects (e.g., _toolErrorSubject) to manage execution flow in ClientAgent.
 * Supports AgentConnectionService by executing tools defined in ToolSchemaService and referenced in AgentSchemaService.
 * @param {number} idx - The index of the current tool call in the toolCalls array, used to determine if it’s the last call.
 * @param {IToolCall} tool - The tool call object containing the function name, arguments, and ID, sourced from Tool.model.
 * @param {IToolCall[]} toolCalls - The full array of tool calls for context, passed to the tool’s call method.
 * @param {IAgentTool} targetFn - The target tool function (from ToolSchemaService) to execute, containing call and callbacks.
 * @param {ClientAgent} self - The ClientAgent instance, providing context (e.g., clientId, agentName) and subjects.
 * @returns {Promise<void>} Resolves when the tool call completes or errors, with side effects via callbacks and subjects.
 */
const createToolCall = async (
  idx: number,
  tool: IToolCall,
  toolCalls: IToolCall[],
  targetFn: IAgentTool,
  reason: string,
  self: ClientAgent
) => {
  try {
    await targetFn.call({
      toolId: tool.id,
      clientId: self.params.clientId,
      agentName: self.params.agentName,
      params: tool.function.arguments,
      isLast: idx === toolCalls.length - 1,
      abortSignal: self._toolAbortController.signal,
      callReason: reason,
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
    self.params.callbacks?.onToolError &&
      self.params.callbacks.onToolError(
        self.params.clientId,
        self.params.agentName,
        error
      );
    self._toolErrorSubject.next(TOOL_ERROR_SYMBOL);
  }
};

/**
 * Maps an MCP (Model-Context-Protocol) tool definition to an `IAgentTool` object.
 * This function transforms the MCP tool's schema and properties into a format compatible with the agent's tool system.
 * It also defines the tool's behavior, including its call method and parameter validation.
 *
 * @param {Object} tool - The MCP tool definition containing its name, description, and input schema.
 * @param {string} tool.name - The name of the MCP tool.
 * @param {string} [tool.description=tool.name] - A description of the MCP tool. Defaults to the tool's name if not provided.
 * @param {Object} [tool.inputSchema] - The input schema for the MCP tool, defining its parameters and validation rules.
 * @param {Object} [tool.inputSchema.properties] - The properties of the input schema, where each key represents a parameter.
 * @param {string[]} [tool.inputSchema.required] - An array of required parameter names for the tool.
 * @param {ClientAgent} self - The `ClientAgent` instance, providing context such as the agent's name, client ID, and logger.
 *
 * @returns {IAgentTool} An object representing the mapped tool, including its name, type, function definition, and call behavior.
 */
const mapMcpToolCall = (
  { name, description = name, inputSchema },
  self: ClientAgent
): IAgentTool => {
  const mcpProperties: MCPToolProperties = inputSchema
    ? inputSchema.properties ?? {}
    : {};
  return {
    toolName: `mcp_${name}`,
    type: "function",
    function: {
      name,
      description,
      parameters: {
        type: "object",
        properties: Object.entries(mcpProperties).reduce(
          (acm, [key, { type, description = type, enum: e }]) => ({
            ...acm,
            [key]: {
              type,
              description,
              enum: e,
            },
          }),
          {}
        ),
        required: inputSchema.required,
      },
    },
    call: async (dto) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        self.params.logger.debug(
          `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} calling MCP tool toolName=${name}`
        );
      await self.params.mcp.callTool(name, dto);
    },
    validate: () => true,
  };
};

/**
 * Runs a stateless completion for the incoming message, returning the transformed result.
 * Returns an empty string if tool calls are present or validation fails, avoiding further processing.
 * Integrates with CompletionSchemaService (via params.completion) and HistoryConnectionService (via params.history).
 * @param {string} incoming - The incoming message content to process, typically from a user or tool.
 * @param {ClientAgent} self - The ClientAgent instance, providing params (e.g., completion, history, logger).
 * @returns {Promise<string>} The transformed result from the completion, or an empty string if invalid or tool-related.
 */
const RUN_FN = async (incoming: string, self: ClientAgent): Promise<string> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} run begin`,
      { incoming }
    );
  self.params.onRun &&
    self.params.onRun(self.params.clientId, self.params.agentName, incoming);
  const prompt =
    typeof self.params.prompt === "string"
      ? self.params.prompt
      : await self.params.prompt(self.params.clientId, self.params.agentName);
  const messages = await self.params.history.toArrayForAgent(
    prompt,
    await self._resolveSystemPrompt()
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
    tools: [],
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
  if (message.tool_calls?.length) {
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

/**
 * Executes an incoming message, processes tool calls if present, and emits the output via _emitOutput.
 * Updates history (via HistoryConnectionService) and handles validation, with queued execution to prevent overlap.
 * Coordinates with ToolSchemaService (tool execution) and BusService (event emission).
 * @param {string} incoming - The incoming message content to process, typically from a user or tool.
 * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
 * @param {ClientAgent} self - The ClientAgent instance, providing params and subjects for execution flow.
 * @returns {Promise<void>} Resolves when execution completes, including tool calls and output emission.
 */
const EXECUTE_FN = async (
  incoming: string,
  mode: ExecutionMode,
  self: ClientAgent
): Promise<void> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} maxToolCalls=${self.params.maxToolCalls} execute begin`,
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
  const toolList = await self._resolveTools();
  const rawMessage = await self.getCompletion(mode, toolList);
  const message = await self.params.map(
    rawMessage,
    self.params.clientId,
    self.params.agentName
  );
  if (message.tool_calls?.length) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      self.params.logger.debug(
        `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} tool call begin`
      );
    let toolCalls: IToolCall[] = await self.params.mapToolCalls(
      message.tool_calls.map((call) => ({
        function: call.function,
        id: call.id ?? randomString(),
        type: call.type ?? "function",
      })),
      self.params.clientId,
      self.params.agentName
    );
    toolCalls = toolCalls.slice(-self.params.maxToolCalls);
    await self.params.history.push({
      ...message,
      agentName: self.params.agentName,
    });

    let lastToolStatusRef = Promise.resolve(null);

    const [runAwaiter, { resolve: run }] = createAwaiter<boolean>();

    for (let idx = 0; idx !== toolCalls.length; idx++) {
      const tool = toolCalls[idx];
      const targetFn = toolList.find(
        (t) => t.function.name === tool.function.name
      );
      if (!targetFn) {
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} tool function not found`,
            toolList
          );
        const result = await self._resurrectModel(
          mode,
          `No target function for ${tool.function.name}`
        );
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute end result=${result}`
          );
        await self._emitOutput(mode, result);
        run(false);
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
        await self._emitOutput(mode, result);
        run(false);
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
       * Do not await directly to avoid deadlock! The tool can send messages to other agents by emulating user messages.
       */
      lastToolStatusRef = lastToolStatusRef.then(async (lastStatus) => {
        if (await not(runAwaiter)) {
          return;
        }
        if (lastStatus === MODEL_RESQUE_SYMBOL) {
          return lastStatus;
        }
        if (lastStatus === AGENT_CHANGE_SYMBOL) {
          return lastStatus;
        }
        if (lastStatus === TOOL_STOP_SYMBOL) {
          return lastStatus;
        }
        if (lastStatus === TOOL_ERROR_SYMBOL) {
          return lastStatus;
        }
        GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
          self.params.logger.debug(
            `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} tool call executing`
          );
        const statusAwaiter = Promise.race([
          self._agentChangeSubject.toPromise(),
          self._toolCommitSubject.toPromise(),
          self._toolErrorSubject.toPromise(),
          self._toolStopSubject.toPromise(),
          self._resqueSubject.toPromise(),
          self._cancelOutputSubject.toPromise(),
        ]);
        Promise.race([
          sleep(TOOL_NO_OUTPUT_WARNING_TIMEOUT).then(
            () => TOOL_NO_OUTPUT_WARNING_SYMBOL
          ),
          statusAwaiter,
        ]).then((result) => {
          if (result === TOOL_NO_OUTPUT_WARNING_SYMBOL) {
            console.warn(
              `agent-swarm no tool output after ${TOOL_NO_OUTPUT_WARNING_TIMEOUT}ms clientId=${self.params.clientId} agentName=${self.params.agentName} toolId=${tool.id} functionName=${tool.function.name}`
            );
          }
        });
        createToolCall(
          idx,
          tool,
          toolCalls,
          targetFn,
          message.content || "",
          self
        );
        const status = await statusAwaiter;
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
        }
        if (status === CANCEL_OUTPUT_SYMBOL) {
          GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
            self.params.logger.debug(
              `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} functionName=${tool.function.name} the next tool execution stopped due to the commitCancelOutput call`
            );
          self.params.callbacks?.onAfterToolCalls &&
            self.params.callbacks.onAfterToolCalls(
              self.params.clientId,
              self.params.agentName,
              toolCalls
            );
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
          await self._emitOutput(mode, result);
        }
        return status;
      });
    }
    lastToolStatusRef.finally(() => {
      self.params.callbacks?.onAfterToolCalls &&
        self.params.callbacks.onAfterToolCalls(
          self.params.clientId,
          self.params.agentName,
          toolCalls
        );
    });
    run(true);
    return;
  }
  if (!message.tool_calls?.length) {
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
    await self._emitOutput(mode, result1);
    return;
  }
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientAgent agentName=${self.params.agentName} clientId=${self.params.clientId} execute end result=${result}`
    );
  await self._emitOutput(mode, result);
};

/**
 * Represents a client-side agent in the swarm system, implementing the IAgent interface.
 * Manages message execution, tool calls, history updates, and event emissions, with queued execution to prevent overlap.
 * Integrates with AgentConnectionService (instantiation), HistoryConnectionService (history), ToolSchemaService (tools), CompletionSchemaService (completions), SwarmConnectionService (swarm coordination), and BusService (events).
 * Uses Subjects from functools-kit for asynchronous state management (e.g., tool errors, agent changes).
 * @implements {IAgent}
 */
export class ClientAgent implements IAgent {
  /**
   * An instance of `ToolAbortController` used to manage the lifecycle of abort signals for tool executions.
   * Provides an `AbortSignal` to signal and handle abort events for asynchronous operations.
   *
   * This property is used to control and cancel ongoing tool executions when necessary, such as during agent changes or tool stops.
   * @type {ToolAbortController}
   * @readonly
   */
  readonly _toolAbortController = new ToolAbortController();

  /**
   * Subject for signaling agent changes, halting subsequent tool executions via commitAgentChange.
   * @type {Subject<typeof AGENT_CHANGE_SYMBOL>}
   * @readonly
   */
  readonly _agentChangeSubject = new Subject<typeof AGENT_CHANGE_SYMBOL>();

  /**
   * Subject for signaling model resurrection events, triggered by _resurrectModel during error recovery.
   * @type {Subject<typeof MODEL_RESQUE_SYMBOL>}
   * @readonly
   */
  readonly _resqueSubject = new Subject<typeof MODEL_RESQUE_SYMBOL>();

  /**
   * Subject for signaling tool execution errors, emitted by createToolCall on failure.
   * @type {Subject<typeof TOOL_ERROR_SYMBOL>}
   * @readonly
   */
  readonly _toolErrorSubject = new Subject<typeof TOOL_ERROR_SYMBOL>();

  /**
   * Subject for signaling tool execution stops, triggered by commitStopTools.
   * @type {Subject<typeof TOOL_STOP_SYMBOL>}
   * @readonly
   */
  readonly _toolStopSubject = new Subject<typeof TOOL_STOP_SYMBOL>();

  /**
   * Subject for signaling tool execution stops, triggered by commitCancelOutput.
   * @type {Subject<typeof CANCEL_OUTPUT_SYMBOL>}
   * @readonly
   */
  readonly _cancelOutputSubject = new Subject<typeof CANCEL_OUTPUT_SYMBOL>();

  /**
   * Subject for signaling tool output commitments, triggered by commitToolOutput.
   * @type {Subject<void>}
   * @readonly
   */
  readonly _toolCommitSubject = new Subject<void>();

  /**
   * Subject for emitting transformed outputs, used by _emitOutput and waitForOutput.
   * @type {Subject<string>}
   * @readonly
   */
  readonly _outputSubject = new Subject<string>();

  /**
   * Constructs a ClientAgent instance with the provided parameters.
   * Initializes event subjects and invokes the onInit callback, logging construction details if enabled.
   * @param {IAgentParams} params - The parameters for agent initialization, including clientId, agentName, completion, tools, etc.
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
   * Resolves and combines tools from the agent's parameters and MCP tool list, ensuring no duplicate tool names.
   * @returns A promise resolving to an array of unique IAgentTool objects.
   */
  async _resolveTools(): Promise<IAgentTool[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resolveTools`
      );
    const seen = new Set<string>();
    const agentToolList: IAgentTool[] = [];
    if (this.params.tools) {
      await Promise.all(
        this.params.tools.map(async (tool) => {
          const { function: upperFn, ...other } = tool;
          const fn =
            typeof upperFn === "function"
              ? await upperFn(this.params.clientId, this.params.agentName)
              : upperFn;
          agentToolList.push({
            ...other,
            function: fn,
          });
        })
      );
    }
    const mcpToolList = await this.params.mcp.listTools(this.params.clientId);
    if (mcpToolList.length) {
      return agentToolList
        .concat(mcpToolList.map((tool) => mapMcpToolCall(tool, this)))
        .filter(({ function: { name } }) => {
          if (!seen.has(name)) {
            seen.add(name);
            return true;
          }
          return false;
        })
        .sort(({ toolName: a }, { toolName: b }) => {
          const aStarts = swarm.navigationSchemaService.hasTool(a);
          const bStarts = swarm.navigationSchemaService.hasTool(b);
          return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
        });
    }
    return agentToolList
      .filter(({ function: { name } }) => {
        if (!seen.has(name)) {
          seen.add(name);
          return true;
        }
        return false;
      })
      .sort(({ function: { name: a } }, { function: { name: b } }) => {
        const aStarts = a.startsWith("navigate_to_");
        const bStarts = b.startsWith("navigate_to_");
        return aStarts === bStarts ? 0 : aStarts ? 1 : -1;
      });
  }

  /**
   * Resolves the system prompt by combining static and dynamic system messages.
   * Static messages are directly included from the `systemStatic` parameter, while dynamic messages
   * are fetched asynchronously using the `systemDynamic` function.
   *
   * This method is used to construct the system-level context for the agent, which can include
   * predefined static messages and dynamically generated messages based on the agent's state or configuration.
   *
   * @returns {Promise<string[]>} A promise that resolves to an array of system messages,
   * including both static and dynamically generated messages.
   */
  async _resolveSystemPrompt(): Promise<string[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resolveSystemPrompt`
      );
    const system: string[] = [];
    if (this.params.systemStatic) {
      system.push(...this.params.systemStatic);
    }
    if (this.params.systemDynamic) {
      system.push(
        ...(await this.params.systemDynamic(
          this.params.clientId,
          this.params.agentName
        ))
      );
    }
    if (this.params.completion.flags) {
      system.push(...this.params.completion.flags);
    }
    return system;
  }

  /**
   * Emits the transformed output after validation, invoking callbacks and emitting events via BusService.
   * Attempts model resurrection via _resurrectModel if validation fails, throwing an error if unrecoverable.
   * Supports SwarmConnectionService by broadcasting agent outputs within the swarm.
   * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
   * @param {string} rawResult - The raw result to transform and emit, typically from getCompletion or tool execution.
   * @returns {Promise<void>} Resolves when output is emitted successfully.
   * @throws {Error} If validation fails after model resurrection, indicating an unrecoverable state.
   * @private
   */
  async _emitOutput(mode: ExecutionMode, rawResult: string): Promise<void> {
    const result = await this.params.transform(
      rawResult,
      this.params.clientId,
      this.params.agentName
    );
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _emitOutput`,
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
          `agent-swarm-kit ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} model resurrect failed: ${validation}`
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
   * Resurrects the model in case of failures using configured strategies (flush, recomplete, custom).
   * Updates history with failure details and returns a placeholder or transformed result, signaling via _resqueSubject.
   * Supports error recovery for CompletionSchemaService’s getCompletion calls.
   * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
   * @param {string} [reason="unknown"] - The reason for resurrection, logged for debugging.
   * @returns {Promise<string>} A placeholder (for flush) or transformed result (for recomplete/custom) after recovery.
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
      `agent-swarm model resurrect for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY} reason=${reason}`
    );
    const placeholder = createPlaceholder();
    this.params.onResurrect &&
      this.params.onResurrect(
        this.params.clientId,
        this.params.agentName,
        mode,
        reason
      );
    {
      if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "recomplete") {
        console.warn(
          `agent-swarm model resurrect did not solved the problem (still being called after recomplete patch) for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY}`
        );
      } else if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "custom") {
        console.warn(
          `agent-swarm model resurrect did not solved the problem (still being called after patchedMessage emit) for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY}`
        );
      }
      await this.params.history.push({
        role: "resque",
        mode: "tool",
        agentName: this.params.agentName,
        content: reason || "_resurrectModel call",
      });
      await this.params.history.push({
        role: "user",
        mode: "tool",
        agentName: this.params.agentName,
        content: GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_FLUSH_PROMPT,
      });
    }
    if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "flush") {
      await this._resqueSubject.next(MODEL_RESQUE_SYMBOL);
      return placeholder;
    }
    const rawMessage = await this.getCompletion(mode, []);
    if (rawMessage.tool_calls?.length) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
        this.params.logger.debug(
          `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} _resurrectModel should not emit tool_calls`
        );
      console.warn(
        `agent-swarm _resurrectModel should not emit tool_calls for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY}`
      );
      await this.params.history.push({
        role: "resque",
        mode: "tool",
        agentName: this.params.agentName,
        content: "_resurrectModel should not emit tool calls",
      });
      await this._resqueSubject.next(MODEL_RESQUE_SYMBOL);
      return placeholder;
    }
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
        `agent-swarm model resurrect did not solved the problem for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY} validation=${validation}`
      );
      await this.params.history.push({
        role: "resque",
        mode: "tool",
        agentName: this.params.agentName,
        content: `_resurrectModel failed validation: ${validation}`,
      });
    } else {
      await this.params.history.push({
        ...message,
        agentName: this.params.agentName,
      });
    }
    await this._resqueSubject.next(MODEL_RESQUE_SYMBOL);
    return placeholder;
  }

  /**
   * Waits for the next output to be emitted via _outputSubject, typically after execute or run.
   * Useful for external consumers (e.g., SwarmConnectionService) awaiting agent responses.
   * @returns {Promise<string>} The next transformed output emitted by the agent.
   */
  async waitForOutput(): Promise<string> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} waitForOutput`
      );
    return await this._outputSubject.toPromise();
  }

  /**
   * Retrieves a completion message from the model using the current history and tools.
   * Applies validation and resurrection strategies (via _resurrectModel) if needed, integrating with CompletionSchemaService.
   * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool"), determining context.
   * @returns {Promise<IModelMessage>} The completion message from the model, with content defaulted to an empty string if null.
   */
  async getCompletion(
    mode: ExecutionMode,
    tools: IAgentTool[]
  ): Promise<IModelMessage> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} getCompletion`
      );
    const prompt =
      typeof this.params.prompt === "string"
        ? this.params.prompt
        : await this.params.prompt(this.params.clientId, this.params.agentName);
    const messages = await this.params.history.toArrayForAgent(
      prompt,
      await this._resolveSystemPrompt()
    );
    const args = {
      clientId: this.params.clientId,
      agentName: this.params.agentName,
      messages,
      mode,
      tools: await resolveTools(
        this.params.clientId,
        this.params.agentName,
        tools
      ),
    };
    const output = await this.params.completion.getCompletion(args);
    if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "flush") {
      this.params.completion.callbacks?.onComplete &&
        this.params.completion.callbacks?.onComplete(args, output);
      return {
        ...output,
        content: output.content || "",
      };
    }
    const message = await this.params.map(
      output,
      this.params.clientId,
      this.params.agentName
    );
    const result = await this.params.transform(
      message.content,
      this.params.clientId,
      this.params.agentName
    );
    if (message.tool_calls?.length) {
      this.params.completion.callbacks?.onComplete &&
        this.params.completion.callbacks?.onComplete(args, output);
      return {
        ...output,
        content: output.content || "",
      };
    }
    let validation = await this.params.validate(result);
    if (!validation) {
      this.params.completion.callbacks?.onComplete &&
        this.params.completion.callbacks?.onComplete(args, output);
      return {
        ...output,
        content: output.content || "",
      };
    } else if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "recomplete") {
      console.warn(
        `agent-swarm model using recomplete resurrect for agentName=${this.params.agentName} clientId=${this.params.clientId} validation=${validation}`
      );
      await this.params.history.push({
        role: "user",
        mode: "tool",
        agentName: this.params.agentName,
        content: GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_RECOMPLETE_PROMPT,
      });
      const prompt =
        typeof this.params.prompt === "string"
          ? this.params.prompt
          : await this.params.prompt(
              this.params.clientId,
              this.params.agentName
            );
      const messages = await this.params.history.toArrayForAgent(
        prompt,
        await this._resolveSystemPrompt()
      );
      const args = {
        clientId: this.params.clientId,
        agentName: this.params.agentName,
        messages,
        mode,
        tools: await resolveTools(
          this.params.clientId,
          this.params.agentName,
          tools
        ),
      };
      const output = await this.params.completion.getCompletion(args);
      this.params.completion.callbacks?.onComplete &&
        this.params.completion.callbacks?.onComplete(args, output);
      return {
        ...output,
        content: output.content || "",
      };
    } else if (GLOBAL_CONFIG.CC_RESQUE_STRATEGY === "custom") {
      console.warn(
        `agent-swarm model using custom resurrect for agentName=${this.params.agentName} clientId=${this.params.clientId} validation=${validation}`
      );
      const output = await GLOBAL_CONFIG.CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION(
        this.params.clientId,
        this.params.agentName
      );
      this.params.completion.callbacks?.onComplete &&
        this.params.completion.callbacks?.onComplete(args, output);
      return output;
    } else {
      console.warn(
        `agent-swarm model completion pending resurrect for agentName=${this.params.agentName} clientId=${this.params.clientId} strategy=${GLOBAL_CONFIG.CC_RESQUE_STRATEGY} validation=${validation}`
      );
      this.params.completion.callbacks?.onComplete &&
        this.params.completion.callbacks?.onComplete(args, output);
      return {
        ...output,
        content: output.content || "",
      };
    }
  }

  /**
   * Commits a user message to the history without triggering a response, notifying the system via BusService.
   * Supports SessionConnectionService by logging user interactions within a session.
   * @param {string} message - The user message to commit, trimmed before storage.
   * @returns {Promise<void>} Resolves when the message is committed to history and the event is emitted.
   */
  async commitUserMessage(message: string, mode: ExecutionMode): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitUserMessage`,
        { message, mode }
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
      mode,
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
   * Commits a flush of the agent’s history, clearing it and notifying the system via BusService.
   * Useful for resetting agent state, coordinated with HistoryConnectionService.
   * @returns {Promise<void>} Resolves when the flush is committed and the event is emitted.
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
   * Signals an agent change to halt subsequent tool executions, emitting an event via _agentChangeSubject and BusService.
   * Supports SwarmConnectionService by allowing dynamic agent switching within a swarm.
   * @returns {Promise<void>} Resolves when the change is signaled and the event is emitted.
   */
  async commitAgentChange(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitAgentChange`
      );
    this._toolAbortController.abort();
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
   * Signals a stop to prevent further tool executions, emitting an event via _toolStopSubject and BusService.
   * Used to interrupt tool call chains, coordinated with ToolSchemaService tools.
   * @returns {Promise<void>} Resolves when the stop is signaled and the event is emitted.
   */
  async commitStopTools(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitStopTools`
      );
    this._toolAbortController.abort();
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
   * Signals a stop to prevent further tool executions, emitting an event via _cancelOutputSubject and BusService.
   * @returns {Promise<void>} Resolves when the stop is signaled and the event is emitted.
   */
  async commitCancelOutput(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitCancelOutput`
      );
    this._toolAbortController.abort();
    await this._cancelOutputSubject.next(CANCEL_OUTPUT_SYMBOL);
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-cancel-output",
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
   * Commits a system message to the history, notifying the system via BusService without triggering execution.
   * Supports system-level updates, coordinated with SessionConnectionService.
   * @param {string} message - The system message to commit, trimmed before storage.
   * @returns {Promise<void>} Resolves when the message is committed and the event is emitted.
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
   * Commits a tool request to the agent's history and emits an event via BusService.
   * This method is used to log tool requests and notify the system of the requested tool calls.
   * The tool requests are transformed into tool call objects using the `createToolRequest` utility.
   *
   * @param {IToolRequest[]} request - An array of tool request objects, each containing details about the requested tools.
   * @returns {Promise<void>} Resolves when the tool request is committed to history and the event is emitted.
   */
  async commitToolRequest(request: IToolRequest[]): Promise<string[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} commitToolRequest`,
        { request }
      );
    this.params.onToolRequest &&
      this.params.onToolRequest(
        this.params.clientId,
        this.params.agentName,
        request
      );
    const tool_calls = request.map(createToolRequest);
    await this.params.history.push({
      role: "assistant",
      agentName: this.params.agentName,
      mode: "tool",
      content: "",
      tool_calls,
    });
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "commit-tool-request",
      source: "agent-bus",
      input: {
        request,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
    return tool_calls.map(({ id }) => id);
  }

  /**
   * Commits an assistant message to the history without triggering execution, notifying the system via BusService.
   * Useful for logging assistant responses, coordinated with HistoryConnectionService.
   * @param {string} message - The assistant message to commit, trimmed before storage.
   * @returns {Promise<void>} Resolves when the message is committed and the event is emitted.
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
   * Commits tool output to the history, signaling completion via _toolCommitSubject and notifying the system via BusService.
   * Integrates with ToolSchemaService by linking tool output to tool calls.
   * @param {string} toolId - The ID of the tool that produced the output, linking to the tool call.
   * @param {string} content - The tool output content to commit.
   * @returns {Promise<void>} Resolves when the output is committed and the event is emitted.
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
   * Executes the incoming message and processes tool calls if present, queued to prevent overlapping executions.
   * Implements IAgent.execute, delegating to EXECUTE_FN with queuing via functools-kit’s queued decorator.
   * @param {string} incoming - The incoming message content to process.
   * @param {ExecutionMode} mode - The execution mode (e.g., "user" or "tool").
   * @returns {Promise<void>} Resolves when execution completes, including tool calls and output emission.
   */
  execute = queued(
    async (incoming, mode) => await EXECUTE_FN(incoming, mode, this)
  ) as IAgent["execute"];

  /**
   * Runs a stateless completion for the incoming message, queued to prevent overlapping executions.
   * Implements IAgent.run, delegating to RUN_FN with queuing via functools-kit’s queued decorator.
   * @param {string} incoming - The incoming message content to process.
   * @returns {Promise<string>} The transformed result of the completion, or an empty string if invalid.
   */
  run = queued(
    async (incoming) => await RUN_FN(incoming, this)
  ) as IAgent["run"];

  /**
   * Disposes of the agent, performing cleanup and invoking the onDispose callback.
   * Logs the disposal if debugging is enabled, supporting AgentConnectionService cleanup.
   * @returns {Promise<void>} Resolves when disposal is complete.
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientAgent agentName=${this.params.agentName} clientId=${this.params.clientId} dispose`
      );
    {
      this._agentChangeSubject.unsubscribeAll();
      this._resqueSubject.unsubscribeAll();
      this._toolErrorSubject.unsubscribeAll();
      this._toolStopSubject.unsubscribeAll();
      this._cancelOutputSubject.unsubscribeAll();
      this._toolCommitSubject.unsubscribeAll();
      this._outputSubject.unsubscribeAll();
      this._toolAbortController.abort();
    }
    this.params.onDispose &&
      this.params.onDispose(this.params.clientId, this.params.agentName);
  }
}

/**
 * Default export of the ClientAgent class.
 * Provides the primary implementation of the IAgent interface for client-side agent functionality in the swarm system,
 * integrating with AgentConnectionService, HistoryConnectionService, ToolSchemaService, CompletionSchemaService,
 * SwarmConnectionService, and BusService, with queued execution and event-driven state management.
 * @type {typeof ClientAgent}
 */
export default ClientAgent;
