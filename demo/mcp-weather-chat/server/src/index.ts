import {
  McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';

const server = new McpServer({
  name: "Demo",
  version: "1.0.0",
});


server.tool(
  "get_weather_tool",
  "Get the current weather using MCP",
  async () => ({
    content: [{ type: "text", text: "It's 25C in Istanbul" }],
  })
);

/*
server.tool(
    "get_weather_tool_test",
    "Get the current weather using MCP",
    { permission: z.enum(["write', vadmin"]).describe("test")},
    async () => ({
      content: [{ type: "text", text: "It's 25C in Istanbul" }],
    })
);

server.tool("fetch-weather", { city: z.string() }, async ({ city }) => {
  const response = await fetch(`https://api.weather.com/${city}`);
  const data = await response.text();
  return {
    content: [{ type: "text", text: data }],
  };
});
*/

const transport = new StdioServerTransport();

server.connect(transport);
