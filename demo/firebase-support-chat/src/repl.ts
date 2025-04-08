import "./config/firebase";

import { randomString } from "functools-kit";
import { Chat, getAgentName } from "agent-swarm-kit";
import readline from "readline";
import { SwarmName } from "./lib/swarm";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const CLIENT_ID = randomString();

const askQuestion = () => {
  rl.question("pharma-bot => ", async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }
    console.time("Timing");
    const data = await Chat.sendMessage(CLIENT_ID, input, SwarmName.RootSwarm);
    console.timeEnd("Timing");

    console.log(`[${await getAgentName(CLIENT_ID)}]: ${data}`);

    askQuestion();
  });
};

askQuestion();

rl.on("close", () => {
  process.exit(0);
});
