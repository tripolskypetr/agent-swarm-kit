title: demo/langchain-stream/websocket_chat_swarm
group: demo/langchain-stream
---

# websocket_chat_swarm

> A coordinated system of agents designed for real-time AI-powered chat using LangChain models, including Cohere, LMStudio, and Ollama, with streaming completions, tool integration, and multi-agent collaboration.

![schema](./image/swarm_schema_websocket_chat_swarm.svg)

## Default agent

 - [triage_agent](./agent/triage_agent.md)

	Entry-point agent that identifies the user’s intent and routes them to the appropriate tools or responses for real-time chat assistance.

## Used agents

1. [triage_agent](./agent/triage_agent.md)

	Specialized agent for handling real-time chat interactions. Processes user queries, integrates with tools like AddToCartTool, and responds dynamically using streaming completions from Cohere, LMStudio, or Ollama.

---

## Folder Structure

See the project repository for the detailed folder structure.

## Features

- Streaming Completions: Real-time token-by-token responses from AI models.
- Multi-Completion Support: Supports Cohere, LMStudio, and Ollama completions.
- Tool Integration: Includes tools like AddToCartTool for advanced functionality.
- Agent-Swarm Integration: Leverages agent-swarm-kit to manage agents, swarms, and tools.
- Dynamic Agent Behavior: Agents respond to user queries based on predefined prompts and tools.

## Getting Started

### 1. Install Dependencies
Navigate to the langchain-stream directory and install the required dependencies:
```
cd demo/langchain-stream
bun install
```

### 2. Set Up Environment Variables
Create a .env file in the langchain-stream directory and add your API keys:
```
COHERE_API_KEY=your-cohere-api-key
```

### 3. Run the Project
Start the project using the following command:
```
npm run start:index.ts
```

## How It Works

### Completions
The project supports three completion providers: Cohere, LMStudio, and Ollama. Each provider is implemented in its respective file:

#### Cohere Completion (cohere.completion.ts)
- Uses the Cohere API for text generation.
- Supports tool calls and streaming completions.
- Example:
```
const chat = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY,
  model: "command-r-08-2024",
  streaming: true,
});

addCompletion({
  completionName: CompletionName.CohereCompletion,
  getCompletion: async ({ messages }) => {
    const { content } = await chat.invoke(messages);
    return { content };
  },
});
```

#### LMStudio Completion (lmstudio.completion.ts)
- Uses LMStudio for local AI completions.
- Example:
```
const chat = new LMStudioChat({
  configuration: {
    baseURL: "http://127.0.0.1:12345/v1",
    apiKey: "noop",
  },
  model: "saiga_yandexgpt_8b_gguf",
  streaming: true,
});

addCompletion({
  completionName: CompletionName.LMStudioCompletion,
  getCompletion: async ({ messages }) => {
    const { content } = await chat.invoke(messages);
    return { content };
  },
});
```

#### Ollama Completion (ollama.completion.ts)
- Uses Ollama for AI completions.
- Example:
```
const chat = new ChatOllama({
  baseUrl: "http://127.0.0.1:11434",
  model: "nemotron-mini:4b",
  streaming: true,
});

addCompletion({
  completionName: CompletionName.OllamaCompletion,
  getCompletion: async ({ messages }) => {
    const { content } = await chat.invoke(messages);
    return { content };
  },
});
```

### Agents
The triage.agent.ts file defines a triage agent that handles user queries and calls tools when necessary:
```
addAgent({
  agentName: "triage_agent",
  completion: CompletionName.CohereCompletion,
  prompt: "You are a triage agent. Help users with their queries.",
  tools: [ToolName.AddToCartTool],
});
```

### Tools
The add_to_cart.tool.ts file defines a tool for adding items to a cart:
```
addTool({
  toolName: ToolName.AddToCartTool,
  call: async (clientId, agentName, { productName }) => {
    console.log(`Added ${productName} to the cart for client ${clientId}`);
  },
});
```

### Swarm
The root.swarm.ts file defines a swarm that includes the triage agent:
```
addSwarm({
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
});
```

## Example Interaction

1. Start the project as described in the setup instructions.
2. Type a message in the terminal:
```
pharma-bot => What is the price of aspirin?
```
3. The agent responds:
```
[triage_agent]: The price of aspirin is $10.
```

## Configuration

### Cohere Model
The default Cohere model is command-r-08-2024. You can change this in cohere.completion.ts:
```
Adapter.fromCohereClientV2(getCohere(apiKey), "your-model-name")
```

### Port
The project runs on the default port for bun. You can modify the port in the Bun.serve configuration if needed.

## Scripts

The following scripts are defined in package.json:
- Start the Project:
```
bun ./src/index.ts
```

## Use Cases

- Customer Support: Automate customer interactions with intelligent agents.
- E-commerce: Use tools to manage shopping carts and provide product recommendations.
- Real-Time Chat: Build dynamic chat systems with streaming completions.

## Contributing

Contributions are welcome! If you’d like to improve this project, feel free to submit a pull request.

## License
This project is licensed under the MIT License.

## Contact
For questions or support, email tripolskypetr@gmail.com.

---

This version retains all the original content from your `langchain-stream` README while aligning it with the `trading_swarm` style, including the header format, sections like "Features" and "Getting Started" moved below the agent definitions, and a concise agent list. Let me know if you need further refinements!