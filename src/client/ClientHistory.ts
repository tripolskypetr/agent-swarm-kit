import { IModelMessage } from "../model/ModelMessage.model";
import IHistory, { IHistoryParams } from "../interfaces/History.interface";
import { GLOBAL_CONFIG } from "../config/params";

export class ClientHistory implements IHistory {

  constructor(readonly params: IHistoryParams) {}

  push = async (message: IModelMessage) => {
    this.params.logger.debug(
      `ClientHistory agentName=${this.params.agentName} push`,
      { message }
    );
    await this.params.items.push(message);
  };

  toArrayForRaw = async () => {
    this.params.logger.debug(
      `ClientHistory agentName=${this.params.agentName} toArrayForRaw`
    );
    const result: IModelMessage[] = [];
    for await (const item of this.params.items) {
      result.push(item);
    }
    return result;
  };

  toArrayForAgent = async (prompt: string) => {
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
