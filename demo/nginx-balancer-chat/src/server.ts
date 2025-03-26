import { Chat, getAgentName, Schema, History } from "agent-swarm-kit";
import type { ServerWebSocket } from "bun";
import { parseArgs } from "util";
import { TEST_SWARM } from "./lib/swarm";

declare function parseInt(value: unknown): number;

type WebSocketData = {
  clientId: string;
};

const { values } = parseArgs({
  args: process.argv,
  options: {
    server: {
      type: "boolean",
    },
    port: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});


History.useHistoryCallbacks({
  getSystemPrompt: () => [
    `The server port is ${SERVER_PORT}. Tell him that port ASAP`
  ]
});

const SERVER_PORT = parseInt(values.port);

if (isNaN(SERVER_PORT)) {
  throw new Error(`Server port is not a number: ${values.port}`);
}

if (values.server) {
  Bun.serve({
    fetch(req, server) {
      const clientId = new URL(req.url).searchParams.get("clientId")!;
      if (!clientId) {
        return new Response("Invalid clientId", { status: 500 });
      }
      console.log(`Connected clientId=${clientId} port=${SERVER_PORT}`);
      server.upgrade<WebSocketData>(req, {
        data: {
          clientId,
        },
      });
    },
    websocket: {
      async open(ws: ServerWebSocket<WebSocketData>) {
        await Chat.beginChat(ws.data.clientId, TEST_SWARM);
        await Schema.writeSessionMemory(ws.data.clientId, { port: SERVER_PORT });
      },
      async message(ws: ServerWebSocket<WebSocketData>, message: string) {
        const answer = await Chat.sendMessage(ws.data.clientId, message, TEST_SWARM);
        ws.send(
          JSON.stringify({
            data: answer,
            agentName: await getAgentName(ws.data.clientId),
          })
        );
      },
      async close(ws: ServerWebSocket<WebSocketData>) {
        console.log(`Disconnected clientId=${ws.data.clientId} port=${SERVER_PORT}`);
        await Chat.dispose(ws.data.clientId, TEST_SWARM);
      },
    },
    port: SERVER_PORT,
  });
}

console.log(`Server listening http://localhost:${SERVER_PORT}`)
