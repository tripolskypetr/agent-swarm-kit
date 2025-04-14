import { dumpDocs } from "agent-swarm-kit";
import plantuml from "plantuml";

import "testbed-chat";

await dumpDocs("demo/testbed-chat", './docs/chat', plantuml);

process.kill(process.pid);
