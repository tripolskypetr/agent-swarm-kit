---
title: app/getting-started
group: app
---

# Getting Started

> `agent-swarm-kit` facilitates the creation of agent-based systems capable of handling tasks like voice-based chats, cryptocurrency trading, and pharmaceutical consultations. It offers a modular architecture where agents collaborate within swarms, utilizing tools, completions, and storage to process user requests. Below, we explore each component, add a section on connecting to swarms, provide examples of key operational functions, and emphasize practical resources for developers.

Whether you’re building a voice chatbot, a crypto trader, or a pharma consultant, `agent-swarm-kit` has you covered. It’s a modular framework where agents team up in swarms, tapping into tools, completions, and storage to get the job done. Let’s break down each piece, show you how to connect to swarms, and spotlight some handy examples and resources to kickstart your project.

# Ask AI

> DeepWiki is available online just in your web browser: https://deepwiki.com/tripolskypetr/agent-swarm-kit/

This documentation contains a lot of text, which makes it difficult to read manually. Just ask any specific question to `DeepWiki AI Chat` or `Cursor` and AI will answer you. If it won't, [open the Issue on GitHub](https://github.com/tripolskypetr/agent-swarm-kit/issues) and I will answer you in person

## Core Components

### 1. Storages
Storages are the memory banks for your agents, holding onto things like orders, user preferences, or past data. With the `addStorage` function, you can set them up and even add embeddings to make searches lightning-fast. Here’s how it works in action:

- **Example**: The `OrderStorage` in the trading swarm stores cryptocurrency orders (e.g., buy/sell details for BTC, ETH):
  ```javascript
  addStorage({
    docDescription: "Persistent storage system designed to record and organize cryptocurrency trading orders...",
    storageName: StorageName.OrderStorage,
    createIndex: ({ type, coin, quantity, price }) => str.space(type, coin, quantity, price),
    embedding: EmbeddingName.NomicEmbedding,
  });
  ```
- **Usage**: The `BtcTraderAgent` uses this storage to upsert buy orders and calculate profit/loss:
  ```javascript
  await Storage.upsert({ item: { id, coin, price, quantity, type: "buy" }, ... });
  ```
- **Purpose**: Storages enable long-term memory and data-driven decision-making across agent interactions.

---

### 2. Completors (Completions)
Completors—set up with `addCompletion` — are the brains behind your agents’ responses, pulling in language models or APIs from the likes of OpenAI, Ollama, or LM Studio. They take user input and spit out answers. Check out a few ways devs are using them:

- **Examples**:
  - **OpenAI Completion**: Used in the `nginx-balancer-chat` and trading swarm:
    ```javascript
    addCompletion({
      completionName: "openai_completion",
      getCompletion: Adapter.fromOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY })),
    });
    ```
  - **Ollama with Nemotron-Mini**: Used in the `whisper-voice-chat` project:
    ```javascript
    addCompletion({
      completionName: "navigate-completion",
      getCompletion: Adapter.fromOllama(ollama, "nemotron-mini:4b"),
    });
    ```
  - **Saiga Yandex GPT**: Used in the pharmaceutical swarm:
    ```javascript
    addCompletion({
      completionName: CompletionName.SaigaYandexGPTCompletion,
      getCompletion: Adapter.fromLMStudio(getOpenAI(), "saiga_yandexgpt_8b_gguf"),
    });
    ```
  - **Cohere2 Completion:** Integrates Cohere’s API for text generation (assuming Cohere2 refers to a hypothetical or updated Cohere model):
    ```typescript
    const getCohere = (token: string) =>
        new CohereClientV2({
            token,
        });

        const COHERE_TOKENS = [process.env.COHERE_API_KEY!];

        addCompletion({
        completionName: CompletionName.CohereCompletion,
        getCompletion: RoundRobin.create(COHERE_TOKENS, (apiKey) =>
            Adapter.fromCohereClientV2(getCohere(apiKey), "command-r-08-2024")
        ),
    });
    ```

- **Purpose**: Completors provide the reasoning and conversational capabilities of agents, tailored to specific use cases.

---

### 3. Embedders
Embedders, added via `addEmbedding`, turn text into vectors—think of them as fingerprints for your data. They’re great for stuff like similarity searches or speeding up indexing. Here’s why they matter: they make your storages way more efficient.

