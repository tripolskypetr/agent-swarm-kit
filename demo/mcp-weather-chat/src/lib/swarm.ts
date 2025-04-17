import { Adapter, addAgent, addCompletion, addMCP, addSwarm, commitToolOutput, execute } from "agent-swarm-kit";
import { OpenAI } from "openai";
import { client } from "../config/mcp";

export const OPENAI_COMPLETION = addCompletion({
  completionName: "openai_completion",
  getCompletion: Adapter.fromOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
});

export const TEST_MCP = addMCP({
  mcpName: "test_mcp",
  docDescription: "An MCP implementation for the mcp-weather-chat project, enabling the AI agent swarm to call external tools written in various programming languages (e.g., C#, Python) via the Model Context Protocol, originally developed for Claude Desktop to ensure tool reusability. Supports integration with tools like DALL·E through extensions such as dalle-mcp.",
  listTools: async () => {
    const { tools } = await client.listTools();
    return tools;
  },
  callTool: async (toolName, { toolId, params, clientId, agentName }) => {
    const { content } = await client.callTool({
      name: toolName,
      arguments: params,
    });
    const [{ text }] = content as any;
    await commitToolOutput(toolId, text, clientId, agentName);
    await execute("", clientId, agentName);
  },
})

export const TEST_AGENT = addAgent({
  docDescription: "A test agent in the mcp-weather-chat project that leverages the OpenAI completion model and MCP to interact with external tools written in various languages (e.g., C#, Python). It processes weather-related queries by utilizing MCP, originally built for Claude Desktop, to ensure reusable tool integration, with potential for extensions like DALL·E via [dalle-mcp](https://github.com/jezweb/openai-mcp).",
  agentName: "test_agent",
  completion: OPENAI_COMPLETION,
  prompt: `You are a test agent for the mcp-weather-chat project. Provide weather-related information based on the chat history or external tool outputs.`,
  dependsOn: [],
  mcp: [TEST_MCP]
});

export const TEST_SWARM = addSwarm({
  docDescription: "The core swarm structure for the mcp-weather-chat project, managing a single TestAgent that uses MCP to call external tools written in languages like C# or Python, leveraging the reusable tool framework from Claude Desktop. It handles weather-related user interactions, with potential for extensions like DALL·E integration via [dalle-mcp](https://github.com/jezweb/openai-mcp).",
  swarmName: "test_swarm",
  agentList: [TEST_AGENT],
  defaultAgent: TEST_AGENT,
});
