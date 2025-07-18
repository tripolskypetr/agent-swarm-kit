import { ICompletionArgs } from "../interfaces/Completion.interface";
import Logger from "./Logger";
import { execpool, fetchApi, randomString, retry, str } from "functools-kit";
import { IModelMessage } from "../model/ModelMessage.model";

/**
 * Prompt template for instructing models on how to format tool calls in responses.
 * Uses XML-like `<tool_call>` tags containing JSON objects with function name and arguments.
 * @see https://github.com/ollama/ollama/blob/86a622cbdc69e9fd501764ff7565e977fc98f00a/server/model.go#L158
 */
export const TOOL_PROTOCOL_PROMPT = str.newline(
  `For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:`,
  `<tool_call>`,
  `{"name": <function-name>, "arguments": <args-json-object>}`,
  `</tool_call>`
);

/**
 * Maximum number of concurrent executions in the execpool for completion requests.
 */
const EXECPOOL_SIZE = 5;

/**
 * Delay in milliseconds between executions in the execpool for completion requests.
 */
const EXECPOOL_WAIT = 0;

/**
 * Maximum retry count before the exception
 */
const RETRY_COUNT = 5;

/**
 * Delay in milliseconds between complete attempts
 */
const RETRY_DELAY = 5_000;

/**
 * Type definition for a function that handles completion requests to an AI provider.
 * @callback TCompleteFn
 * @param {ICompletionArgs} args - The arguments for the completion request.
 * @returns {Promise<IModelMessage>} The response from the completion endpoint in `agent-swarm-kit` format.
 */
type TCompleteFn = (args: ICompletionArgs) => Promise<IModelMessage>;

/**
 * Utility class providing adapter functions for interacting with various AI completion providers.
 */