- **Example**: The `NomicEmbedding` in the trading swarm uses Ollama’s `nomic-embed-text` model:
  ```javascript
  addEmbedding({
    embeddingName: EmbeddingName.NomicEmbedding,
    createEmbedding: async (text) => {
      const { embedding } = await ollama.embeddings({ model: "nomic-embed-text", prompt: text });
      return embedding;
    },
    calculateSimilarity: async (a, b) => {
      return tidy(() => {
        const tensorA = tensor1d(a);
        const tensorB = tensor1d(b);
        const dotProduct = sum(mul(tensorA, tensorB));
        const normA = norm(tensorA);
        const normB = norm(tensorB);
        const cosineData = div(dotProduct, mul(normA, normB)).dataSync();
        const cosineSimilarity = cosineData[0];
        return cosineSimilarity;
      });
    },
  });
  ```
- **Usage**: Paired with `OrderStorage` to index trading orders for quick lookup.
- **Purpose**: Embedders enable advanced data processing, such as clustering or matching, within storages.

---

### 4. Agents
Agents are the stars of the show, brought to life with `addAgent`. They’re the ones chatting with users, each with a unique role, a guiding prompt, a completion to lean on, and maybe some tools or storages in their toolkit.

- **Examples**:
  - **TestAgent (Whisper-Voice-Chat)**: Handles voice-based chats:
    ```javascript
    addAgent({
      agentName: "test-agent",
      completion: MOCK_COMPLETION,
      prompt: "You are the agent of a swarm system. Chat with customer",
    });
    ```
  - **TriageAgent (Root Swarm)**: Routes queries to specialized agents:
    ```javascript
    addAgent({
      agentName: "triage_agent",
      completion: OPENAI_COMPLETION,
      system: ["Triage Agent Guidelines: ..."],
      tools: [NAVIGATE_TO_TECH_TRENDS, NAVIGATE_TO_CYBERSECURITY, ...],
    });
    ```
  - **BtcTraderAgent (Trading Swarm)**: Manages Bitcoin trading:
    ```javascript
    addAgent({
      agentName: AgentName.BtcTraderAgent,
      completion: CompletionName.OpenAiCompletion,
      prompt: "You are the Bitcoin AI trader specializing in long-term investments.",
      tools: [ToolName.CalculateBuyPriceQuantityTool, ...],
      storages: [StorageName.OrderStorage],
    });
    ```
- **Purpose**: Agents encapsulate domain-specific logic and interact with users or other agents via tools and completions.

---

### 5. Swarms
Swarms, defined with `addSwarm`, are collections of agents that work together, with a default agent serving as the entry point. They orchestrate multi-agent workflows.

- **Examples**:
  - **TestSwarm (Whisper-Voice-Chat)**: Single-agent voice chat system:
    ```javascript
    addSwarm({
      swarmName: "test-swarm",
      agentList: [TEST_AGENT],
      defaultAgent: TEST_AGENT,
    });
    ```
  - **RootSwarm (Multi-Agent System)**: Manages specialized agents:
    ```javascript
    addSwarm({
      swarmName: "root_swarm",
      agentList: [TECH_TRENDS_AGENT, CYBERSECURITY_AGENT, ..., TRIAGE_AGENT],
      defaultAgent: TRIAGE_AGENT,
    });
    ```
  - **TradingSwarm**: Coordinates cryptocurrency trading:
    ```javascript
    addSwarm({
      swarmName: SwarmName.TradingSwarm,
      agentList: [AgentName.BtcTraderAgent, ..., AgentName.TriageAgent],
      defaultAgent: AgentName.TriageAgent,
    });
    ```
- **Purpose**: Swarms provide structure and routing for complex, multi-agent applications.

---

### 6. Tools
Tools, added with `addTool`, extend agent capabilities by enabling actions like navigation, calculations, or external integrations. They are invoked explicitly by agents when needed and often utilize key functions like `commitToolOutput`, `changeToAgent`, `emit`, `execute`, `commitFlush`, and `getLastUserMessage`.

