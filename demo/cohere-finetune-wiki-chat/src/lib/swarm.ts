import {
  Adapter,
  addAgent,
  addWiki,
  addCompletion,
  addSwarm,
  addTool,
  commitToolOutput,
  question,
  getLastUserMessage,
  execute,
} from "agent-swarm-kit";
import { singleshot, str } from "functools-kit";
import OpenAI from "openai";
import { CohereClient } from "cohere-ai";

const getOpenAI = singleshot(
  () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
);

const getCohere = singleshot(
  () =>
    new CohereClient({
      token: process.env.COHERE_API_KEY,
    })
);

export enum CompletionName {
  OpenaiCompletion = "openai_completion",
}

export enum WikiName {
  PharmaWiki = "pharma_wiki",
}

export enum AgentName {
  TestAgent = "test_agent",
}

export enum ToolName {
  FindPharmaProduct = `find_pharma_product`,
}

export enum SwarmName {
  TestSwarm = "test_swarm",
}

addCompletion({
  completionName: CompletionName.OpenaiCompletion,
  getCompletion: Adapter.fromOpenAI(getOpenAI()),
});

addWiki({
  wikiName: WikiName.PharmaWiki,
  docDescription:
    "A comprehensive wiki containing pharmaceutical product information, company policies, and detailed knowledge base for agents.",
  getChat: async ({ message }) => {
    const client = getCohere();
    const { text } = await client.chat({
      message,
    });
    return text;
  },
});

addAgent({
  docDescription:
    "An intelligent agent designed to assist users with pharmaceutical product inquiries, providing consultations and tool support.",
  agentName: AgentName.TestAgent,
  completion: CompletionName.OpenaiCompletion,
  prompt: str.newline(
    "You are the pharma seller agent.",
    "Provide me the consultation about the pharma product",
    "Call the tools only when necessary, if not required, just speak with users"
  ),
  system: [
    `To find a product information call the next tool: ${ToolName.FindPharmaProduct}`,
  ],
  tools: [ToolName.FindPharmaProduct],
  wikiList: [WikiName.PharmaWiki],
  dependsOn: [],
});

addTool({
  docNote:
    "This tool queries the PharmaWiki for detailed product information based on user questions and returns relevant data to the agent.",
  toolName: ToolName.FindPharmaProduct,
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(ToolName.FindPharmaProduct, params);
    const answer = await question(
      await getLastUserMessage(clientId),
      clientId,
      agentName,
      WikiName.PharmaWiki
    );
    await commitToolOutput(
      toolId,
      `Recieved the next information from wiki: ${answer}`,
      clientId,
      agentName
    );
    await execute(
      `Tell me the answer based on the last tool output`,
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: ToolName.FindPharmaProduct,
    description: "Find pharma product details based on corporative wiki",
    parameters: {
      type: "object",
      properties: {
        context: {
          type: "string",
          description: `Question context in addition to the last user message`,
        },
      },
      required: [],
    },
  },
});

addSwarm({
  docDescription:
    "A collaborative swarm containing multiple pharmaceutical consultation agents working together to assist users effectively.",
  swarmName: SwarmName.TestSwarm,
  agentList: [AgentName.TestAgent],
  defaultAgent: AgentName.TestAgent,
});
