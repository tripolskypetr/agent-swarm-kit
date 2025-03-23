import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono({});

app.use("*", cors());

app.use("/*", serveStatic({ root: "./public" }));

export { app, upgradeWebSocket, websocket };
