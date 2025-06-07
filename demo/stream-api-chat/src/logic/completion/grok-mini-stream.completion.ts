import {
  addCompletion,
  event,
  type IToolCall,
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
import { ChatXAI } from "@langchain/xai";
import { CC_GROK_API_KEY } from "../../config/params";

class CustomChat extends ChatXAI {
  async getNumTokens(content: string) {
    if (typeof content !== "string") {
      return 0;
    }
    return Math.ceil(content.length / 4);
  }
}

const chat = new CustomChat({
  apiKey: CC_GROK_API_KEY,
  model: "grok-3-mini",
  streaming: true,
});

addCompletion({
  completionName: CompletionName.GrokMiniStreamCompletion,
  getCompletion: async (params: ICompletionArgs): Promise<IModelMessage> => {
    const {
      agentName,
      messages: rawMessages,
      mode,
      tools: rawTools,
      clientId,
    } = params;

    // Validate and format tools
    const tools = rawTools?.map(({ type, function: f }) => ({
      type: "function",
      function: {
        name: f.name,
        description: f.description || "",
        parameters: f.parameters || { type: "object", properties: {} },
      },
    }));

    // Bind tools to chat instance if tools are provided
    const chatInstance = tools?.length ? chat.bindTools(tools) : chat;

    // Map raw messages to LangChain messages
    const messages = rawMessages.map(
      ({ role, tool_calls, tool_call_id, content }) => {
        if (role === "assistant") {
          return new AIMessage({
            content,
            tool_calls: tool_calls?.map(({ function: f, id }) => ({
              id: id || randomString(),
              name: f.name,
              args: f.arguments,
            })),
          });
        }
        if (role === "system") {
          return new SystemMessage({ content });
        }
        if (role === "user") {
          return new HumanMessage({ content });
        }
        if (role === "tool") {
          return new ToolMessage({
            tool_call_id: tool_call_id || randomString(),
            content,
          });
        }
        throw new Error(`Unsupported message role: ${role}`);
      }
    );

    try {
      let textContent = "";
      let toolCalls: any[] = [];

      // Handle streaming response
      const stream = await chatInstance.stream(messages);

      // Aggregate tool calls and content from stream, emit chunks
      for await (const chunk of stream) {
        if (chunk.content) {
          textContent += chunk.content;
          event(clientId, "llm-new-token", chunk.content); // Emit content chunk
        }
        if (chunk.tool_calls?.length) {
          toolCalls = [...toolCalls, ...chunk.tool_calls];
        }
      }

      // Process content if it's an array of parts
      const finalContent = Array.isArray(textContent)
        ? textContent
            .filter((part: any) => part.type === "text")
            .map((c: MessageContentText) => c.text)
            .join("")
        : textContent;

      // Format tool calls for return
      const formattedToolCalls = toolCalls.map(({ name, id, args }) => ({
        id: id || randomString(),
        type: "function",
        function: {
          name,
          arguments: args,
        },
      }));

      return {
        content: finalContent,
        mode,
        agentName,
        role: "assistant",
        tool_calls: formattedToolCalls as IToolCall[],
      };
    } catch (error: any) {
      console.error("Error in getCompletion:", error);
      throw new Error(`Failed to process completion: ${error.message}`);
    }
  },
  flags: [
    "Всегда пиши ответ на русском языке"
  ]
});
