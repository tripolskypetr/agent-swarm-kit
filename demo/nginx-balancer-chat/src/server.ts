import { Adapter, addAgent, addCompletion, addSwarm, addTool, Chat, commitToolOutput, execute, getAgentName, Schema } from "agent-swarm-kit";
import type { ServerWebSocket } from "bun";
import { OpenAI } from "openai";
import { parseArgs } from "util";

declare function parseInt(value: unknown): number;

type WebSocketData = {
  clientId: string;
};

const { values } = parseArgs({
  args: process.argv,
  options: {
    server: {
      type: "boolean",
    },
    port: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

const COHERE_COMPLETION = addCompletion({
  completionName: "cohere_completion",
  getCompletion: Adapter.fromOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
});

const GET_NUMBER = addTool({
  toolName: "get_number_tool",
  type: "function",
  call: async ({ clientId, agentName, toolId }) => {
    await commitToolOutput(toolId, `The number is ${SERVER_PORT}`, clientId, agentName);
    await execute(`Tell me the number is ${SERVER_PORT}`, clientId, agentName);
  },
  function: {
    name: "get_number_tool",
    description: "Get the number for user request",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The constant value equal to CURRENT",
          enum: ["CURRENT"],
        },
      },
      required: [],
    },
  }
})

const TEST_AGENT = addAgent({
  agentName: "test_agent",
  completion: COHERE_COMPLETION,
  prompt: `You are a test agent for NGinx Upstream. Call the ${GET_NUMBER} and tell user the output`,
  tools: [
    GET_NUMBER
  ],
});

const TEST_SWARM = addSwarm({
  swarmName: "test_swarm",
  agentList: [TEST_AGENT],
  defaultAgent: TEST_AGENT,
})

const SERVER_PORT = parseInt(values.port);

if (isNaN(SERVER_PORT)) {
  throw new Error(`Server port is not a number: ${values.port}`);
}

if (values.server) {
  Bun.serve({
    fetch(req, server) {
      const clientId = new URL(req.url).searchParams.get("clientId")!;
      if (!clientId) {
        return new Response("Invalid clientId", { status: 500 });
      }
      console.log(`Connected clientId=${clientId} port=${SERVER_PORT}`);
      server.upgrade<WebSocketData>(req, {
        data: {
          clientId,
        },
      });
    },
    websocket: {
      async open(ws: ServerWebSocket<WebSocketData>) {
        await Chat.beginChat(ws.data.clientId, TEST_SWARM);
        await Schema.writeSessionMemory(ws.data.clientId, { port: SERVER_PORT });
      },
      async message(ws: ServerWebSocket<WebSocketData>, message: string) {
        const answer = await Chat.sendMessage(ws.data.clientId, message, TEST_SWARM);
        ws.send(
          JSON.stringify({
            data: answer,
            agentName: await getAgentName(ws.data.clientId),
          })
        );
      },
      async close(ws: ServerWebSocket<WebSocketData>) {
        console.log(`Disconnected clientId=${ws.data.clientId} port=${SERVER_PORT}`);
        await Chat.dispose(ws.data.clientId, TEST_SWARM);
      },
    },
    port: SERVER_PORT,
  });
}

console.log(`Server listening http://localhost:${SERVER_PORT}`)