- **Examples with Key Functions**:
  - **NavigateToTechTrends**: Routes to the tech trends agent and changes the active agent:
    ```javascript
    addTool({
      toolName: "navigate_to_tech_trends_tool",
      call: async ({ toolId, clientId, params }) => {
        await commitToolOutput(toolId, "Switching to Tech Trends Agent", clientId); // Commit tool output
        await changeToAgent(TECH_TRENDS_AGENT, clientId); // Change active agent
        await execute("Continue conversation with user", clientId); // Continue LLM execution
      },
      function: { name: "navigate_to_tech_trends_tool", ... },
    });
    ```
  - **CalculateBuyPriceQuantityTool**: Computes buy order details, emits a message, and continues execution:
    ```javascript
    addTool({
      toolName: ToolName.CalculateBuyPriceQuantityTool,
      call: async ({ agentName, toolId, clientId, params }) => {
        const { price, quantity } = await calculateBuyUSDT(Number(params.total), coin);
        await commitToolOutput(toolId, `Long-term buy ${coin} for ${params.total} USD: price=${price}, quantity=${quantity}`, clientId, agentName); // Commit tool output
        await emit(`To buy ${coin} for ${params.total} USDT, place a MARKET_BUY order with price=${price}, quantity=${quantity}`, clientId, agentName); // Emit message to user
        await execute("Confirm the buy order details with the user", clientId, agentName); // Continue execution
      },
    });
    ```
  - **CalculateAverageCoinPriceTool**: Handles coin mismatch by retrieving the last message and clearing history:
    ```javascript
    addTool({
      toolName: ToolName.CalculateAverageCoinPriceTool,
      call: async ({ toolId, agentName, clientId, params }) => {
        if (coin !== params.coin) {
          const lastMessage = await getLastUserMessage(clientId); // Get last user message
          await commitFlush(clientId, agentName); // Clear conversation history
          await changeToAgent(AgentName.TriageAgent, clientId); // Switch to Triage Agent
          await executeForce(lastMessage, clientId); // Re-execute with last message
          return;
        }
        const averageCost = calculateAverageCost(orderList);
        await commitToolOutput(toolId, `Average cost for ${coin}: ${averageCost} USD`, clientId, agentName);
      },
    });
    ```
  - **AddToCartTool**: Adds pharmaceutical products and notifies the user:
    ```javascript
    addTool({
      toolName: ToolName.AddToCartTool,
      call: async ({ toolId, clientId, params }) => {
        await commitToolOutput(toolId, `Pharma product ${params.title} added successfully`, clientId); // Commit tool output
        await emit(`The product ${params.title} has been added to your cart`, clientId); // Emit message to user
      },
    });
    ```

- **Key Functions Explained**:
  - **`commitToolOutput(toolId, output, clientId, agentName)`**: Records the result of a tool’s execution in the conversation history, making it available to the agent or swarm. It’s often used to log actions or results (e.g., "Switching to Tech Trends Agent").
  - **`changeToAgent(agentName, clientId)`**: Switches the active agent for a client, enabling seamless transitions within a swarm (e.g., from `TriageAgent` to `TechTrendsAgent`).
  - **`emit(message, clientId, agentName)`**: Sends a direct message to the user, typically for notifications or updates outside the main conversation flow (e.g., "Product added to cart").
  - **`execute(prompt, clientId, agentName)`**: Continues the LLM’s execution after a tool call, allowing further processing or user interaction (e.g., confirming details with the user).
  - **`commitFlush(clientId, agentName)`**: Clears the conversation history for a client, resetting the context (e.g., before rerouting to a new agent).
  - **`getLastUserMessage(clientId)`**: Retrieves the most recent user input, useful for maintaining context during agent switches or error handling.

- **Purpose**: Tools enhance agent functionality, and these functions provide fine-grained control over conversation flow, agent transitions, and user communication.

---

### 7. Connecting to a Swarm
Connecting to a swarm allows clients (e.g., CLI, WebSocket, or HTTP interfaces) to interact with agents. `agent-swarm-kit` provides three primary methods: `session`, `makeConnection`, and `Chat`. Each supports disposal to clean up resources.

