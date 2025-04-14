---
title: demo/testbed-chat/root_swarm
group: demo/testbed-chat
---

# root_swarm

> This swarm, named RootSwarm, is the core structure for the repl-phone-seller project's testbed environment using worker-testbed with the WorkerThreads API and tape. It manages a single SalesAgent as both the sole member and default agent, designed to mock tool calls for validation, passing tests when tools (e.g., AddToBacketTool) are called correctly and failing otherwise. It utilizes OpenAI for natural interactions, coordinating tools and storages to handle phone searches and basket management.

![schema](./image/swarm_schema_root_swarm.svg)

## Default agent

 - [sales_agent](./agent/sales_agent.md)

	This agent, named SalesAgent, is designed for a testbed environment using worker-testbed and the WorkerThreads API with tape. It mocks tool calls to validate their execution, passing tests when the correct tool (e.g., AddToBacketTool) is called as requested and failing otherwise. It uses OpenAI for interaction, manages phone additions to BasketStorage via AddToBacketTool, and stores phone data in PhoneStorage.

## Used agents

1. [sales_agent](./agent/sales_agent.md)

	This agent, named SalesAgent, is designed for a testbed environment using worker-testbed and the WorkerThreads API with tape. It mocks tool calls to validate their execution, passing tests when the correct tool (e.g., AddToBacketTool) is called as requested and failing otherwise. It uses OpenAI for interaction, manages phone additions to BasketStorage via AddToBacketTool, and stores phone data in PhoneStorage.
