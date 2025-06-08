import {
  Adapter,
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  commitToolOutput,
  emit,
} from "agent-swarm-kit";
import {
  event,
  type IToolCall,
  type ICompletionArgs,
  type IModelMessage,
} from "agent-swarm-kit";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type MessageContentText,
} from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { randomString, singleshot, str } from "functools-kit";

export enum CompletionName {
  GemmaCompletion = "gemma_3n_completion",
}

export enum AgentName {
  TestAgent = "test_agent",
}

export enum ToolName {
  AddToCartTool = `add_to_cart_tool`,
}

export enum SwarmName {
  TestSwarm = "test_swarm",
}

{
  class CustomChat extends ChatGoogleGenerativeAI {
    async getNumTokens(content: string) {
      if (typeof content !== "string") {
        return 0;
      }
      return Math.ceil(content.length / 4);
    }
  }

  const chat = new CustomChat({
    apiKey: process.env.CC_GEMMA_API_KEY,
    model: "gemma-3n-e4b-it",
    streaming: true,
  });

  function mergeSystemPrompt(messages: IModelMessage[]) {
    // Extract system messages
    const systemMessages = messages.filter(
      (message) => message.role === "system"
    );

    // Store non-system messages
    const nonSystemMessages = messages.filter(
      (message) => message.role !== "system"
    );

    // Right now developer instructions are disabled
    return nonSystemMessages;

    // Clear the original array
    messages.length = 0;

    // If there are system messages, concatenate their content
    if (systemMessages.length > 0) {
      const concatenatedContent = systemMessages
        .map((message) => message.content)
        .join("\n");

      // Create single system message with first system message's properties
      const newSystemMessage = {
        ...systemMessages[0],
        content: concatenatedContent,
      };

      // Add single system message to start of array
      messages.push(newSystemMessage);
    }

    // Add back non-system messages
    messages.push(...nonSystemMessages);

    return messages;
  }

  addCompletion({
    completionName: CompletionName.GemmaCompletion,
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
      const messages = mergeSystemPrompt(rawMessages)
        .map(({ role, tool_calls, tool_call_id, content }) => {
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
        });

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
  });
}

addAgent({
  docDescription:
    "This agent acts as a pharmaceutical seller, providing consultations about pharma products to users, utilizing the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for responses, and calling the add-to-cart tool only when necessary to assist with purchases.",
  agentName: AgentName.TestAgent,
  completion: CompletionName.GemmaCompletion,
  prompt: str.newline(
    "You are the pharma seller agent.",
    "Provide me the consultation about the pharma product"
  ),
  dependsOn: [],
});

addSwarm({
  docDescription:
    "This swarm serves as a testing environment for a single-agent system, incorporating the TestAgent as both the sole member and default agent to handle pharmaceutical sales interactions via a WebSocket-based interface, leveraging the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for its responses, while also defining Nemotron Mini and Gemma3 Tools completions that remain available for potential future use or alternative agent configurations.",
  swarmName: SwarmName.TestSwarm,
  agentList: [AgentName.TestAgent],
  defaultAgent: AgentName.TestAgent,
});
