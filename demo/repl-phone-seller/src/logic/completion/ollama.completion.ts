import { Adapter, addCompletion } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://127.0.0.1:11434" })

addCompletion({
  completionName: CompletionName.OllamaCompletion,
  getCompletion: Adapter.fromOllama(ollama, "nemotron-mini:4b"), // "tripolskypetr/gemma3-tools:4b"
});
