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
  type MessageContentText,
} from "@langchain/core/messages";
import { randomString } from "functools-kit";
import { ChatOpenAI } from "@langchain/openai";

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
  model: "command_r_gguf",
  streaming: true,
});

addCompletion({
  completionName: CompletionName.LangchainLMStudioCompletion,
  getCompletion: async ({
    agentName,
    messages: rawMessages,
    mode,
    tools: rawTools,
    clientId,
  }: ICompletionArgs): Promise<IModelMessage> => {
    Logger.logClient(
      clientId,
      `Using ${CompletionName.LangchainLMStudioCompletion} completion`,
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

    const { content: humanMessage } = messages.findLast(
      ({ role }) => role === "user"
    )!;

    const tools = rawTools?.map(({ type, function: f }) => ({
      type: type as "function",
      function: {
        name: f.name,
        parameters: f.parameters,
      },
    }));

    const { content, tool_calls } = await chat.invoke(
      [new HumanMessage(humanMessage)],
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
