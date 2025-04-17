---
title: demo/mcp-weather-chat/test_swarm
group: demo/mcp-weather-chat
---

# test_swarm

> The core swarm structure for the mcp-weather-chat project, managing a single TestAgent that uses MCP to call external tools written in languages like C# or Python, leveraging the reusable tool framework from Claude Desktop. It handles weather-related user interactions, with potential for extensions like DALL·E integration via [dalle-mcp](https://github.com/jezweb/openai-mcp).

![schema](./image/swarm_schema_test_swarm.svg)

## Default agent

 - [test_agent](./agent/test_agent.md)

	A test agent in the mcp-weather-chat project that leverages the OpenAI completion model and MCP to interact with external tools written in various languages (e.g., C#, Python). It processes weather-related queries by utilizing MCP, originally built for Claude Desktop, to ensure reusable tool integration, with potential for extensions like DALL·E via [dalle-mcp](https://github.com/jezweb/openai-mcp).

## Used agents

1. [test_agent](./agent/test_agent.md)

	A test agent in the mcp-weather-chat project that leverages the OpenAI completion model and MCP to interact with external tools written in various languages (e.g., C#, Python). It processes weather-related queries by utilizing MCP, originally built for Claude Desktop, to ensure reusable tool integration, with potential for extensions like DALL·E via [dalle-mcp](https://github.com/jezweb/openai-mcp).
