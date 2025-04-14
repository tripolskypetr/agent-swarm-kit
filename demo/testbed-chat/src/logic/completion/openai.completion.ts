import { Adapter, addCompletion } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import OpenAI from "openai";
import { openai } from "../../config/openai";

addCompletion({
  completionName: CompletionName.OpenaiCompletion,
  getCompletion: Adapter.fromOpenAI(openai, "gpt-3.5-turbo"),
});
