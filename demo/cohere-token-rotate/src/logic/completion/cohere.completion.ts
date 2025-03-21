import { Adapter, addCompletion, RoundRobin } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { CohereClientV2 } from "cohere-ai";

const getCohere = (token: string) =>
  new CohereClientV2({
    token,
  });

const COHERE_TOKENS = [process.env.COHERE_API_KEY!];

addCompletion({
  completionName: CompletionName.CohereCompletion,
  getCompletion: RoundRobin.create(COHERE_TOKENS, (apiKey) =>
    Adapter.fromCohereClientV2(getCohere(apiKey), "command-r-08-2024")
  ),
});
