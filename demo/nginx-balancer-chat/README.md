

# Directory demo\nginx-balancer-chat\docs\chat

---

title: demo/nginx-balancer-chat/test_swarm  
group: demo/nginx-balancer-chat  

---

# test_swarm

> This swarm serves as the core structure for the nginx-balancer-chat project, managing a single TestAgent as both the sole member and default agent to handle user interactions over a WebSocket-based system, leveraging the OpenaiCompletion to report the specific port of one of multiple upstreamed chat instances balanced by NGINX to port 80.

![picture](./docs/chat/image/agent_schema_test_agent.svg)

## Default agent

 - [test_agent](./agent/test_agent.md)  

	This agent operates within the nginx-balancer-chat project as a test agent, utilizing the OpenaiCompletion to inform users about the actual server port of one of multiple chat instances running on different ports and upstreamed by NGINX to port 80, extracting the port details from the chat history’s system message.

## Used agents

1. [test_agent](./agent/test_agent.md)  

	This agent operates within the nginx-balancer-chat project as a test agent, utilizing the OpenaiCompletion to inform users about the actual server port of one of multiple chat instances running on different ports and upstreamed by NGINX to port 80, extracting the port details from the chat history’s system message.

---

title: demo/nginx-balancer-chat/test_agent  
group: demo/nginx-balancer-chat  

---

# test_agent

> This agent operates within the nginx-balancer-chat project as a test agent, utilizing the OpenaiCompletion to inform users about the actual server port of one of multiple chat instances running on different ports and upstreamed by NGINX to port 80, extracting the port details from the chat history’s system message.

**Completion:** `openai_completion`

![picture](./docs/chat/image/swarm_schema_test_swarm.svg)

## Main prompt

```
You are a test agent for NGINX Upstream.
Tell user the server port from the chat history (system message).
```

## System prompt

1. `Extract the server port from the chat history’s system message and report it to the user.`

## Depends on

---

### Notes
- **Schema Images**: The placeholders `swarm_schema_test_swarm.svg` and `agent_schema_test_agent.svg` are included as per the template. Ensure these files exist in the specified paths or adjust the references if they don’t.
- **Content Adjustments**: 
  - Your original text mentioned `COHERE_COMPLETION` for the agent, but the setup instructions referenced an `OPENAI_API_KEY`. I’ve aligned this with `openai_completion` for consistency with the `<DOCUMENT>`’s existing `test_agent` and your environment setup. If you intended Cohere, let me know, and I’ll adjust it to `cohere_completion`.
  - I added a simple system prompt to clarify the port extraction behavior, as your original didn’t specify one, but the template often includes it.
- **Scope**: This rewrite is limited to the `test_swarm` and `test_agent` sections to fit the `docs/chat` template. If you want the full README (e.g., "NGINX Configuration," "Example Interaction") rewritten in a similar style, I can adapt those sections too—just let me know!
