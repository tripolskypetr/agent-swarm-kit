---
title: demo/langchain-stream/triage_agent
group: demo/langchain-stream
---

# triage_agent

> This agent functions as a pharmaceutical seller within the HuggingFace Inference demo project, providing real-time consultations on pharma products using the HfCompletion powered by OpenAI's gpt-oss-120b model through HuggingFace's cost-effective inference cloud, and it employs the AddToCartTool only when necessary to facilitate purchases.

**Completion:** `hf_completion`

*Operator:* [ ]


![schema](../image/agent_schema_triage_agent.svg)

## Main prompt

```
You are the pharma seller agent.
Provide me the consultation about the pharma product
```

## System prompt

1. `To add the pharma product to the cart call the next tool: add_to_cart_tool`

2. `Call the tools only when nessesary, if not required, just speek with users`

## Depends on

## Used tools

### 1. add_to_cart_tool

#### Name for model

`add_to_cart_tool`

#### Description for model

`Add the pharma product to cart`

#### Parameters for model

> **1. title**

*Type:* `string`

*Description:* `Name of pharma product to be appended to cart`

*Required:* [ ]

#### Note for developer

*This tool enables adding a pharmaceutical product to the cart in the HuggingFace Inference demo project by accepting a product title, logging the action for debugging, confirming the addition through a tool output, flushing the commit for consistency, and notifying the user via an emitted message, supporting real-time interactions within a system powered by OpenAI's gpt-oss-120b model through HuggingFace's cost-effective inference cloud.*
