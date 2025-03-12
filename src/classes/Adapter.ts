import { ICompletionArgs } from "../interfaces/Completion.interface";
import Logger from "./Logger";
import { randomString, str } from "functools-kit";
import { IModelMessage } from "../model/ModelMessage.model";

/**
 * @see https://github.com/ollama/ollama/blob/86a622cbdc69e9fd501764ff7565e977fc98f00a/server/model.go#L158
 */
export const TOOL_PROTOCOL_PROMPT = str.newline(
  `For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:`,
  `<tool_call>`,
  `{"name": <function-name>, "arguments": <args-json-object>}`,
  `</tool_call>`
);

export class AdapterUtils {
  /**
   * Creates a function to interact with OpenAI's chat completions.
   *
   * @param {any} openai - The OpenAI instance.
   * @param {string} [model="gpt-3.5-turbo"] - The model to use for completions.
   * @returns {Function} - A function that takes completion arguments and returns a response from OpenAI.
   */
  fromOpenAI =
    (
      openai: any,
      model = "gpt-3.5-turbo",
      response_format?: { type: string }
    ) =>
    /**
     * Handles the completion request to OpenAI.
     *
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent.
     * @param {Array} args.messages - The messages to send to OpenAI.
     * @param {string} args.mode - The mode of the completion.
     * @param {Array} args.tools - The tools to use for the completion.
     * @param {string} args.clientId - The client ID.
     * @returns {Promise<Object>} - The response from OpenAI.
     */
    async ({
      agentName,
      messages: rawMessages,
      mode,
      tools,
      clientId,
    }: ICompletionArgs) => {
      Logger.logClient(
        clientId,
        "AdapterUtils fromOpenAI completion",
        JSON.stringify(rawMessages)
      );

      const messages = rawMessages.map(
        ({ role, tool_call_id, tool_calls, content }) => ({
          role,
          tool_call_id,
          content,
          tool_calls: tool_calls?.map(({ function: f, ...rest }) => ({
            ...rest,
            function: {
              name: f.name,
              arguments: JSON.stringify(f.arguments),
            },
          })),
        })
      );

      const {
        choices: [
          {
            message: { content, role, tool_calls },
          },
        ],
      } = await openai.chat.completions.create({
        model,
        messages: messages as any,
        tools: tools as any,
        temperature: 0,
        seed: 0,
        response_format,
      });

      return {
        content: content!,
        mode,
        agentName,
        role,
        tool_calls: tool_calls?.map(({ function: f, ...rest }) => ({
          ...rest,
          function: {
            name: f.name,
            arguments: JSON.parse(f.arguments),
          },
        })),
      };
    };

  /**
   * Creates a function to interact with LMStudio's chat completions.
   *
   * @param {any} openai - The LMStudio instance.
   * @param {string} [model="saiga_yandexgpt_8b_gguf"] - The model to use for completions.
   * @param {Object} [response_format] - The format of the response.
   * @returns {Function} - A function that takes completion arguments and returns a response from LMStudio.
   */
  fromLMStudio =
    (
      openai: any,
      model = "saiga_yandexgpt_8b_gguf",
      response_format?: { type: string }
    ) =>
    /**
     * Handles the completion request to LMStudio.
     *
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent.
     * @param {Array} args.messages - The messages to send to LMStudio.
     * @param {string} args.mode - The mode of the completion.
     * @param {Array} args.tools - The tools to use for the completion.
     * @param {string} args.clientId - The client ID.
     * @returns {Promise<Object>} - The response from LMStudio.
     */
    async ({
      agentName,
      messages: rawMessages,
      mode,
      tools,
      clientId,
    }: ICompletionArgs) => {
      Logger.logClient(
        clientId,
        "AdapterUtils fromLMStudio completion",
        JSON.stringify(rawMessages)
      );

      const messages = rawMessages.map(
        ({ role, tool_call_id, tool_calls, content }) => ({
          role,
          tool_call_id,
          content,
          tool_calls: tool_calls?.map(({ function: f, ...rest }) => ({
            ...rest,
            function: {
              name: f.name,
              arguments: JSON.stringify(f.arguments),
            },
          })),
        })
      );

      const {
        choices: [
          {
            message: { content, role, tool_calls },
          },
        ],
      } = await openai.chat.completions.create({
        model,
        messages: messages as any,
        tools: tools as any,
        temperature: 0,
        seed: 0,
        response_format,
      });

      return {
        content: content!,
        mode,
        agentName,
        role,
        tool_calls: tool_calls?.map(({ function: f, ...rest }) => ({
          ...rest,
          function: {
            name: f.name,
            arguments: JSON.parse(f.arguments),
          },
        })),
      };
    };

  /**
   * Creates a function to interact with Ollama's chat completions.
   *
   * @param {any} ollama - The Ollama instance.
   * @param {string} [model="nemotron-mini:4b"] - The model to use for completions.
   * @param {string} [tool_call_protocol=TOOL_PROTOCOL_PROMPT] - The protocol for tool calls.
   * @returns {Function} - A function that takes completion arguments and returns a response from Ollama.
   */
  fromOllama =
    (
      ollama: any,
      model = "nemotron-mini:4b",
      tool_call_protocol = TOOL_PROTOCOL_PROMPT
    ) =>
    /**
     * Handles the completion request to Ollama.
     *
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent.
     * @param {Array} args.messages - The messages to send to Ollama.
     * @param {string} args.mode - The mode of the completion.
     * @param {Array} args.tools - The tools to use for the completion.
     * @param {string} args.clientId - The client ID.
     * @returns {Promise<Object>} - The response from Ollama.
     */
    async ({
      agentName,
      messages: rawMessages,
      mode,
      tools,
      clientId,
    }: ICompletionArgs) => {
      Logger.logClient(
        clientId,
        "AdapterUtils fromOllama completion",
        JSON.stringify(rawMessages)
      );

      const messages = [...rawMessages];

      if (tool_call_protocol) {
        messages.unshift({
          agentName,
          mode: "tool",
          role: "system",
          content: tool_call_protocol,
        });
      }

      const response = await ollama.chat({
        model: model,
        keep_alive: "24h",
        options: {
          temperature: 0,
          seed: 0,
        },
        messages: messages.map((message) => ({
          content: message.content,
          role: message.role,
          tool_calls: message.tool_calls?.map((call) => ({
            function: call.function,
          })),
        })),
        tools,
      });

      return {
        ...response.message,
        tool_calls: response.message.tool_calls?.map((call) => ({
          function: call.function,
          type: "function",
          id: randomString(),
        })),
        mode,
        agentName,
        role: response.message.role as IModelMessage["role"],
      };
    };
}

/**
 * An instance of AdapterUtils.
 * @type {AdapterUtils}
 */
export const Adapter = new AdapterUtils();

export default Adapter;
