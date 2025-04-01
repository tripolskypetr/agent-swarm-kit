---
title: demo/vllm-docker-chat/test_swarm
group: demo/vllm-docker-chat
---

# test_swarm

> This swarm serves as a testing environment for a single-agent system, incorporating the TestAgent as both the sole member and default agent to handle pharmaceutical sales interactions via a WebSocket-based interface, leveraging the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for its responses, while also defining Nemotron Mini and Gemma3 Tools completions that remain available for potential future use or alternative agent configurations.

![schema](./image/swarm_schema_test_swarm.svg)

## Default agent

 - [test_agent](./agent/test_agent.md)

	This agent acts as a pharmaceutical seller, providing consultations about pharma products to users, utilizing the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for responses, and calling the add-to-cart tool only when necessary to assist with purchases.

## Used agents

1. [test_agent](./agent/test_agent.md)

	This agent acts as a pharmaceutical seller, providing consultations about pharma products to users, utilizing the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for responses, and calling the add-to-cart tool only when necessary to assist with purchases.
