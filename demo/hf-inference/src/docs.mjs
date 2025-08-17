import { dumpDocs } from "agent-swarm-kit";
import plantuml from "plantuml";

import "./logic/index";

await dumpDocs("demo/hf-inference", './docs/chat', plantuml);

process.kill(process.pid);
