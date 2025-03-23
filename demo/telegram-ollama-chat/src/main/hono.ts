import { serve } from "bun";
import { app, upgradeWebSocket, websocket } from "../config/hono";
import { getErrorMessage, Subject } from "functools-kit";
import { complete, disposeConnection, makeConnection } from "agent-swarm-kit";
import { ROOT_SWARM } from "../logic";
import type CompleteRequest from "../model/CompleteRequest.model";

app.post("/api/v1/complete", async (ctx) => {
  const request = await ctx.req.json<CompleteRequest>();
  console.time(`${ctx.req.url} ${request.requestId}`);
  try {
    const result = await complete(
      request.message,
      request.clientId,
      ROOT_SWARM
    );
    return ctx.json(result, 200);
  } catch (error) {
    return ctx.json(
      {
        status: "error",
        error: getErrorMessage(error),
        clientId: request.clientId,
        requestId: request.requestId,
        serviceName: request.serviceName,
      },
      500
    );
  } finally {
    console.timeEnd(`${ctx.req.url} ${request.requestId}`);
  }
});

app.get(
  "/api/v1/session/:clientId",
  upgradeWebSocket((ctx) => {
    const clientId = ctx.req.param("clientId");

    const incomingSubject = new Subject<string>();

    return {
      onOpen(_, ws) {
        const receive = makeConnection(
          async (outgoing) => {
            ws.send(JSON.stringify(outgoing));
          },
          clientId,
          ROOT_SWARM
        );
        incomingSubject.subscribe(receive);
      },
      onMessage(event) {
        const incoming = JSON.parse(event.data.toString());
        incomingSubject.next(incoming.data);
      },
      onClose: () => {
        disposeConnection(clientId, ROOT_SWARM);
      },
    };
  })
);

if (process.argv.includes("--hono")) {
  serve({
    fetch: app.fetch,
    websocket,
    hostname: "0.0.0.0",
    port: 1337,
  });
}
