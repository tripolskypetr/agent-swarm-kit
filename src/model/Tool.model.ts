import { ToolName } from "../interfaces/Agent.interface";

/**
 * Interface representing a tool call request within the swarm system.
 * Encapsulates a specific invocation of a tool as requested by the model, used in agent workflows (e.g., ClientAgent) to bridge model outputs to executable actions.
 * Appears in IModelMessage.tool_calls (e.g., via ICompletion.getCompletion) and is processed by agents to execute tools, emit events (e.g., IBus.emit "commit-tool-output"), and update history (e.g., IHistory.push).
 */
export interface IToolCall {
  /**
   * The unique identifier of the tool call.
   * Assigned to distinguish this invocation from others, often generated randomly (e.g., randomString() in ClientAgent.mapToolCalls) or provided by the model.
   * Used to correlate tool outputs back to their requests (e.g., tool_call_id in IModelMessage).
   * Example: "tool-xyz123" for a specific call in EXECUTE_FN.
   * @type {string}
   */
  id: string;

  /**
   * The type of the tool being called, currently fixed to "function".
   * Indicates that the tool is a callable function, aligning with the swarm’s function-based tool model (e.g., ClientAgent.createToolCall).
   * Future extensions might support other types, but "function" is the only supported value as observed.
   * @type {"function"}
   */
  type: "function";

  /**
   * The function details specifying the tool to be executed.
   * Defines the name and arguments of the function to invoke, derived from model outputs (e.g., ICompletion.getCompletion in ClientAgent).
   * Processed by agents to match against ITool definitions and execute via callbacks (e.g., targetFn.call).
   */
  function: {
    /**
     * The name of the function to be called.
     * Identifies the specific tool function (e.g., "search" or "calculate") requested by the model, matched against ITool.function.name in ClientAgent.
     * Example: "search" for a search tool invoked in EXECUTE_FN.
     * @type {string}
     */
    name: string;

    /**
     * The arguments to be passed to the function, as a key-value object.
     * Contains the parameters provided by the model for the tool call, validated and executed in ClientAgent (e.g., targetFn.validate, targetFn.call).
     * Example: `{ query: "example" }` for a search tool’s input.
     * @type {{ [key: string]: any }}
     */
    arguments: {
      [key: string]: any;
    };
  };
}

/**
 * Interface representing a tool definition within the swarm system.
 * Defines the metadata and schema for a callable tool, used by agents (e.g., ClientAgent) to provide the model with available functions and validate/execute tool calls.
 * Integrated into IAgentParams.tools and passed to ICompletion.getCompletion, enabling the model to generate IToolCall requests based on this specification.
 */
export interface ITool {
  /**
   * The type of the tool, typically "function" in the current system.
   * Specifies the tool’s category, aligning with IToolCall.type, though only "function" is observed in ClientAgent usage (e.g., params.tools).
   * Future extensions might include other types (e.g., "api", "script"), but "function" is standard.
   * @type {string}
   */
  type: string;

  /**
   * The function details defining the tool’s capabilities.
   * Provides the name, description, and parameter schema for the tool, used by the model to understand and invoke it (e.g., in ClientAgent.getCompletion).
   * Matched against IToolCall.function during execution (e.g., EXECUTE_FN’s targetFn lookup).
   */
  function: {
    /**
     * The name of the function, uniquely identifying the tool.
     * Must match IToolCall.function.name for execution (e.g., "search" in ClientAgent.tools), serving as the key for tool lookup and invocation.
     * Example: "calculate" for a math tool.
     * @type {string}
     */
    name: string;

    /**
     * A human-readable description of the function’s purpose.
     * Informs the model or users about the tool’s functionality (e.g., "Performs a search query"), used in tool selection or documentation.
     * Not directly executed but critical for model understanding in ClientAgent workflows.
     * @type {string}
     */
    description: string;

    /**
     * The schema defining the parameters required by the function.
     * Specifies the structure, types, and constraints of arguments (e.g., IToolCall.function.arguments), validated in ClientAgent (e.g., targetFn.validate).
     * Provides the model with a blueprint for generating valid tool calls.
     */
    parameters: {
      /**
       * The type of the parameters object, typically "object".
       * Indicates that parameters are a key-value structure, as expected by IToolCall.function.arguments in ClientAgent.
       * Example: "object" for a standard JSON-like parameter set.
       * @type {string}
       */
      type: string;

      /**
       * An array of parameter names that are mandatory for the function.
       * Lists keys that must be present in IToolCall.function.arguments, enforced during validation (e.g., ClientAgent.targetFn.validate).
       * Example: ["query"] for a search tool requiring a query string.
       * @type {string[]}
       */
      required: string[];

      /**
       * A key-value map defining the properties of the parameters.
       * Details each argument’s type, description, and optional constraints, guiding the model and agent in constructing and validating tool calls (e.g., in ClientAgent.EXECUTE_FN).
       */
      properties: {
        [key: string]: {
          /**
           * The data type of the parameter property (e.g., "string", "number").
           * Specifies the expected type for validation (e.g., ClientAgent.targetFn.validate), ensuring compatibility with IToolCall.function.arguments.
           * Example: "string" for a query parameter.
           * @type {string}
           */
          type: string;

          /**
           * A description of the parameter property’s purpose.
           * Provides context for the model or users (e.g., "The search term to query"), not executed but used for tool comprehension.
           * Example: "The value to search for" for a query parameter.
           * @type {string}
           */
          description: string;

          /**
           * An optional array of allowed values for the parameter, if constrained.
           * Defines an enumeration of valid options, checked during validation (e.g., ClientAgent.targetFn.validate) to restrict input.
           * Example: ["asc", "desc"] for a sort direction parameter.
           * @type {string[] | undefined}
           */
          enum?: string[];
        };
      };
    };
  };
}

/**
 * Interface representing a request to invoke a specific tool within the swarm system.
 * Encapsulates the tool name and its associated parameters, used to trigger tool execution.
 * Typically constructed by agents or models to define the desired tool action and its input arguments.
 */
export interface IToolRequest {
  /**
   * The name of the tool to be invoked.
   * Must match the name of a defined tool in the system (e.g., ITool.function.name).
   * Example: "search" for invoking a search tool.
   * @type {ToolName}
   */
  toolName: ToolName;

  /**
   * A key-value map of parameters to be passed to the tool.
   * Defines the input arguments required for the tool's execution, validated against the tool's parameter schema (e.g., ITool.function.parameters).
   * Example: `{ query: "example" }` for a search tool.
   * @type {Record<string, unknown>}
   */
  params: Record<string, unknown>;
}
