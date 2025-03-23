import { setBackend } from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";

setBackend("wasm");
