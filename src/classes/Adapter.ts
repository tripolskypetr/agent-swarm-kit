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
 * Function type for completing AI model requests.
 * Takes completion arguments and returns a promise resolving to a model message response.
*/
type TCompleteFn = (args: ICompletionArgs) => Promise<IModelMessage>;

/**
 * Utility class providing adapter functions for interacting with various AI completion providers.
*/
export class AdapterUtils {

  /**
   * Creates a function to interact with Hugging Face Inference API chat completions.
  */
  fromHf = (inferenceClient: any, model = "openai/gpt-oss-120b") =>
    /**
     * Handles a completion request to Hugging Face, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency with retry logic for reliability.
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
            "AdapterUtils fromHf completion",
            JSON.stringify(rawMessages)
          );

          const messages = rawMessages.map(
            ({ role, content, tool_calls, tool_call_id }) => {
              if (role === "tool") {
                return {
                  role: "tool" as const,
                  content,
                  tool_call_id: tool_call_id!,
                };
              }
              if (role === "assistant" && tool_calls) {
                return {
                  role: "assistant" as const,
                  content,
                  tool_calls: tool_calls.map((tc) => ({
                    id: tc.id,
                    type: tc.type,
                    function: {
                      name: tc.function.name,
                      arguments:
                        typeof tc.function.arguments === "string"
                          ? tc.function.arguments
                          : JSON.stringify(tc.function.arguments),
                    },
                  })),
                };
              }
              return {
                role: role as "user" | "assistant" | "system",
                content,
              };
            }
          );

          const tools = rawTools?.map(({ function: f }) => ({
            type: "function" as const,
            function: {
              name: f.name,
              description: f.description,
              parameters: f.parameters,
            },
          }));

          const completion = await inferenceClient.chatCompletion({
            model,
            messages,
            ...(tools && { tools }),
          });

          const choice = completion.choices[0];
          const text = choice.message.content || "";
          const tool_calls = choice.message.tool_calls || [];

          const result = {
            content: text,
            mode,
            agentName: agentName!,
            role: "assistant" as const,
            tool_calls: tool_calls.map(({ id, type, function: f }) => ({
              id: id!,
              type: type as "function",
              function: {
                name: f.name,
                arguments:
                  typeof f.arguments === "string"
                    ? JSON.parse(f.arguments)
                    : f.arguments,
              },
            })),
          };

          return result;
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
   * Creates a function to interact with Cortex's chat completions API.
  */
  fromCortex = (
    model = "tripolskypetr:gemma-3-12b-it:gemma-3-12b-it-Q4_K_S.gguf",
    baseUrl = "http://localhost:39281/"
  ) =>
    /**
     * Handles a completion request to Cortex, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency with retry logic for reliability.
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
  */
  fromGrok = (grok: any, model = "grok-3-mini") =>
    /**
     * Handles a completion request to Grok, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency with retry logic for reliability.
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
  */
  fromCohereClientV2 = (cohere: any, model = "command-r-08-2024") =>
    /**
     * Handles a completion request to CohereClientV2, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency.
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
  */
  fromOpenAI = (
    openai: any,
    model = "gpt-3.5-turbo",
    response_format?: { type: string }
  ) =>
    /**
     * Handles a completion request to OpenAI, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency.
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
  */
  fromLMStudio = (
    openai: any,
    model = "saiga_yandexgpt_8b_gguf",
    response_format?: { type: string }
  ) =>
    /**
     * Handles a completion request to LMStudio, transforming messages and tools into the required format.
     * Executes requests in a pool to limit concurrency.
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
  */
  fromOllama = (
    ollama: any,
    model = "nemotron-mini:4b",
    tool_call_protocol = TOOL_PROTOCOL_PROMPT
  ) =>
    /**
     * Handles a completion request to Ollama, optionally prepending a tool call protocol prompt.
     * Executes requests in a pool to limit concurrency.
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
*/
export const Adapter = new AdapterUtils();

export default Adapter;