export class AdapterUtils {
  /**
   * Creates a function to interact with Cortex's chat completions API.
   * @param {string} [model="tripolskypetr:gemma-3-12b-it:gemma-3-12b-it-Q4_K_S.gguf"] - The model to use for completions.
   * @param {string} [baseUrl="http://localhost:39281/"] - The base URL for the Cortex API.
   * @returns {TCompleteFn} A function that processes completion arguments and returns a response from Cortex.
   */
  fromCortex = (
    model = "tripolskypetr:gemma-3-12b-it:gemma-3-12b-it-Q4_K_S.gguf",
    baseUrl = "http://localhost:39281/"
  ) =>
    /**
     * Handles a completion request to Cortex, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency with retry logic for reliability.
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent making the request.
     * @param {IModelMessage[]} args.messages - The array of messages to send to Cortex.
     * @param {string} args.mode - The mode of the completion (e.g., "user" or "tool").
     * @param {any[]} args.tools - The tools available for the completion, if any.
     * @param {string} args.clientId - The ID of the client making the request.
     * @returns {Promise<IModelMessage>} The response from Cortex in `agent-swarm-kit` format.
     */
    execpool(
      retry(
        async ({
          agentName,
          messages: rawMessages,
          tools: rawTools,
          mode,
          clientId,
        }: ICompletionArgs) => {
          Logger.logClient(
            clientId,
            "AdapterUtils fromCortex completion",
            JSON.stringify(rawMessages)
          );

          const url = new URL("v1/chat/completions", baseUrl);

          const messages: any[] = rawMessages
            .filter(({ role }) => role === "user" || role === "assistant")
            .map(({ role, tool_call_id, tool_calls, content }) => ({
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
            }));

          const systemPrompt = rawMessages
            .filter(({ role }) => role === "system")
            .reduce((acm, { content }) => str.newline(acm, content), "");

          if (systemPrompt) {
            messages.unshift({
              role: "system",
              content: systemPrompt,
            });
          }

          // Merge consecutive assistant messages
          for (let i = messages.length - 1; i > 0; i--) {
            if (
              messages[i].role === "assistant" &&
              messages[i - 1].role === "assistant"
            ) {
              messages[i - 1].content = str.newline(
                messages[i - 1].content,
                messages[i].content
              );
              // Merge tool_calls if they exist
              if (messages[i].tool_calls || messages[i - 1].tool_calls) {
                messages[i - 1].tool_calls = [
                  ...(messages[i - 1].tool_calls || []),
                  ...(messages[i].tool_calls || []),
                ];
              }
              messages.splice(i, 1);
            }
          }

          for (let i = messages.length - 1; i > 0; i--) {
            if (
              messages[i].role === "user" &&
              messages[i - 1].role === "user"
            ) {
              messages[i - 1].content = str.newline(
                messages[i - 1].content,
                messages[i].content
              );
              messages.splice(i, 1);
            }
          }

          const tools = rawTools?.map(({ type, function: f }) => ({
            type: type as "function",
            function: {
              name: f.name,
              description: f.description ?? "", // Will throw 500 if not provide
              parameters: f.parameters,
            },
          }));

          const {
            choices: [
              {
                message: { content, role, tool_calls },
              },
            ],
          } = await fetchApi<any>(url, {
            method: "POST",
            body: JSON.stringify({
              model,
              messages,
              tools,
              response_format: {
                type: "text",
              },
              parallel_tool_calls: true,
            }),
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
        },
        RETRY_COUNT,
        RETRY_DELAY
      ),
      {
        maxExec: EXECPOOL_SIZE,
        delay: EXECPOOL_WAIT,
      }
    ) as TCompleteFn;

  /**
   * Creates a function to interact with Grok's chat completions API.
   * @param {any} grok - The Grok client instance.
   * @param {string} [model="grok-3-mini"] - The model to use for completions (defaults to "grok-3-mini").
   * @returns {TCompleteFn} A function that processes completion arguments and returns a response from Grok.
   */
  fromGrok = (grok: any, model = "grok-3-mini") =>
    /**
     * Handles a completion request to Grok, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency with retry logic for reliability.
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent making the request.
     * @param {IModelMessage[]} args.messages - The array of messages to send to Grok.
     * @param {string} args.mode - The mode of the completion (e.g., "user" or "tool").
     * @param {any[]} args.tools - The tools available for the completion, if any.
     * @returns {Promise<IModelMessage>} The response from Grok in `agent-swarm-kit` format.
     */
    execpool(
      retry(
        async ({
          agentName,
          messages: rawMessages,
          mode,
          tools,
          clientId,
        }: ICompletionArgs): Promise<IModelMessage> => {
          Logger.logClient(
            clientId,
            "AdapterUtils fromGrok completion",
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
          } = await grok.chat.completions.create({
            model,
            messages: messages as any,
            tools: tools as any,
            response_format: {
              type: "text",
            },
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
        },
        RETRY_COUNT,
        RETRY_DELAY
      ),
      {
        maxExec: EXECPOOL_SIZE,
        delay: EXECPOOL_WAIT,
      }
    ) as TCompleteFn;

  /**
   * Creates a function to interact with CohereClientV2 chat completions API.
   * @param {any} openai - The CohereClientV2 client instance.
   * @param {string} [model="gpt-3.5-turbo"] - The model to use for completions (defaults to "gpt-3.5-turbo").
   * @param {{ type: string }} [response_format] - Optional response format configuration (e.g., `{ type: "json_object" }`).
   * @returns {TCompleteFn} A function that processes completion arguments and returns a response from CohereClientV2.
   */
  fromCohereClientV2 = (cohere: any, model = "command-r-08-2024") =>
    /**
     * Handles a completion request to CohereClientV2, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency.
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent making the request.
     * @param {IModelMessage[]} args.messages - The array of messages to send to CohereClientV2.
     * @param {string} args.mode - The mode of the completion (e.g., "user" or "tool").
     * @param {any[]} args.tools - The tools available for the completion, if any.
     * @param {string} args.clientId - The ID of the client making the request.
     * @returns {Promise<IModelMessage>} The response from CohereClientV2 in `agent-swarm-kit` format.
     */
    execpool(
      retry(
        async ({
          agentName,
          messages: rawMessages,
          mode,
          tools: rawTools,
          clientId,
        }: ICompletionArgs): Promise<IModelMessage> => {
          Logger.logClient(
            clientId,
            "AdapterUtils fromCohereClientV2 completion",
            JSON.stringify(rawMessages)
          );

          const messages = rawMessages.map(
            ({ role, tool_call_id, tool_calls, content }) => ({
              role: role as any,
              toolCallId: tool_call_id,
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

          const tools = rawTools?.map(({ type, function: f }) => ({
            type: type as "function",
            function: {
              name: f.name,
              description: f.description,
              parameters: f.parameters,
            },
          }));

          const {
            message: { content, role, toolCalls },
          } = await cohere.chat({
            model,
            messages,
            tools,
            seed: 0,
            temperature: 0,
          });

          return {
            content: content ? content[0].text : "",
            mode,
            agentName,
            role,
            tool_calls: toolCalls?.map(({ function: f, ...rest }) => ({
              ...rest,
              id: rest.id!,
              type: rest.type!,
              function: {
                name: f?.name!,
                arguments: JSON.parse(f?.arguments!),
              },
            })),
          };
        },
        RETRY_COUNT,
        RETRY_DELAY
      ),
      {
        maxExec: EXECPOOL_SIZE,
        delay: EXECPOOL_WAIT,
      }
    ) as TCompleteFn;

  /**
   * Creates a function to interact with OpenAI's chat completions API.
   * @param {any} openai - The OpenAI client instance.
   * @param {string} [model="gpt-3.5-turbo"] - The model to use for completions (defaults to "gpt-3.5-turbo").
   * @param {{ type: string }} [response_format] - Optional response format configuration (e.g., `{ type: "json_object" }`).
   * @returns {TCompleteFn} A function that processes completion arguments and returns a response from OpenAI.
   */
  fromOpenAI = (
    openai: any,
    model = "gpt-3.5-turbo",
    response_format?: { type: string }
  ) =>
    /**
     * Handles a completion request to OpenAI, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency.
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent making the request.
     * @param {IModelMessage[]} args.messages - The array of messages to send to OpenAI.
     * @param {string} args.mode - The mode of the completion (e.g., "user" or "tool").
     * @param {any[]} args.tools - The tools available for the completion, if any.
     * @param {string} args.clientId - The ID of the client making the request.
     * @returns {Promise<IModelMessage>} The response from OpenAI in `agent-swarm-kit` format.
     */
    execpool(
      retry(
        async ({
          agentName,
          messages: rawMessages,
          mode,
          tools,
          clientId,
        }: ICompletionArgs): Promise<IModelMessage> => {
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
        },
        RETRY_COUNT,
        RETRY_DELAY
      ),
      {
        maxExec: EXECPOOL_SIZE,
        delay: EXECPOOL_WAIT,
      }
    ) as TCompleteFn;

  /**
   * Creates a function to interact with LMStudio's chat completions API.
   * @param {any} openai - The LMStudio client instance (compatible with OpenAI-style API).
   * @param {string} [model="saiga_yandexgpt_8b_gguf"] - The model to use for completions (defaults to "saiga_yandexgpt_8b_gguf").
   * @param {{ type: string }} [response_format] - Optional response format configuration (e.g., `{ type: "json_object" }`).
   * @returns {TCompleteFn} A function that processes completion arguments and returns a response from LMStudio.
   */
  fromLMStudio = (
    openai: any,
    model = "saiga_yandexgpt_8b_gguf",
    response_format?: { type: string }
  ) =>
    /**
     * Handles a completion request to LMStudio, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency.
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent making the request.
     * @param {IModelMessage[]} args.messages - The array of messages to send to LMStudio.
     * @param {string} args.mode - The mode of the completion (e.g., "user" or "tool").
     * @param {any[]} args.tools - The tools available for the completion, if any.
     * @param {string} args.clientId - The ID of the client making the request.
     * @returns {Promise<IModelMessage>} The response from LMStudio in `agent-swarm-kit` format.
     */
    execpool(
      retry(
        async ({
          agentName,
          messages: rawMessages,
          mode,
          tools,
          clientId,
        }: ICompletionArgs): Promise<IModelMessage> => {
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
        },
        RETRY_COUNT,
        RETRY_DELAY
      ),
      {
        maxExec: EXECPOOL_SIZE,
        delay: EXECPOOL_WAIT,
      }
    ) as TCompleteFn;

  /**
   * Creates a function to interact with Ollama's chat completions API.
   * @param {any} ollama - The Ollama client instance.
   * @param {string} [model="nemotron-mini:4b"] - The model to use for completions (defaults to "nemotron-mini:4b").
   * @param {string} [tool_call_protocol=TOOL_PROTOCOL_PROMPT] - The protocol prompt for tool calls (defaults to TOOL_PROTOCOL_PROMPT).
   * @returns {TCompleteFn} A function that processes completion arguments and returns a response from Ollama.
   */
  fromOllama = (
    ollama: any,
    model = "nemotron-mini:4b",
    tool_call_protocol = TOOL_PROTOCOL_PROMPT
  ) =>
    /**
     * Handles a completion request to Ollama, optionally prepending a tool call protocol prompt.
     * Executes requests in a pool to limit concurrency.
     * @param {ICompletionArgs} args - The arguments for the completion request.
     * @param {string} args.agentName - The name of the agent making the request.
     * @param {IModelMessage[]} args.messages - The array of messages to send to Ollama.
     * @param {string} args.mode - The mode of the completion (e.g., "user" or "tool").
     * @param {any[]} args.tools - The tools available for the completion, if any.
     * @param {string} args.clientId - The ID of the client making the request.
     * @returns {Promise<IModelMessage>} The response from Ollama in `agent-swarm-kit` format.
     */
    execpool(
      retry(
        async ({
          agentName,
          messages: rawMessages,
          mode,
          tools,
          clientId,
        }: ICompletionArgs): Promise<IModelMessage> => {
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
        },
        RETRY_COUNT,
        RETRY_DELAY
      ),
      {
        maxExec: EXECPOOL_SIZE,
        delay: EXECPOOL_WAIT,
      }
    ) as TCompleteFn;
}

/**
 * Singleton instance of AdapterUtils for interacting with AI completion providers.
 * @type {AdapterUtils}
 */
export const Adapter = new AdapterUtils();

export default Adapter;
