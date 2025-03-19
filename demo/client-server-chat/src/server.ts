import {
  Adapter,
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  commitToolOutput,
  emit,
  getAgentName,
  session,
} from "agent-swarm-kit";
import type { ServerWebSocket } from "bun";
import { singleshot, str } from "functools-kit";
import { Ollama } from "ollama";
import OpenAI from "openai";


const getOllama = singleshot(
  () => new Ollama({ host: "http://127.0.0.1:11434" })
);

const getOpenAI = singleshot(
  () => new OpenAI({ baseURL: "http://127.0.0.1:12345/v1", apiKey: "noop" })
);

enum CompletionName {
  NemotronMiniCompletion = "nemotron_mini_completion",
  SaigaYandexGPTCompletion = "saiga_yandex_gpt_completion",
}

enum AgentName {
  TestAgent = "test_agent",
}

enum ToolName {
  AddToCartTool = `add_to_cart_tool`,
}

enum SwarmName {
  TestSwarm = "test_swarm",
}

addCompletion({
  completionName: CompletionName.NemotronMiniCompletion,
  getCompletion: Adapter.fromOllama(getOllama(), "nemotron-mini:4b"),
});

addCompletion({
  completionName: CompletionName.SaigaYandexGPTCompletion,
  getCompletion: Adapter.fromLMStudio(getOpenAI(), "saiga_yandexgpt_8b_gguf"),
});

addAgent({
  agentName: AgentName.TestAgent,
  completion: CompletionName.SaigaYandexGPTCompletion,
  prompt: str.newline(
    "You are the pharma seller agent.",
    "Provide me the consultation about the pharma product"
  ),
  system: [
    `To add the pharma product to the cart call the next tool: ${ToolName.AddToCartTool}`,
  ],
  tools: [ToolName.AddToCartTool],
});

addTool({
  toolName: ToolName.AddToCartTool,
  validate: async ({ params }) => true,
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(ToolName.AddToCartTool, params);
    await commitToolOutput(
      toolId,
      `Pharma product ${params.title} added successfully. `,
      clientId,
      agentName
    );
    await emit(`The product ${params.title} has been added to your cart.`, clientId, agentName);
  },
  type: "function",
  function: {
    name: ToolName.AddToCartTool,
    description: "Add the pharma product to cart",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: `Name of pharma product to be appended to cart`,
        },
      },
      required: [],
    },
  },
});

addSwarm({
  swarmName: SwarmName.TestSwarm,
  agentList: [AgentName.TestAgent],
  defaultAgent: AgentName.TestAgent,
});

type WebSocketData = {
  clientId: string;
  session: ReturnType<typeof session>;
};

Bun.serve({
  fetch(req, server) {
    const clientId = new URL(req.url).searchParams.get("clientId")!;
    console.log(`Connected clientId=${clientId}`);
    server.upgrade<WebSocketData>(req, {
      data: {
        clientId,
        session: session(clientId, SwarmName.TestSwarm),
      },
    });
  },
  websocket: {
    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
      const { data } = JSON.parse(message);
      const answer = await ws.data.session.complete(data);
      ws.send(
        JSON.stringify({
          data: answer,
          agentName: await getAgentName(ws.data.clientId),
        })
      );
    },
  },
  hostname: "0.0.0.0",
  port: 1337,
});
