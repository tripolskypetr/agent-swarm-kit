import { getAgentName, makeAutoDispose, makeConnection } from "agent-swarm-kit";
import { randomString, singleshot, Subject } from "functools-kit";

import { Context, Telegraf } from "telegraf";
import { ROOT_SWARM } from "../logic";
import getChatData from "../utils/getChatData";

export class ClientChat {
  readonly _sendMessageSubject = new Subject<string>();

  constructor(readonly bot: Telegraf, readonly context: Context) {}

  public beginChat = singleshot((onDispose: (context: Context) => void) => {
    const clientId = randomString();
    const chatData = getChatData(this.context);
    this.bot.telegram.sendMessage(
      chatData.chat_id,
      `Starting bot session ${clientId}`
    );
    const send = makeConnection(
      async (data) => {
        await this.bot.telegram.sendMessage(
          chatData.chat_id,
          `${await getAgentName(clientId)}: ${data}`
        );
      },
      clientId,
      ROOT_SWARM
    );
    const { tick } = makeAutoDispose(clientId, ROOT_SWARM, {
      onDestroy: () => {
        this._sendMessageSubject.unsubscribeAll();
        onDispose(this.context);
      },
    });
    this._sendMessageSubject.subscribe(send);
    this._sendMessageSubject.subscribe(tick);
    return this;
  });

  public sendMessage = async (message: string) => {
    await this._sendMessageSubject.next(message);
  };
}

export default ClientChat;
