import { serve } from "@hono/node-server";
import { app, injectWebSocket } from "../config/app";
import { CC_WWWROOT_PORT } from "../config/params";

import "../routes/stream";
// import "../routes/sync";

const main = () => {
  const server = serve({
    fetch: app.fetch,
    port: CC_WWWROOT_PORT,
  });

  server.addListener("listening", () => {
    console.log(`Server listening on http://localhost:${CC_WWWROOT_PORT}`);
  });

  injectWebSocket(server);
};

main();
