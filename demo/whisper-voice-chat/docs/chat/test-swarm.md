---
title: demo/whisper-voice-chat/test-swarm
group: demo/whisper-voice-chat
---

# test-swarm

> This swarm serves as the core structure for the whisper-voice-chat project, managing a single test-agent as both the sole member and default agent to handle voice interactions, utilizing the navigate-completion with nemotron-mini:4b via Ollama to respond to user speech transcribed by Whisper in real-time.

![schema](./image/swarm_schema_test-swarm.svg)

## Default agent

 - [test-agent](./agent/test-agent.md)

	This agent, named test-agent, operates within the whisper-voice-chat project to engage in voice-based chats with users, leveraging the navigate-completion with nemotron-mini:4b via Ollama to process transcribed audio inputs from the Whisper model and provide conversational responses.

## Used agents

1. [test-agent](./agent/test-agent.md)

	This agent, named test-agent, operates within the whisper-voice-chat project to engage in voice-based chats with users, leveraging the navigate-completion with nemotron-mini:4b via Ollama to process transcribed audio inputs from the Whisper model and provide conversational responses.
