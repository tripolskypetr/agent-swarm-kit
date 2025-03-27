import "./config/tf";
import readline from "readline";

import { Chat, getAgentName } from "agent-swarm-kit";
import { SwarmName } from "./lib/swarm";

const CLIENT_ID = "binance-candle-chat";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = async () => {
  rl.question(`[${await getAgentName(CLIENT_ID)}] => `, async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }

    console.time("Timing");
    const output = await Chat.sendMessage(CLIENT_ID, input, SwarmName.TradingSwarm);
    console.timeEnd("Timing");

    console.log(`[${await getAgentName(CLIENT_ID)}]: ${output}`);

    askQuestion();
  });
};

await Chat.beginChat(CLIENT_ID, SwarmName.TradingSwarm);
askQuestion();

rl.on("close", () => {
  process.exit(0);
});
