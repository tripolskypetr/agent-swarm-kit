import readline from "readline";

import { randomString, Subject } from "functools-kit";

const clientId = randomString();

const incomingSubject = new Subject();
const outgoingSubject = new Subject();

const ws = new WebSocket(`http://127.0.0.1:80/?clientId=${clientId}`);

ws.onmessage = (e) => {
  incomingSubject.next(JSON.parse(e.data));
};

ws.onopen = () => {
  console.log(`Connected clientId=${clientId}`);
  outgoingSubject.subscribe((data) => {
    ws.send(JSON.stringify({ data }));
  });
};

ws.onclose = () => {
  console.log("Connection closed");
  process.exit(-1);
};

ws.onerror = () => {
  console.log("Connection error");
  process.exit(-1);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question("pharma-bot => ", async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }

    console.time("Timing");
    await outgoingSubject.next(input);
    const { agentName, data } = await incomingSubject.toPromise();
    console.timeEnd("Timing");

    console.log(`[${agentName}]: ${data}`);

    askQuestion();
  });
};

await outgoingSubject.waitForListener();

askQuestion();

rl.on("close", () => {
  process.exit(0);
});
