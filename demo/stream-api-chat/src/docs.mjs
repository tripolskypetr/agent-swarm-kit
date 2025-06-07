import { dumpDocs } from "agent-swarm-kit";
import plantuml from "plantuml";

import "./logic";

await dumpDocs("demo/stream-api-chat", './docs/chat', plantuml);

process.kill(process.pid);
