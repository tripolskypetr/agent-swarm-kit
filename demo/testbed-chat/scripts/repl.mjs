import { SwarmName } from "testbed-chat";

import readline from "readline";

import { randomString } from "functools-kit";
import { getAgentName, session } from "agent-swarm-kit";

const CLIENT_ID = randomString()

const { complete } = session(CLIENT_ID, SwarmName.RootSwarm);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question("lesson-bot => ", async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }

    const data = await complete(input);
    const agentName = await getAgentName(CLIENT_ID);

    console.log(`[${agentName}]: ${data}`);

    askQuestion();
  });
};

askQuestion();

rl.on("close", () => {
  process.exit(0);
});
