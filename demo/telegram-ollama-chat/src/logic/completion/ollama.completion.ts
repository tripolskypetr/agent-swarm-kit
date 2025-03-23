import { Adapter, addCompletion } from "agent-swarm-kit";
import { singleshot } from "functools-kit";
import { Ollama } from "ollama";

const getOllama = singleshot(
  () => new Ollama({ host: "http://127.0.0.1:11434" })
);

export const OLLAMA_COMPLETION = addCompletion({
  completionName: "ollama_completion",
  getCompletion: Adapter.fromOllama(getOllama(), "nemotron-mini:4b"),
});
