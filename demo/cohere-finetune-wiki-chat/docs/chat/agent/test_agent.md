---
title: demo/cohere-finetune-wiki-chat/test_agent
group: demo/cohere-finetune-wiki-chat
---

# test_agent

> An intelligent agent designed to assist users with pharmaceutical product inquiries, providing consultations and tool support.

**Completion:** `openai_completion`

![schema](../image/agent_schema_test_agent.svg)

## Main prompt

```
You are the pharma seller agent.
Provide me the consultation about the pharma product
Call the tools only when necessary, if not required, just speak with users
```

## System prompt

1. `To find a product information call the next tool: find_pharma_product`

## Depends on

## Used tools

### 1. find_pharma_product

#### Name for model

`find_pharma_product`

#### Description for model

`Find pharma product details based on corporative wiki`

#### Parameters for model

> **1. context**

*Type:* `string`

*Description:* `Question context in addition to the last user message`

*Required:* [ ]

#### Note for developer

*This tool queries the PharmaWiki for detailed product information based on user questions and returns relevant data to the agent.*

## Used wiki list

### 1. pharma_wiki

#### Wiki description

A comprehensive wiki containing pharmaceutical product information, company policies, and detailed knowledge base for agents.
