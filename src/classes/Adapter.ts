import { ICompletionArgs } from "src/interfaces/Completion.interface";
import Logger from "./Logger";

export class AdapterUtils {
  /**
   * Creates a function to interact with OpenAI's chat completions.
   * 
   * @param {any} openai - The OpenAI instance.
   * @param {string} [model="gpt-3.5-turbo"] - The model to use for completions.
   * @returns {Function} - A function that takes completion arguments and returns a response from OpenAI.
   */
  fromOpenAI =
    (openai: any, model = "gpt-3.5-turbo", response_format?: { type: string }) =>
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
        "AdapterUtils history",
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
}

/**
 * An instance of AdapterUtils.
 * @type {AdapterUtils}
 */
export const Adapter = new AdapterUtils();

export default Adapter;