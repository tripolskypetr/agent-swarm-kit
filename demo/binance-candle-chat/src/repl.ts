import readline from "readline";

import { randomString } from "functools-kit";
import { Chat, getAgentName } from "agent-swarm-kit";
import { SwarmName } from "./lib/swarm";

const CLIENT_ID = randomString();

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
