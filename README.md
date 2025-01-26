# 🐝 agent-swarm-kit

> A TypeScript library for building orchestrated framework-agnostic multi-agent AI systems. Documentation [available in docs folder](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/docs)

## Installation

In comparison with langchain js this library provide the lightweight API so you can delegate the prompt engineering to other junior developers

```bash
npm install agent-swarm-kit
```

## The Idea

1. Several chatgpt sessions (agents) [execute tool calls](https://ollama.com/blog/tool-support). Each agent can use different model, for example, [mistral 7b](https://ollama.com/library/mistral) for small talk, [nemotron](https://ollama.com/library/nemotron) for business conversation

2. The agent swarm navigate messages to the active chatgpt session (agent) for each `WebSocket` channel [by using `clientId` url parameter](src/routes/session.ts#L5)

3. The active chatgpt session (agent) in the swarm could be changed [by executing function tool](https://platform.openai.com/docs/assistants/tools/function-calling) 

4. Each client sessions [share the same chat message history](https://platform.openai.com/docs/api-reference/messages/getMessage) for all agents. Each client chat history keep the last 25 messages with rotation. Only `assistant` and `user` messages are shared between chatgpt sessions (agents), the `system` and `tool` messages are agent-scoped so each agent knows only those tools related to It. As a result, each chatgpt session (agent) has it's [unique system prompt](https://platform.openai.com/docs/api-reference/messages/createMessage#messages-createmessage-role)

5. If the agent output do not pass the validation (not existing tool call, tool call with invalid arguments, empty output, XML tags in output or JSON in output by default), the resque algorithm will try to fix the model. At first it will hide the previos messeges from a model, if this will not help, it return a placeholder like `Sorry, I missed that. Could you say it again?`

## Test Cases

### Validation Test Cases

1. **Passes validation when all dependencies are provided**
   - Tests if validation passes when all dependencies are present.

2. **Fails validation when swarm is missing**
   - Tests if validation fails when the swarm is missing.

3. **Fails validation when completion is missing**
   - Tests if validation fails when the completion is missing.

4. **Fails validation when agent is missing**
   - Tests if validation fails when the agent is missing.

5. **Fails validation when tool is missing**
   - Tests if validation fails when the tool is missing.

6. **Fails validation when swarm's default agent is not in the list**
   - Tests if validation fails when the swarm's default agent is not included in the list.

### Model Recovery Test Cases

7. **Rescues model on non-existing tool call**
   - Tests if the model can recover when a non-existing tool is called.

8. **Rescues model on empty output**
   - Tests if the model can recover when the output is empty.

9. **Rescues model on failed tool validation**
   - Tests if the model can recover when tool validation fails.

10. **Failed rescue raises a placeholder**
    - Tests if a placeholder is returned when the rescue algorithm fails.

### Navigation Test Cases

11. **Navigates to sales agent on request**
    - Tests if the system navigates to the sales agent upon request.

12. **Navigates to refund agent on request**
    - Tests if the system navigates to the refund agent upon request.

### Deadlock Prevention Test Cases

13. **Avoids deadlock if commitToolOutput was not executed before navigation**
    - Tests if the system avoids deadlock when commitToolOutput is not executed before navigation.

14. **Avoids deadlock when commitToolOutput is executed in parallel with next completion**
    - Tests if the system avoids deadlock when commitToolOutput is executed in parallel with the next completion.

### Agent Execution Test Cases

15. **Ignores execution due to obsolete agent**
    - Tests if the system ignores execution due to an obsolete agent.

16. **Ignores commitToolOutput due to obsolete agent**
    - Tests if the system ignores commitToolOutput due to an obsolete agent.

17. **Ignores commitSystemMessage due to obsolete agent**
    - Tests if the system ignores commitSystemMessage due to an obsolete agent.

### Connection Disposal Test Cases

18. **Disposes connections for session function**
    - Tests if the system disposes of connections for the session function.

19. **Disposes connections for makeConnection function**
    - Tests if the system disposes of connections for the makeConnection function.

20. **Disposes connections for complete function**
    - Tests if the system disposes of connections for the complete function.

### Additional System Behavior Test Cases

21. **Uses different completions on multiple agents**
    - Tests if the system uses different completions for multiple agents.

22. **Clears history for similar clientId after each parallel complete call**
    - Tests if the system clears history for similar clientId after each parallel complete call.

23. **Orchestrates swarms for each connection**
    - Tests if the system orchestrates swarms for each connection.

24. **Queues user messages in connection**
    - Tests if the system queues user messages in connection.

25. **Allows server-side emit for makeConnection**
    - Tests if the system allows server-side emit for makeConnection.

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
    onMessage: async (event, ws) => {
      const message = event.data.toString();
      ws.send(await complete(message));
    },
    onClose: async () => {
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
- Tool Validation: Ensure agent tools calls meet argument requirements
- History Tracking: Log and retrieve agent interactions

**Use Cases:**
- AI-powered workflow automation
- Collaborative problem-solving systems
- Complex task distribution across specialized agents
- Intelligent system design with modular agent architecture
