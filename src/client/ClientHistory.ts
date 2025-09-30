import { IModelMessage } from "../model/ModelMessage.model";
import IHistory, { IHistoryParams } from "../interfaces/History.interface";
import { GLOBAL_CONFIG } from "../config/params";
import { IBusEvent } from "../model/Event.model";
import { getPayload } from "../functions/common/getPayload";

/**
 * Class representing the history of client messages in the swarm system, implementing the IHistory interface.
 * Manages storage, retrieval, and filtering of messages for an agent, with event emission via BusService.
 * Integrates with HistoryConnectionService (history instantiation), ClientAgent (message logging and completion context),
 * BusService (event emission), and SessionConnectionService (session history tracking).
 * Uses a filter condition from GLOBAL_CONFIG to tailor message arrays for agent-specific needs, with limits and transformations.
*/
export class ClientHistory implements IHistory {
  /**
   * Filter condition function for toArrayForAgent, used to filter messages based on agent-specific criteria.
   * Initialized from GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER, applied to common messages to exclude irrelevant entries.
  */
  _filterCondition: (message: IModelMessage) => boolean;

  /**
   * Constructs a ClientHistory instance with the provided parameters.
   * Initializes the filter condition using GLOBAL_CONFIG.CC_AGENT_HISTORY_FILTER and logs construction if debugging is enabled.
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
   * Pushes a message into the history and emits a corresponding event via BusService.
   * Adds the message to the underlying storage (params.items) and notifies the system, supporting ClientAgent’s history updates.
   */
  async push<Payload extends object = object>(
    message: IModelMessage<Payload>
  ): Promise<void> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientHistory agentName=${this.params.agentName} push`,
        { message }
      );
    if (message.mode === "user" && message.role === "user") {
      message = { ...message, payload: getPayload<Payload>() };
    }
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
   * Removes and returns the most recent message from the history, emitting an event via BusService.
   * Retrieves the message from params.items and notifies the system, returning null if the history is empty.
   * Useful for ClientAgent to undo recent actions or inspect the latest entry.
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
   * Converts the history into an array of raw messages without filtering or transformation.
   * Iterates over params.items to collect all messages as-is, useful for debugging or raw data access.
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
   * Converts the history into an array of messages tailored for the agent, used by ClientAgent for completions.
   * Filters messages with _filterCondition, limits to GLOBAL_CONFIG.CC_KEEP_MESSAGES, handles resque/flush resets,
   * and prepends prompt and system messages (from params and GLOBAL_CONFIG.CC_AGENT_SYSTEM_PROMPT).
   * Ensures tool call consistency by linking tool outputs to calls, supporting CompletionSchemaService’s context needs.
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
      if (!message.tool_calls?.length && !message.content && !message.payload) {
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
        content: content || "",
      }))
      .filter(({ content, tool_calls }) => !!content || !!tool_calls?.length)
      .filter(this._filterCondition)
      .slice(-this.params.keepMessages);
    const assistantToolOutputCallSet = new Set<string>(
      commonMessages
        .filter(({ tool_call_id }) => !!tool_call_id)
        .map(({ tool_call_id }) => tool_call_id)
    );
    const assistantRawMessages = commonMessages.map(
      ({ tool_calls, ...message }) => ({
        ...message,
        tool_calls: tool_calls?.filter(({ id }) =>
          assistantToolOutputCallSet.has(id)
        ),
      })
    );
    const assistantToolCallSet = new Set<string>(
      assistantRawMessages
        .filter(({ tool_calls }) => !!tool_calls?.length)
        .flatMap(({ tool_calls }) => tool_calls?.map(({ id }) => id))
    );
    const assistantMessages = assistantRawMessages.filter(
      ({ tool_call_id, tool_calls }) => {
        if (tool_call_id) {
          return assistantToolCallSet.has(tool_call_id);
        }
        if (tool_calls) {
          return !!tool_calls.length;
        }
        return true;
      }
    );
    const promptMessages: IModelMessage[] = [];
    {
      prompt &&
        promptMessages.push({
          agentName: this.params.agentName,
          mode: "tool",
          content: prompt,
          role: "system",
        });
      GLOBAL_CONFIG.CC_AGENT_SYSTEM_PROMPT?.forEach((content) => {
        if (!content) {
          return;
        }
        promptMessages.push({
          agentName: this.params.agentName,
          mode: "tool",
          content,
          role: "system",
        });
      });
      system?.forEach((content) => {
        if (!content) {
          return;
        }
        promptMessages.push({
          agentName: this.params.agentName,
          mode: "tool",
          content,
          role: "system",
        });
      });
    }
    return [...promptMessages, ...systemMessages, ...assistantMessages];
  }

  /**
   * Disposes of the history, releasing resources and performing cleanup via params.items.dispose.
   * Called when the agent (e.g., ClientAgent) is disposed, ensuring proper resource management with HistoryConnectionService.
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

/**
 * Default export of the ClientHistory class.
 * Provides the primary implementation of the IHistory interface for managing client message history in the swarm system,
 * integrating with HistoryConnectionService, ClientAgent, BusService, and SessionConnectionService, with filtering and event-driven updates.
*/
export default ClientHistory;
