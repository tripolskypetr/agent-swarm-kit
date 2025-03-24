import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { Chat } from "agent-swarm-kit";
import { ROOT_SWARM } from "../logic";

const main = async () => {
  const bot = new Telegraf(process.env.BOT_TOKEN!);

  bot.on(message("text"), async (ctx) => {
    const answer = await Chat.sendMessage(String(ctx.chat.id), ctx.message.text, ROOT_SWARM);
    console.log(`Received chat=${ctx.chat.id} message=${ctx.message.text} answer=${answer}`);
    await ctx.sendMessage(answer);
  });

  await bot.launch();
};

if (process.argv.includes("--telegram")) {
  main();
}
