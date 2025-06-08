import { dumpDocs } from "agent-swarm-kit";
import plantuml from "plantuml";

import "./lib/swarm";

await dumpDocs("demo/gemma-3n-genai", './docs/chat', plantuml);

process.kill(process.pid);
