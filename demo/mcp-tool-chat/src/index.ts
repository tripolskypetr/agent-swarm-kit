import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

const transport = new StdioClientTransport({
  command: "bun",
  args: ["./server/src/index.ts"],
});

await client.connect(transport);

const tools = await client.listTools();

console.log(JSON.stringify(tools, null, 2));

const result = await client.callTool({
  name: "get_weather_tool",
  /*arguments: {
    arg1: "value",
  },*/
});

console.log(result)
