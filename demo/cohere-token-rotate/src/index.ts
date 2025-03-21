import "./logic";

import { randomString } from "functools-kit";
import { getAgentName, session } from "agent-swarm-kit";
import readline from "readline";
import { SwarmName } from "./logic/enum/SwarmName";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const CLIENT_ID = randomString();

const { complete } = session(CLIENT_ID, SwarmName.RootSwarm);

const askQuestion = () => {
  rl.question("pharma-bot => ", async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }
    console.time("Timing");
    const data = await complete(input);
    console.timeEnd("Timing");

    console.log(`[${await getAgentName(CLIENT_ID)}]: ${data}`);

    askQuestion();
  });
};

askQuestion();

rl.on("close", () => {
  process.exit(0);
});
