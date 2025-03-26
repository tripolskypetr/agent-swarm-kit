---
title: demo/redis-persist-chat/root_swarm
group: demo/redis-persist-chat
---

# root_swarm

> This swarm serves as the root structure for the persist-redis-storage project, managing a single TriageAgent as both the sole member and default agent to handle customer chats using the SaigaYandexGPTCompletion, persisting chat history and states in Redis, while enforcing CrimeaPolicy and PutinPolicy to restrict discussions on sensitive topics.

![schema](./image/swarm_schema_root_swarm.svg)

## Default agent

 - [triage_agent](./agent/triage_agent.md)

	This agent serves as a triage agent within the redis-persist-chat project, engaging in customer chats using the SaigaYandexGPTCompletion, persisting chat history and agent state like TicTacToeState in Redis, and invoking TestStateTool or TestStorageTool only when requested to test state or storage functionalities stored in FactStorage.

## Used agents

1. [triage_agent](./agent/triage_agent.md)

	This agent serves as a triage agent within the redis-persist-chat project, engaging in customer chats using the SaigaYandexGPTCompletion, persisting chat history and agent state like TicTacToeState in Redis, and invoking TestStateTool or TestStorageTool only when requested to test state or storage functionalities stored in FactStorage.

## Banhammer policies

1. crimea_policy

	This policy, named CrimeaPolicy, operates within the persist-redis-storage project to automatically ban users and respond with a refusal message when input mentions 'crimea', preventing discussions about the Crimea crisis while chat history and agent states are persisted in Redis elsewhere in the system.

2. putin_policy

	This policy, named PutinPolicy, functions within the persist-redis-storage project to automatically ban users and issue a refusal message when input mentions 'putin', blocking political discussions while chat history and agent states are maintained in Redis throughout the system.
