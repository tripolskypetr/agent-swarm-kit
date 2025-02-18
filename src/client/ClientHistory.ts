import { IModelMessage } from "../model/ModelMessage.model";
import IHistory, { IHistoryParams } from "../interfaces/History.interface";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Class representing the history of client messages.
 * @implements {IHistory}
 */
export class ClientHistory implements IHistory {
  /**
   * Filter condition for `toArrayForAgent`
   */
  _filterCondition: (message: IModelMessage) => boolean;

  /**
   * Creates an instance of ClientHistory.
   * @param {IHistoryParams} params - The parameters for the history.
   */
  constructor(readonly params: IHistoryParams) {
    this.params.logger.debug(
      `ClientHistory agentName=${this.params.agentName} clientId=${this.params.clientId} CTOR`,
      {
        params,
      }
    );
    this._filterCondition = GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER(
      this.params.agentName
    );
  }

  /**
   * Pushes a message to the history.
   * @param {IModelMessage} message - The message to push.
   * @returns {Promise<void>}
   */
  push = async (message: IModelMessage): Promise<void> => {
    this.params.logger.debug(
      `ClientHistory agentName=${this.params.agentName} push`,
      { message }
    );
    await this.params.items.push(message);
  };

  /**
   * Converts the history to an array of raw messages.
   * @returns {Promise<IModelMessage[]>} - The array of raw messages.
   */
  toArrayForRaw = async (): Promise<IModelMessage[]> => {
    this.params.logger.debug(
      `ClientHistory agentName=${this.params.agentName} toArrayForRaw`
    );
    const result: IModelMessage[] = [];
    for await (const item of this.params.items) {
      result.push(item);
    }
    return result;
  };

  /**
   * Converts the history to an array of messages for the agent.
   * @param {string} prompt - The prompt message.
   * @param {string} system - The tool calling protocol
   * @returns {Promise<IModelMessage[]>} - The array of messages for the agent.
   */
  toArrayForAgent = async (
    prompt: string,
    system?: string[]
  ): Promise<IModelMessage[]> => {
    this.params.logger.debug(
      `ClientHistory agentName=${this.params.agentName} toArrayForAgent`
    );
    const commonMessagesRaw: IModelMessage[] = [];
    const systemMessagesRaw: IModelMessage[] = [];
    for await (const content of this.params.items) {
      const message: IModelMessage = content;
      if (message.role === "resque") {
        commonMessagesRaw.splice(0, commonMessagesRaw.length);
        systemMessagesRaw.splice(0, systemMessagesRaw.length);
        continue;
      }
      if (message.role === "flush") {
        commonMessagesRaw.splice(0, commonMessagesRaw.length);
        systemMessagesRaw.splice(0, systemMessagesRaw.length);
        continue;
      }
      if (message.role === "system") {
        systemMessagesRaw.push(message);
      } else {
        commonMessagesRaw.push(message);
      }
    }
    const systemMessages = systemMessagesRaw.filter(
      ({ agentName }) => agentName === this.params.agentName
    );
    const commonMessages = commonMessagesRaw
      .filter(this._filterCondition)
      .slice(-GLOBAL_CONFIG.CC_KEEP_MESSAGES);
    const assistantToolOutputCallSet = new Set<string>(
      commonMessages.map(({ tool_call_id }) => tool_call_id!)
    );
    const assistantRawMessages = commonMessages
      .map(({ tool_calls, ...message }) => ({
        ...message,
        tool_calls: tool_calls?.filter(({ id }) =>
          assistantToolOutputCallSet.has(id)
        ),
      }))
      .filter(({ content, tool_calls }) => !!content || !!tool_calls?.length);
    const assistantToolCallSet = new Set<string>(
      assistantRawMessages
        .filter(({ role }) => role === "tool")
        .flatMap(({ tool_calls }) => tool_calls?.map(({ id }) => id))
    );
    const assistantMessages = assistantRawMessages.filter(
      ({ role, tool_call_id }) => {
        if (role === "tool") {
          return assistantToolCallSet.has(tool_call_id);
        }
        return true;
      }
    );
    const promptMessages: IModelMessage[] = [];
    {
      promptMessages.push({
        agentName: this.params.agentName,
        mode: "tool",
        content: prompt,
        role: "system",
      });
      GLOBAL_CONFIG.CC_AGENT_SYSTEM_PROMPT?.forEach((content) =>
        promptMessages.push({
          agentName: this.params.agentName,
          mode: "tool",
          content,
          role: "system",
        })
      );
      system?.forEach((content) =>
        promptMessages.push({
          agentName: this.params.agentName,
          mode: "tool",
          content,
          role: "system",
        })
      );
    }
    return [...promptMessages, ...systemMessages, ...assistantMessages];
  };
}

export default ClientHistory;
