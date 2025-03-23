import { Context } from "telegraf";
import type { Chat } from "telegraf/types";

export type TChatData = ReturnType<typeof getChatData>;

export const getChatData = (ctx: Context) => {
    const chat = ctx.message!.chat as Chat.PrivateChat;
    return {
        chat_id: String(ctx.message!.chat.id),
        telegram: chat.username,
        first_name: chat.first_name,
        last_name: chat.last_name,
    };
};

export default getChatData;
