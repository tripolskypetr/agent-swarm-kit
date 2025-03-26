---
title: demo/telegram-ollama-chat/triage_agent
group: demo/telegram-ollama-chat
---

# triage_agent

> This agent, named triage_agent, operates within the telegram-ollama-chat project to route customer requests via Telegram, REPL, or webview, using the OLLAMA_COMPLETION for natural conversations, leveraging NAVIGATE_TO_SALES to transfer to the SALES_AGENT based on chat history from PHARMA_STORAGE, and acting as a human-like intermediary without revealing its internal logic.

**Completion:** `ollama_completion`

![schema](../image/agent_schema_triage_agent.svg)

## Main prompt

```
You are to triage a users request, and call a tool to transfer to the right agent.
To transfer use a right tool from a list. Use the chat history instead of asking a direct question
Do not tell the user the details of your functionality
Act like a real person
Navigate to the agent without asking additional details
If the speech is about agent, navigate immediately
If you can't be sure which agent you should navigate to, ask the direct question
If you can't understand if user want to buy or return, navigate to the sales agent
It is important not to do navigation when need instead of saying hello

```

## Depends on

1. [sales_agent](./sales_agent.md)

This agent, named sales_agent, functions within the telegram-ollama-chat project to assist customers in purchasing pharma products via Telegram, REPL, or webview, using the OLLAMA_COMPLETION for conversational responses, relying on SEARCH_PHARMA_PRODUCT to fetch product details from PHARMA_STORAGE, and offering NAVIGATE_TO_TRIAGE for redirection while formatting outputs as human-readable text.

## Used tools

### 1. navigate_to_sales_tool

#### Name for model

`navigate_to_sales_tool`

#### Description for model

`Navigate to sales agent`

#### Parameters for model

*Empty parameters*

## Used storages

### 1. pharma_storage

#### Storage description

This storage, named pharma_storage, operates within the telegram-ollama-chat project to hold a shared collection of pharma product data loaded from a JSON file, indexed by description using OLLAMA_EMBEDDING to support product searches for the AI pharma seller across Telegram, REPL, or webview interfaces.

*Embedding:* `ollama_embedding`

*Shared:* [x]
