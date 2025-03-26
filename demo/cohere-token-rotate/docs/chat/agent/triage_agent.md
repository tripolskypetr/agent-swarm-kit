---
title: demo/cohere-token-rotate/triage_agent
group: demo/cohere-token-rotate
---

# triage_agent

> This agent serves as a pharmaceutical seller within a triage system, offering consultations on pharma products using the CohereCompletion powered by a Cohere API with a token rotation mechanism to leverage 10 trial tokens in parallel for enhanced performance, and it employs the AddToCartTool only when necessary to assist with purchases.

**Completion:** `cohere_completion`

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

*This tool facilitates adding a pharmaceutical product to the cart by accepting a product title, logging the action for debugging, confirming the addition through a tool output, flushing the commit for consistency, and notifying the user via an emitted message within the cohere-token-rotation project’s pharma sales workflow.*
