# 🗨️ Client-Server Chat

The `client-server-chat` project demonstrates a WebSocket-based chat system built using the `agent-swarm-kit` framework. It includes a **server** that handles WebSocket connections and a **client** that interacts with the server in real-time. This project showcases **multi-agent collaboration**, **tool integration**, and **dynamic message handling**.

---

## 📂 Folder Structure


---

## ✨ Features

- **WebSocket Communication**: Real-time communication between the client and server using WebSocket.
- **Agent-Swarm Integration**: Leverages `agent-swarm-kit` to manage agents, swarms, and tools.
- **Dynamic Agent Responses**: Agents respond to user messages based on predefined prompts and tools.
- **Tool Integration**: Demonstrates how tools can be used to extend agent functionality.
- **Customizable Behavior**: Easily modify agents, swarms, and tools to suit your use case.

---

## 🚀 Getting Started

### 1. **Install Dependencies**
Navigate to the `client-server-chat` directory and install the required dependencies:
```bash
cd client-server-chat
bun install
```

Start the WebSocket server:
-----
```bash
npm run start:server
```
The server will start listening on http://localhost:1337.
----
In a separate terminal, start the WebSocket client:
```bash
npm run start:client
```
🌟 How It Works?
----
Server `(src/server.ts)`
The server is implemented in src/server.ts. It:

**1. Initializes a WebSocket Server:**

◦ Uses `Bun.serve` to create a WebSocket server that listens on port `1337`.

◦ Assigns a unique clientId to each client connection.

**2. Manages Agents and Swarms:**

◦ Defines an agent `(TestAgent)` with a specific prompt and tools.

◦ Adds the agent to a swarm `(TestSwarm)` to coordinate its behavior.

**3. Processes Incoming Messages:**

◦When a message is received from a client, the server processes it using the swarm and agent logic.
◦ The response is sent back to the client.

**4. Tool Integration:**

◦ Includes a tool `(AddToCartTool)` that allows the agent to perform specific actions, such as adding items to a cart.

**Key Components:**

**Agent:**
```bash
addAgent({
  agentName: "test_agent",
  completion: CompletionName.SaigaYandexGPTCompletion,
  prompt: "You are a pharma seller agent. Provide consultation about pharma products.",
  tools: [ToolName.AddToCartTool],
});
```
Handles user interactions and generates responses based on the prompt.

Swarm:
---
```bash
addSwarm({
  swarmName: "test_swarm",
  agentList: ["test_agent"],
  defaultAgent: "test_agent",
});
```
Manages multiple agents and coordinates their behavior.

Tool:
---
```
addTool({
  toolName: "AddToCartTool",
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(`Added ${params.title} to the cart for client ${clientId}`);
  },
});

```
Extends agent functionality by allowing it to perform specific actions.

**Client `(src/client.ts)`**

The client is implemented in `client.ts.` It:

**1. Connects to the WebSocket Server:**

⚬Establishes a WebSocket connection to the server at `http://localhost:1337`.
Sends a unique `clientId` to identify itself.

**2. Sends User Messages:**
 * Reads user input from the terminal and sends it to the server via WebSocket.

**3. Receives and Displays Responses:**

 * Listens for responses from the server and displays them in the terminal.

**4.Handles Connection Events:**

 * Logs connection status, errors, and disconnections.

**Key Behavior:**


**WebSocket Connection:**

```bash
const ws = new WebSocket(`http://127.0.0.1:1337/?clientId=${clientId}`);
ws.onmessage = (e) => {
  console.log(`[Server]: ${e.data}`);
};
```
Establishes a WebSocket connection and listens for messages from the server.

 **User Input:**
 ```
 rl.question("pharma-bot => ", async (input) => {
  ws.send(JSON.stringify({ data: input }));
});
```
Reads user input from the terminal and sends it to the server.

**📖 Example Interaction**

1. Start the server and client as described in the setup instructions.
2. Type a message in the client terminal:
```
pharma-bot => What is the price of aspirin?
```
3. The server processes the message and responds
```
[test_agent]: The price of aspirin is $10.
```
*🔧 Configuration*

**Server Configuration**

The server listens on port 1337 by default. You can change the port by modifying the `Bun.serve` configuration in `server.ts`:
```
Bun.serve({
  port: 1337,
  ...
});
```
**Agent and Swarm Configuration**

Agents and swarms are defined in `server.ts`. You can customize their behavior by modifying the `prompt` and `tools`:
```
addAgent({
  agentName: "test_agent",
  prompt: "You are a pharma seller agent. Provide consultation about pharma products.",
  tools: [ToolName.AddToCartTool],
});
```

**📜 Scripts**

The following scripts are defined in `package.json`:

Start the Server:
```
bun ./src/server.ts
```
Start the Client:
```
bun ./src/client.ts
```
**🌍 Use Cases**

 * **Customer Support:** Automate customer interactions with intelligent agents.
 * **E-commerce:** Use tools to manage shopping carts and provide product recommendations.
* **Real-Time Chat:** Build dynamic chat systems with multi-agent collaboration.

**🤝 Contributing**

Contributions are welcome! If you’d like to improve this project, feel free to submit a pull request

**📜 License**

This project is licensed under the MIT License.

**📬 Contact**

For questions or support, 
email tripolskypetr@gmail.com.