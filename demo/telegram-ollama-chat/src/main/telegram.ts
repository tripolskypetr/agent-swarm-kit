import { memoize } from "functools-kit";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import ClientChat from "../client/ClientChat";

const getChatInstance = memoize(
  ([, context]) => context.message!.chat.id,
  (bot: Telegraf, context: Context) => {
    return new ClientChat(bot, context).beginChat(() => {
      getChatInstance.clear(context.message!.chat.id);
    });
  }
);

const main = async () => {
  const bot = new Telegraf(process.env.BOT_TOKEN!);

  bot.on(message("text"), async (ctx) => {
    const chatInstance = getChatInstance(bot, ctx);
    await chatInstance.sendMessage(ctx.message.text);
  });

  await bot.launch();
};

if (process.argv.includes("--telegram")) {
    main();
}
