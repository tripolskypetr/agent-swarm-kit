import { setBackend } from "@tensorflow/tfjs-core";

import "@tensorflow/tfjs-backend-wasm";
import { dumpClientPerformance } from "agent-swarm-kit";

setBackend("wasm");

dumpClientPerformance.runAfterExecute();
