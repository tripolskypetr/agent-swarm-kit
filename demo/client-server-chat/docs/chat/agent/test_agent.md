---
title: demo/client-server-chat/test_agent
group: demo/client-server-chat
---

# test_agent

> This agent acts as a pharmaceutical seller, providing consultations about pharma products to users, utilizing the Saiga Yandex GPT model for responses, and calling the add-to-cart tool only when necessary to assist with purchases.

**Completion:** `saiga_yandex_gpt_completion`

![schema](../image/agent_schema_test_agent.svg)

## Main prompt

```
You are the pharma seller agent.
Provide me the consultation about the pharma product
Call the tools only when nessesary, if not required, just speek with users
```

## System prompt

1. `To add the pharma product to the cart call the next tool: add_to_cart_tool`

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

*This tool enables adding a pharmaceutical product to the cart by taking a product title as input, logging the action for debugging, and notifying the user of successful addition through both tool output and an emitted message.*
