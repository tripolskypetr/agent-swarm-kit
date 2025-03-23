import { ROOT_SWARM } from "../logic";

import readline from "readline";

import { getAgentName, session } from "agent-swarm-kit";
import { randomString, singleshot } from "functools-kit";

const CLIENT_ID = randomString();

const getSession = singleshot(() => session(CLIENT_ID, ROOT_SWARM));

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

if (process.argv.includes("--repl")) {
  askQuestion();
}
