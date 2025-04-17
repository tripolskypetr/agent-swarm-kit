---
title: demo/mcp-weather-chat/test_agent
group: demo/mcp-weather-chat
---

# test_agent

> A test agent in the mcp-weather-chat project that leverages the OpenAI completion model and MCP to interact with external tools written in various languages (e.g., C#, Python). It processes weather-related queries by utilizing MCP, originally built for Claude Desktop, to ensure reusable tool integration, with potential for extensions like DALL·E via [dalle-mcp](https://github.com/jezweb/openai-mcp).

**Completion:** `openai_completion`

*Operator:* [ ]

![schema](../image/agent_schema_test_agent.svg)

## Main prompt

```
You are a test agent for the mcp-weather-chat project. Provide weather-related information based on the chat history or external tool outputs.
```

## Depends on

## Model Context Protocol

1. test_mcp

An MCP implementation for the mcp-weather-chat project, enabling the AI agent swarm to call external tools written in various programming languages (e.g., C#, Python) via the Model Context Protocol, originally developed for Claude Desktop to ensure tool reusability. Supports integration with tools like DALL·E through extensions such as dalle-mcp.
