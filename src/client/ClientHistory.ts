import { IModelMessage } from "../model/ModelMessage.model";
import IHistory, { IHistoryParams } from "../interfaces/History.interface";
import { GLOBAL_CONFIG } from "../config/params";
import { IBusEvent } from "../model/Event.model";

/**
 * Class representing the history of client messages, managing storage and retrieval of messages.
 * @implements {IHistory}
 */
export class ClientHistory implements IHistory {
  /**
   * Filter condition function for `toArrayForAgent`, used to filter messages based on agent-specific criteria.
   */
  _filterCondition: (message: IModelMessage) => boolean;

  /**
   * Creates an instance of ClientHistory.
   * Initializes the filter condition based on global configuration.
   * @param {IHistoryParams} params - The parameters for initializing the history.
   */
  constructor(readonly params: IHistoryParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
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
   * Pushes a message into the history and emits a corresponding event.
   * @param {IModelMessage} message - The message to add to the history.
   * @returns {Promise<void>}
   */
  async push(message: IModelMessage): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientHistory agentName=${this.params.agentName} push`,
        { message }
      );
    await this.params.items.push(
      message,
      this.params.clientId,
      this.params.agentName
    );
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "push",
      source: "history-bus",
      input: {
        message,
      },
      output: {},
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Removes and returns the most recent message from the history.
   * Emits an event with the popped message or null if the history is empty.
   * @returns {Promise<IModelMessage | null>} The most recent message, or null if the history is empty.
   */
  async pop(): Promise<IModelMessage | null> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientHistory agentName=${this.params.agentName} pop`
      );
    const value = await this.params.items.pop(
      this.params.clientId,
      this.params.agentName
    );
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "pop",
      source: "history-bus",
      input: {},
      output: {
        value,
      },
      context: {
        agentName: this.params.agentName,
      },
      clientId: this.params.clientId,
    });
    return value;
  }

  /**
   * Converts the history into an array of raw messages without any filtering or transformation.
   * @returns {Promise<IModelMessage[]>} An array of raw messages in the history.
   */
  async toArrayForRaw(): Promise<IModelMessage[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientHistory agentName=${this.params.agentName} toArrayForRaw`
      );
    const result: IModelMessage[] = [];
    for await (const item of this.params.items.iterate(
      this.params.clientId,
      this.params.agentName
    )) {
      result.push(item);
    }
    return result;
  }

  /**
   * Converts the history into an array of messages tailored for the agent.
   * Filters messages based on the agent's filter condition, limits the number of messages,
   * and prepends prompt and system messages.
   * @param {string} prompt - The initial prompt message to prepend.
   * @param {string[] | undefined} system - Optional array of additional system messages to prepend.
   * @returns {Promise<IModelMessage[]>} An array of messages formatted for the agent.
   */
  async toArrayForAgent(
    prompt: string,
    system?: string[]
  ): Promise<IModelMessage[]> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientHistory agentName=${this.params.agentName} toArrayForAgent`
      );
    const commonMessagesRaw: IModelMessage[] = [];
    const systemMessagesRaw: IModelMessage[] = [];
    for await (const content of this.params.items.iterate(
      this.params.clientId,
      this.params.agentName
    )) {
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
      .map(({ content, tool_calls, ...other }) => ({
        ...other,
        tool_calls,
        content: tool_calls?.length ? "" : content,
      }))
      .filter(this._filterCondition)
      .slice(-GLOBAL_CONFIG.CC_KEEP_MESSAGES);
    const assistantToolOutputCallSet = new Set<string>(
      commonMessages
        .filter(({ tool_call_id }) => !!tool_call_id)
        .map(({ tool_call_id }) => tool_call_id)
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
        .filter(({ tool_calls }) => !!tool_calls)
        .flatMap(({ tool_calls }) => tool_calls?.map(({ id }) => id))
    );
    const assistantMessages = assistantRawMessages.filter(
      ({ tool_call_id }) => {
        if (tool_call_id) {
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
  }

  /**
   * Disposes of the history, performing cleanup and releasing resources.
   * Should be called when the agent is being disposed.
   * @returns {Promise<void>}
   */
  async dispose(): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientHistory agentName=${this.params.agentName} clientId=${this.params.clientId} dispose`
      );
    await this.params.items.dispose(
      this.params.clientId,
      this.params.agentName
    );
  }
}

export default ClientHistory;
