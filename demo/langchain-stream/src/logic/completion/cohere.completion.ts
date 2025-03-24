import {
  addCompletion,
  event,
  Logger,
  type ICompletionArgs,
  type IModelMessage,
} from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import {
  ToolMessage,
  AIMessage,
  HumanMessage,
  SystemMessage,
  type MessageContentText,
} from "@langchain/core/messages";
import { isObject } from "functools-kit";
import { ChatCohere } from "@langchain/cohere";
import { Cohere } from "cohere-ai";

const TOOL_COMMIT_PROMPT = "[TOOL EXECUTED OK]";

const chat = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY,
  model: "command-r-08-2024",
  streaming: true,
});

addCompletion({
  completionName: CompletionName.CohereCompletion,
  getCompletion: async ({
    agentName,
    messages: rawMessages,
    mode,
    tools: rawTools,
    clientId,
  }: ICompletionArgs): Promise<IModelMessage> => {
    Logger.logClient(
      clientId,
      `Using ${CompletionName.CohereCompletion} completion`,
      JSON.stringify(rawMessages)
    );

    const tools = rawTools?.map(
      ({ function: f }): Cohere.Tool => ({
        name: f.name,
        description: f.description,
        parameterDefinitions: Object.entries(f.parameters.properties).reduce(
          (acm, [key, { description, type }]) => ({
            ...acm,
            [key]: {
              description,
              type,
              required: f.parameters.required.includes(key),
            },
          }),
          {} as Record<string, Cohere.ToolParameterDefinitionsValue>
        ),
      })
    );

    const chatInstance = tools ? chat.bindTools(tools) : chat;

    const {
      content,
      tool_calls = [],
      invalid_tool_calls = [],
    } = await chatInstance.invoke(
      rawMessages.flatMap(({ role, tool_calls, tool_call_id, content }) => {
        if (role === "assistant") {
          return new AIMessage({
            tool_calls: tool_calls?.map(({ function: f, id, }) => ({
              id: id!,
              name: f.name,
              args: f.arguments,
            })),
            content,
          });
        }
        if (role === "system") {
          return new SystemMessage({
            content,
          });
        }
        if (role === "user") {
          return new HumanMessage({
            content,
          });
        }
        if (role === "tool") {
          return [
            new ToolMessage({
              tool_call_id: tool_call_id!,
              content,
            }),
            new AIMessage({
              content: TOOL_COMMIT_PROMPT,
            })
          ];
        }
        return "";
      }),
      {
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              event(clientId, "llm-new-token", token);
            },
          },
        ],
      }
    );

    const text =
      typeof content === "string"
        ? content
        : content
            .filter((part) => part.type === "text")
            .map((c) => (c as MessageContentText).text)
            .join("");

    const toolCalls = [...tool_calls, ...invalid_tool_calls].filter(
      ({ name, args, id }) => {
        if (!id) {
          return false;
        }
        if (!name) {
          return false;
        }
        return isObject(args);
      }
    );

    const result = {
      content: text,
      mode,
      agentName,
      role: "assistant" as const,
      tool_calls: toolCalls.map(({ id, name, args }) => ({
        id: id!,
        type: "function" as const,
        function: {
          name: name!,
          arguments: args as object,
        },
      })),
    };

    return result;
  },
});
