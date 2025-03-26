import { dumpDocs } from "agent-swarm-kit";
import plantuml from "plantuml";

import "./logic";

await dumpDocs("demo/repl-phone-seller", './docs/chat', plantuml);

process.kill(process.pid);
