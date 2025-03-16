import { Adapter, addCompletion } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import OpenAI from "openai";

const lmstudio = new OpenAI({ baseURL: "http://127.0.0.1:12345/v1", apiKey: "noop" })

addCompletion({
  completionName: CompletionName.LmstudioCompletion,
  getCompletion: Adapter.fromOpenAI(lmstudio, "saiga_yandexgpt_8b_gguf"),
});
