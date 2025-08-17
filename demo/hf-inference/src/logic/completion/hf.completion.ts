import {
  addCompletion,
  type ICompletionArgs,
  type IModelMessage,
} from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_KEY);

addCompletion({
  docDescription: "This completion integrates with HuggingFace's Inference API to provide cost-effective access to OpenAI's gpt-oss-120b model, offering significant cost savings (approximately $15/month vs $100/month for grok-3-mini) while maintaining compatibility with the OpenAI chat completion format, including support for tool calling and streaming responses.",
  completionName: CompletionName.HfCompletion,
  getCompletion: async ({
    agentName,
    messages: rawMessages,
    mode,
    tools: rawTools,
  }: ICompletionArgs): Promise<IModelMessage> => {
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

    const completion = await client.chatCompletion({
      model: "openai/gpt-oss-120b",
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
});
