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

type MCPToolProperties = {
    [key: string]: {
        type: string;
    }
}

export interface IMCPTool<Properties = MCPToolProperties> {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Properties;
    required?: string[];
  };
}
  

await client.connect(transport);

const { tools } = await client.listTools();

const tool: IMCPTool<unknown> = tools[0]!;

console.log(JSON.stringify(tools, null, 2));

const result = await client.callTool({
  name: "get_weather_tool",
  /*arguments: {
    arg1: "value",
  },*/
});

console.log(result)
