import { Adapter, addCompletion } from "agent-swarm-kit";
import { singleshot } from "functools-kit";
import OpenAI from "openai";
import { CompletionName } from "../enum/CompletionName";

const getOpenAI = singleshot(
  () => new OpenAI({ baseURL: "http://127.0.0.1:12345/v1", apiKey: "noop" })
);

addCompletion({
  completionName: CompletionName.LMStudioCompletion,
  getCompletion: Adapter.fromLMStudio(getOpenAI(), "command_r_gguf"),
});
