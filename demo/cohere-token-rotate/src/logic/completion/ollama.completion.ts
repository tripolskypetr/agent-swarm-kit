import { Adapter, addCompletion } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { singleshot } from "functools-kit";
import { Ollama } from "ollama";

const getOllama = singleshot(
  () => new Ollama({ host: "http://127.0.0.1:11434" })
);

addCompletion({
  completionName: CompletionName.OllamaCompletion,
  getCompletion: Adapter.fromOllama(getOllama(), "oybekdevuz/command-r", ""),
});