- **Session**: Ideal for WebSocket-based connections, `session` creates a persistent session for real-time bidirectional communication.
  - **Example**: A WebSocket server connects to the `TestSwarm`:
    ```javascript
    Bun.serve({
      fetch(req, server) {
        const clientId = new URL(req.url).searchParams.get("clientId");
        server.upgrade(req, { data: { clientId, session: session(clientId, SwarmName.TestSwarm) } });
      },
      websocket: {
        async message(ws, message) {
          const answer = await ws.data.session.complete(JSON.parse(message).data);
          ws.send(JSON.stringify({ data: answer, agentName: await getAgentName(ws.data.clientId) }));
        },
        async close(ws) {
          await ws.data.session.dispose(); // Dispose of the session
        },
      },
    });
    ```
  - **Disposal**: `dispose` cleans up session resources on closure.

- **MakeConnection**: Used for WebSocket connections with a publish-subscribe model, paired with a `Subject` for event handling.
  - **Example**: A Hono-based WebSocket server connects to the `ROOT_SWARM`:
    ```javascript
    app.get("/api/v1/session/:clientId", upgradeWebSocket((ctx) => {
      const clientId = ctx.req.param("clientId");
      const incomingSubject = new Subject<string>();
      return {
        onOpen(_, ws) {
          const receive = makeConnection(
            async (outgoing) => ws.send(JSON.stringify(outgoing)),
            clientId,
            ROOT_SWARM
          );
          incomingSubject.subscribe(receive);
        },
        onMessage(event) {
          incomingSubject.next(JSON.parse(event.data.toString()).data);
        },
        onClose: () => {
          disposeConnection(clientId, ROOT_SWARM); // Dispose of the connection
        },
      };
    }));
    ```
  - **Disposal**: `disposeConnection` terminates the connection on closure.

- **Chat**: Designed for CLI or simple interactive interfaces, `Chat` provides a high-level API for conversations.
  - **Example**: A CLI interface connects to the `TradingSwarm`:
    ```javascript
    const CLIENT_ID = "binance-candle-chat";
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const askQuestion = async () => {
      rl.question(`[${await getAgentName(CLIENT_ID)}] => `, async (input) => {
        if (input === "exit") { rl.close(); return; }
        const output = await Chat.sendMessage(CLIENT_ID, input, SwarmName.TradingSwarm);
        console.log(`[${await getAgentName(CLIENT_ID)}]: ${output}`);
        askQuestion();
      });
    };
    await Chat.beginChat(CLIENT_ID, SwarmName.TradingSwarm);
    askQuestion();
    ```
  - **Disposal**: Will be disposed automatically after 15 minutes of chat inactivity

- **Purpose**: These methods enable flexible swarm integration, with proper disposal ensuring resource efficiency.

---

### 8. Why Developers Should Fork the Repo and Use the Demo Folder

For developers looking to integrate `agent-swarm-kit` into real-life projects, forking the repository and exploring the `demo` folder is highly recommended. The official repository (assumed to be hosted on a platform like GitHub) provides a wealth of practical examples that demonstrate the framework’s capabilities in action. Here’s why this is important and how to get started:

- **Practical Examples**: The `demo` folder typically contains fully functional code samples that showcase real-world use cases, such as:
    - [**binance-candle-chat**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/binance-candle-chat/): A cryptocurrency trading swarm with a triage agent routing to specialized trader agents (BTC, ETH, BNB, XRP, SOL) that calculate buy/sell orders and predict trends using OpenAI completion.

    - [**it-consulting-swarm**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/it-consulting-swarm/): A multi-agent system with a triage agent routing queries to specialized agents for tech trends, cybersecurity, environment, health, and finance, all powered by OpenAI completion.

    - [**langchain-stream**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/langchain-stream/): A pharma sales demo with a triage agent using Cohere completion and LangChain for real-time token streaming, alongside Ollama and LMStudio, to assist with consultations and cart operations.

    - [**redis-persist-chat**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/redis-persist-chat/): A chat system with a triage agent using Saiga Yandex GPT, persisting chat history and states (like Tic-tac-toe) in Redis, with policies to restrict sensitive topics.

    - [**nginx-balancer-chat**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/nginx-balancer-chat/): A test environment demonstrating load balancing across 5 chat instances via Nginx, with a single agent reporting the server port using OpenAI completion.

    - [**cohere-token-rotate**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/cohere-token-rotate/): A pharma sales system with a triage agent using Cohere completion and a token rotation mechanism (10 trial tokens in parallel) for optimized API performance.

    - [**whisper-voice-chat**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/whisper-voice-chat/): A voice-based chat system using Whisper for real-time transcription and a single test agent powered by Nemotron Mini (via Ollama) to handle user interactions.

    - [**telegram-ollama-chat**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/telegram-ollama-chat/): A Telegram-based pharma sales chatbot with a triage agent routing requests to a sales agent, both using Ollama for natural conversations and managing product data from a shared storage.

    - [**repl-phone-seller**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/repl-phone-seller/): A REPL terminal app featuring a sales agent that helps users add phones to a cart, leveraging Ollama completions and tools for searching phones by keywords or diagonal size.

    - [**client-server-chat**](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/client-server-chat/): A WebSocket-based pharma sales demo with a single test agent using Saiga Yandex GPT to provide consultations and manage a cart.

