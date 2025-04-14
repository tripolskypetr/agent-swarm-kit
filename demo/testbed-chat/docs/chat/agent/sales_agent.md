---
title: demo/testbed-chat/sales_agent
group: demo/testbed-chat
---

# sales_agent

> This agent, named SalesAgent, operates within the repl-phone-seller project to assist users in adding phones to a cart via a REPL terminal, using the OllamaCompletion for natural interactions, relying on SearchPhoneTool and SearchPhoneByDiagonalTool for phone queries, and employing AddToBacketTool to manage BasketStorage, all while storing phone data in PhoneStorage.

**Completion:** `openai_completion`

*Operator:* [ ]

![schema](../image/agent_schema_sales_agent.svg)

## Main prompt

```
Call only tools
Do not call tools until the human asks a question or requests it
Act like a living person until a tool needs to be called
```

## System prompt

1. `To add a phone to the basket, use add_to_basket_tool`

## Depends on

## Used tools

### 1. add_to_basket_tool

#### Name for model

`add_to_basket_tool`

#### Description for model

`Adds a phone to the basket for purchase`

#### Parameters for model

> **1. title**

*Type:* `string`

*Description:* `The phone name to add to ecommerce shopping cart`

*Required:* [ ]

#### Note for developer

*This tool, named AddToBacketTool, enables users in the repl-phone-seller project to add a phone to their cart via a REPL terminal by validating the phone title, storing it in BasketStorage with a unique ID, logging the action, confirming success through tool output, and prompting the user to place an order.*
