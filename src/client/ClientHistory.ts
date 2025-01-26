import { IModelMessage } from "../model/ModelMessage.model";
import IHistory, { IHistoryParams } from "../interfaces/History.interface";
import { GLOBAL_CONFIG } from "../config/params";

/**
 * Class representing the history of client messages.
 * @implements {IHistory}
 */
export class ClientHistory implements IHistory {
  /**
   * Creates an instance of ClientHistory.
   * @param {IHistoryParams} params - The parameters for the history.
   */
  constructor(readonly params: IHistoryParams) {
    this.params.logger.debug(`ClientHistory agentName=${this.params.agentName} clientId=${this.params.clientId} CTOR`, {
      params,
    });
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
   * @returns {Promise<IModelMessage[]>} - The array of messages for the agent.
   */
  toArrayForAgent = async (prompt: string): Promise<IModelMessage[]> => {
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
      .filter(({ role, agentName, tool_calls }) => {
        let isOk = true;
        if (role === "tool") {
          isOk = isOk && agentName === this.params.agentName;
        }
        if (tool_calls) {
          isOk = isOk && agentName === this.params.agentName;
        }
        return isOk;
      })
      .slice(-GLOBAL_CONFIG.CC_KEEP_MESSAGES);
    const promptMessage: IModelMessage = {
      agentName: this.params.agentName,
      content: prompt,
      role: "system",
    };
    return [promptMessage, ...systemMessages, ...commonMessages];
  };
}

export default ClientHistory;
