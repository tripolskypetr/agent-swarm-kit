# 🔄 Cohere Token Rotate

The `cohere-token-rotate` project demonstrates how to use the `agent-swarm-kit` framework with Cohere's AI models while implementing **token rotation**. This ensures that multiple API keys can be used in a round-robin fashion, improving reliability and avoiding rate limits. The project also showcases multi-agent collaboration and tool integration.

---

## 📂 Folder Structure

---

## ✨ Features

- **Token Rotation**: Uses multiple Cohere API keys in a round-robin fashion to distribute requests and avoid rate limits.
- **Agent-Swarm Integration**: Leverages `agent-swarm-kit` to manage agents, swarms, and tools.
- **Multi-Completion Support**: Supports Cohere, LMStudio, and Ollama completions.
- **Custom Tools**: Includes a tool for adding items to a cart.
- **Dynamic Agent Behavior**: Agents respond to user queries based on predefined prompts and tools.

---

## 🚀 Getting Started

### 1. **Install Dependencies**
Navigate to the `cohere-token-rotate` directory and install the required dependencies:
```bash
cd demo/cohere-token-rotate
bun install
```
Create a `.env` file in the `cohere-token-rotate`

**API keys:**
```
COHERE_API_KEY=your-cohere-api-key
```
f you have multiple API keys, you can add them to the `COHERE_TOKENS` array in `cohere.completion.ts`:
```
const COHERE_TOKENS = [process.env.COHERE_API_KEY!, "another-api-key"];
```
**3.Run the Project**

Start the project using the following command:
```
npm run start:index.ts
```

 **🌟 How It Works**

**Token Rotation**

The `cohere.completion.ts` file implements token rotation using the `RoundRobin` utility from `agent-swarm-kit`. This ensures that API requests are distributed across multiple tokens:
```
const COHERE_TOKENS = [process.env.COHERE_API_KEY!];

addCompletion({
  completionName: CompletionName.CohereCompletion,
  getCompletion: RoundRobin.create(COHERE_TOKENS, (apiKey) =>
    Adapter.fromCohereClientV2(getCohere(apiKey), "command-r-08-2024")
  ),
});
```
**Agents**

The `triage.agent.ts` file defines a triage agent that handles user queries and calls tools when necessary:
```
addAgent({
  agentName: AgentName.TriageAgent,
  completion: CompletionName.CohereCompletion,
  prompt: "You are the pharma seller agent. Provide consultation about pharma products.",
  tools: [ToolName.AddToCartTool],
});
```
**Tools**

The `add_to_cart.tool.ts` file defines a tool for adding items to a cart:
```
addTool({
  toolName: ToolName.AddToCartTool,
  call: async (clientId, agentName, { productName }) => {
    console.log(`Added ${productName} to the cart for client ${clientId}`);
  },
});
```
**Swarm**

The `root.swarm.ts` file defines a swarm that includes the triage agent:
```
addSwarm({
  swarmName: SwarmName.RootSwarm,
  agentList: [AgentName.TriageAgent],
  defaultAgent: AgentName.TriageAgent,
});
```
**📖 Example Interaction**

1. Start the project as described in the setup instructions.
2. Type a message in the terminal
```
pharma-bot => What is the price of aspirin?
```
3. The agent responds:
```
[triage_agent]: The price of aspirin is $10.
```
**🔧 Configuration**

**Cohere Model**

The default Cohere model is `command-r-08-2024`. You can change this in `cohere.completion.ts`:
```
Adapter.fromCohereClientV2(getCohere(apiKey), "your-model-name")
```
**Port**

The project runs on the default port for `bun`. You can modify the port in the `Bun.serve` configuration if needed.

**📜 Scripts**

The following scripts are defined in `package.json:`

**Start the Project:**
```
bun ./src/index.ts
```
**🌍 Use Cases**

* **Customer Support:** Automate customer interactions with intelligent agents.
* **E-commerce:** Use tools to manage shopping carts and provide product recommendations.
* **Token Management**: Distribute API requests across multiple tokens to avoid rate limits.

**🤝 Contributing**

Contributions are welcome! If you’d like to improve this project, feel free to submit a pull request.

**📜 License**

This project is licensed under the MIT License.

**📬 Contact**
For questions or support, email tripolskypetr@gmail.com.