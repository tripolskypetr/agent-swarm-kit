import {
  addCompletion,
  Logger,
  event,
  type ICompletionArgs,
  type IModelMessage,
} from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type MessageContentText,
} from "@langchain/core/messages";
import { randomString } from "functools-kit";
import { ChatOpenAI, OpenAIClient } from "@langchain/openai";

class LMStudioChat extends ChatOpenAI {
  async getNumTokens(content: string) {
    if (typeof content !== "string") {
      return 0;
    }
    return Math.ceil(content.length / 4);
  }
}

const chat = new LMStudioChat({
  configuration: {
    baseURL: "http://127.0.0.1:12345/v1",
    apiKey: "noop",
  },
  model: "saiga_yandexgpt_8b_gguf",
  streaming: true,
});

addCompletion({
  completionName: CompletionName.LMStudioCompletion,
  getCompletion: async ({
    agentName,
    messages: rawMessages,
    mode,
    tools: rawTools,
    clientId,
  }: ICompletionArgs): Promise<IModelMessage> => {
    Logger.logClient(
      clientId,
      `Using ${CompletionName.LMStudioCompletion} completion`,
      JSON.stringify(rawMessages)
    );

    const tools = rawTools?.map(
      ({ type, function: f }): OpenAIClient.ChatCompletionTool => ({
        type: type as "function",
        function: {
          name: f.name,
          parameters: f.parameters,
        },
      })
    );

    const chatInstance = tools ? chat.bindTools(tools) : chat;

    console.log(JSON.stringify(rawMessages, null, 2));

    const { content, tool_calls } = await chatInstance.invoke(
      rawMessages.map(({ role, tool_calls, tool_call_id, content }) => {
        if (role === "assistant") {
          return new AIMessage({
            tool_calls: tool_calls?.map(({ function: f, id }) => ({
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
          return new ToolMessage({
            tool_call_id: tool_call_id!,
            content,
          });
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
