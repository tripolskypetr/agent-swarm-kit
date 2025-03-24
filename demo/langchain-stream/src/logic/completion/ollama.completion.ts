import {
  addCompletion,
  Logger,
  type ICompletionArgs,
  type IModelMessage,
} from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { ChatOllama } from "@langchain/ollama";
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  AIMessage,
  type MessageContentText,
} from "@langchain/core/messages";
import { randomString, str } from "functools-kit";
import { ChatOpenAI } from "@langchain/openai";
import { ChatCohere } from "@langchain/cohere";
import { CohereClientV2 } from "cohere-ai";
import type { ToolDefinition } from "@langchain/core/language_models/base";
import type { ToolCall } from "ollama";

const chat = new ChatOllama({
  baseUrl: "http://127.0.0.1:11434",
  model: "nemotron-mini:4b",
  streaming: true,
});

const TOOL_PROTOCOL_PROMPT = str.newline(
  `For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:`,
  `<tool_call>`,
  `{"name": <function-name>, "arguments": <args-json-object>}`,
  `</tool_call>`
);

addCompletion({
  completionName: CompletionName.OllamaCompletion,
  getCompletion: async ({
    agentName,
    messages: rawMessages,
    mode,
    tools: rawTools,
    clientId,
  }: ICompletionArgs): Promise<IModelMessage> => {
    Logger.logClient(
      clientId,
      `Using ${CompletionName.OllamaCompletion} completion`,
      JSON.stringify(rawMessages)
    );

    const tools = rawTools?.map(
      ({ type, function: f }): ToolDefinition => ({
        type: type as "function",
        function: {
          name: f.name,
          parameters: f.parameters,
        },
      })
    );

    const chatInstance = tools ? chat.bindTools(tools) : chat;

    const { content, tool_calls } = await chatInstance.invoke(
      [
        new SystemMessage(TOOL_PROTOCOL_PROMPT),
        ...rawMessages.map(({ role, tool_calls, tool_call_id, content }) => {
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
            })
          }
          if (role === "user") {
            return new HumanMessage({
              content,
            });
          }
          if (role === "tool") {
            return new ToolMessage({
              tool_call_id: tool_call_id!,
              content,
            })
          }
          return "";
        }),
      ],
      {
        tools,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              console.log({ token });
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

    return {
      content: text,
      mode,
      agentName,
      role: "assistant",
      tool_calls: tool_calls?.map(({ name, id, args }) => ({
        id: id ?? randomString(),
        type: "function",
        function: {
          name,
          arguments: args,
        },
      })),
    };
  },
});
