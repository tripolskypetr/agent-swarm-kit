import {
  getAgentName,
  session,
} from "agent-swarm-kit";
import type { ServerWebSocket } from "bun";
import { SwarmName } from "./lib/swarm";

type WebSocketData = {
  clientId: string;
  session: ReturnType<typeof session>;
};

Bun.serve({
  fetch(req, server) {
    const clientId = new URL(req.url).searchParams.get("clientId")!;
    console.log(`Connected clientId=${clientId}`);
    server.upgrade<WebSocketData>(req, {
      data: {
        clientId,
        session: session(clientId, SwarmName.TestSwarm),
      },
    });
  },
  websocket: {
    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
      const { data } = JSON.parse(message);
      const answer = await ws.data.session.complete(data);
      ws.send(
        JSON.stringify({
          data: answer,
          agentName: await getAgentName(ws.data.clientId),
        })
      );
    },
  },
  hostname: "0.0.0.0",
  port: 1337,
});