- **Learning by Doing**: By forking the repo, you can:
  - Run the demos directly to see how components like agents, tools, and connections work together.
  - Modify the code to experiment with custom agents, tools, or completions tailored to your needs.
  - Use the demos as a starting point for your own projects, saving time on initial setup.

- **How to Get Started**:
  1. **Fork the Repository**: Visit the [agent-swarm-kit GitHub page](https://github.com/tripolskypetr/agent-swarm-kit), click "Fork," and clone it to your local machine:
     ```bash
     git clone https://github.com/tripolskypetr/agent-swarm-kit.git
     cd agent-swarm-kit
     ```
  2. **Install Dependencies**: Use Bun or npm to install required packages:
     ```bash
     npm install
     ```
  3. **Explore the Demo Folder**: Navigate to the `demo` directory (assuming it exists) and review the README or run the scripts:
     ```bash
     cd demo/binance-candle-chat
     npm install
     npm start
     ```
  4. **Customize and Build**: Copy a demo script, tweak it for your use case (e.g., change the swarm or add a tool), and integrate it into your project.

- **Purpose**: Forking the repo and using the `demo` folder provides a hands-on way to learn the framework, accelerate development, and adapt proven examples to your specific requirements.

---

## Putting It All Together: A Simple Example

Let’s create a basic swarm with a WebSocket connection and a tool:

1. **Define a Completion**:
   ```javascript
   import { Adapter, addCompletion, addAgent, addSwarm, addTool } from "agent-swarm-kit";
   import OpenAI from "openai";

   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   const SUPPORT_COMPLETION = addCompletion({
     completionName: "support_completion",
     getCompletion: Adapter.fromOpenAI(openai),
   });
   ```

2. **Create an Agent with a Tool**:
   ```javascript
   const SUPPORT_AGENT = addAgent({
     agentName: "support_agent",
     completion: SUPPORT_COMPLETION,
     prompt: "You are a customer support agent. Assist the user with their query.",
   });
   ```

3. **Build a Swarm**:
   ```javascript
   const SUPPORT_SWARM = addSwarm({
     swarmName: "support_swarm",
     agentList: [SUPPORT_AGENT],
     defaultAgent: SUPPORT_AGENT,
   });
   ```

4. **Connect via WebSocket**:
   ```javascript
   import { session, getAgentName } from "agent-swarm-kit";
   Bun.serve({
     fetch(req, server) {
       const clientId = new URL(req.url).searchParams.get("clientId");
       server.upgrade(req, { data: { clientId, session: session(clientId, SUPPORT_SWARM) } });
     },
     websocket: {
       async message(ws, message) {
         const answer = await ws.data.session.complete(message);
         ws.send(JSON.stringify({ data: answer, agentName: await getAgentName(ws.data.clientId) }));
       },
       async close(ws) {
         await ws.data.session.dispose();
       },
     },
     port: 1337,
   });
   ```

This setup provides a WebSocket-based support chatbot with a greeting tool, demonstrating key functions.

---

## Conclusion

`agent-swarm-kit` offers a robust framework for building agent-based systems. By mastering storages, completors, embedders, agents, swarms, tools, swarm connections, operational functions like `commitToolOutput` and `changeToAgent`, and leveraging the `demo` folder from a forked repository, you can create tailored applications for various use cases. Start small, explore the demos, and scale up as needed.

Happy coding!
