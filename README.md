# 🐝 agent-swarm-kit

> A TypeScript library for building orchestrated framework-agnostic multi-agent AI systems

## Installation

In comparison with langchain js this library provide the lightweight API so you can delegate the prompt engineering to other junior developers

```bash
npm install agent-swarm-kit
```

## Code sample

```tsx
import {
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  changeAgent,
  execute,
  session,
} from "agent-swarm-kit";

const NAVIGATE_TOOL = addTool({
  toolName: "navigate-tool",
  call: async (clientId, agentName, { to }) => {
    await changeAgent(to, clientId);
    await execute("Navigation complete. Notify the user", clientId);
  },
  validate: async () => true,
  type: "function",
  function: {
    name: "navigate-tool",
    description: "The tool for navigation",
    parameters: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "The target agent for navigation",
        },
      },
      required: ["to"],
    },
  },
});

const ollama = new Ollama({ host: CC_OLLAMA_HOST });

const MOCK_COMPLETION = addCompletion({
  completionName: "navigate-completion",
  /**
   * Use whatever you want: NVIDIA NIM, OpenAI, GPT4All, Ollama or LM Studio
   * Even mock it for unit test of tool integration like it done in `test` folder
   * 
   * @see https://github.com/tripolskypetr/agent-swarm-kit/tree/master/test
   */
  getCompletion: async ({ messages, tools }) => {
    return ollama.chat({
      model: CC_OLLAMA_CHAT_MODEL,
      keep_alive: "1h",
      messages,
      tools,
    })
  },
});

const TRIAGE_AGENT = addAgent({
  agentName: "triage-agent",
  completion: MOCK_COMPLETION,
  prompt: "You are to triage a users request, and call a tool to transfer to the right agent. There are two agents available: `sales-agent` and `refund-agent`",
  tools: [NAVIGATE_TOOL],
});

const SALES_AGENT = addAgent({
  agentName: "sales-agent",
  completion: MOCK_COMPLETION,
  prompt: "You are a sales agent that handles all actions related to placing the order to purchase an item.",
  tools: [NAVIGATE_TOOL],
});

const REDUND_AGENT = addAgent({
  agentName: "refund-agent",
  completion: MOCK_COMPLETION,
  prompt: "You are a refund agent that handles all actions related to refunds after a return has been processed.",
  tools: [NAVIGATE_TOOL],
});

const TEST_SWARM = addSwarm({
  agentList: [TRIAGE_AGENT, SALES_AGENT, REDUND_AGENT],
  defaultAgent: TRIAGE_AGENT,
  swarmName: "navigation-swarm",
});

...


app.get("/api/v1/session/:clientId", upgradeWebSocket((ctx) => {
  const clientId = ctx.req.param("clientId");

  const { complete, dispose } = session(clientId, TEST_SWARM)

  return {
    onMessage(event) {
      const message = event.data.toString();
      incomingSubject.next(await complete(message));
    },
    onClose: () => {
      await dispose();
    },
  }
}));

```

The feature of this library is dependency inversion for agents injection. The agents are being lazy loaded during runtime, so you can declare them in separate modules and connect them to swarm with a string constant

```tsx

addTool({
    toolName: "test-tool",
    ...
})

addAgent({
  agentName: "test-agent",
  completion: "openai-completion",
  prompt: "...",
  tools: ["test-tool"],
});

addSwarm({
  agentList: ["test-agent"],
  defaultAgent: "test-agent",
  swarmName: "test-swarm",
});

const { complete, dispose } = session(clientId, "test-swarm")
```

## Briefing

Agent Swarm Kit lets you build intelligent multi-agent systems where different agents can collaborate, execute tasks, and communicate seamlessly. Think of it like creating a team of specialized AI agents that can work together, share information, validate their actions, and track their interactions - all through a structured TypeScript framework. It's essentially a toolkit for creating complex, coordinated AI workflows where agents can execute commands, commit outputs, and maintain a history of their interactions.

**Key Features:**
- Create and manage complex agent networks
- Enable agents to execute tasks, communicate, and collaborate
- Provide robust validation for tools, agents, and sessions
- Track agent interactions and maintain comprehensive history
- Support seamless message passing and output tracking

**Core Components:**
- Agent Management: Create, validate, and connect agents
- Session Handling: Execute commands across agent networks
- Tool Validation: Ensure agent tools meet system requirements
- History Tracking: Log and retrieve agent interactions

**Use Cases:**
- AI-powered workflow automation
- Collaborative problem-solving systems
- Complex task distribution across specialized agents
- Intelligent system design with modular agent architecture
