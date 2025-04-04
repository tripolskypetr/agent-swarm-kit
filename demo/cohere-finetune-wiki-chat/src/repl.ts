import { SwarmName } from "./lib/swarm";

import readline from "readline";

import { getAgentName, session } from "agent-swarm-kit";
import { randomString, singleshot } from "functools-kit";

const CLIENT_ID = "111"; // randomString();

const getSession = singleshot(() => session(CLIENT_ID, SwarmName.TestSwarm));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("close", async () => {
  await getSession().dispose();
  process.exit(0);
});

const askQuestion = () => {
  const { complete } = getSession();

  rl.question("pharma-bot => ", async (input) => {
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
