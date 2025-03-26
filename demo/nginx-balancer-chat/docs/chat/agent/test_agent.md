---
title: demo/nginx-balancer-chat/test_agent
group: demo/nginx-balancer-chat
---

# test_agent

> This agent operates within the nginx-balancer-chat project as a test agent, utilizing the OpenaiCompletion to inform users about the actual server port of one of 5 chat instances running on different ports and upstreamed by Nginx to port 80, extracting the port details from the chat history’s system message.

**Completion:** `openai_completion`

![schema](../image/agent_schema_test_agent.svg)

## Main prompt

```
You are a test agent for Nginx Upstream. Tell user the server port from the chat history (system message)
```

## Depends on
