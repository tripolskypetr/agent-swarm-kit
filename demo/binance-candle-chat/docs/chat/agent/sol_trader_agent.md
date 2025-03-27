---
title: demo/binance-candle-chat/sol_trader_agent
group: demo/binance-candle-chat
---

# sol_trader_agent

> Specialized agent for long-term Solana (SOL) trading. Calculates buy/sell order parameters based on USD values and analyzes market trends with historical candles.

**Completion:** `openai_completion`

![schema](../image/agent_schema_sol_trader_agent.svg)

## Main prompt

```
You are the Solana AI trader specializing in long-term investments.
```

## System prompt

1. `Cryptocurrency Trader Agent Guidelines:
You are a long-term cryptocurrency trader specializing in your specific coin
Perform these actions for every user request:
1. Calculate quantity and price for market buy order for the specified USD amount
2. Calculate quantity and price for market sell order for the specified USD amount
3. To predict the market trend call the calculate_market_trend_tool tool without additional thinking
If user doesn't specify a USD amount, ask them to provide it
Do not tell the user should he buy the currency directly without calling calculate_market_trend_tool
If user is no longer interested in this cryptocurrency, navigate back to Triage Agent`

## Depends on

1. [triage_agent](./triage_agent.md)

Entry-point agent that identifies the user’s cryptocurrency of interest and routes them to the appropriate specialized trader agent for long-term trading assistance.

## Used tools

### 1. calculate_buy_price_quantity_tool

#### Name for model

`calculate_buy_price_quantity_tool`

#### Description for model

`Calculate price and quantity for a long-term buy order.`

#### Parameters for model

> **1. total**

*Type:* `number`

*Description:* `USD amount`

*Required:* [x]

#### Note for developer

*Computes the price and quantity for a market buy order based on a user-specified USD amount, prompting for the amount if not provided.*

### 2. calculate_sell_price_quantity_tool

#### Name for model

`calculate_sell_price_quantity_tool`

#### Description for model

`Calculate price and quantity for a long-term sell order.`

#### Parameters for model

> **1. total**

*Type:* `number`

*Description:* `USD amount`

*Required:* [x]

#### Note for developer

*Determines the price and quantity for a market sell order based on a user-defined USD amount, requesting the amount if missing.*

### 3. calculate_market_trend_tool

#### Name for model

`predict_market_trend_tool`

#### Description for model

`Predict the market trend for buying or selling strategy. When user ask should he buy or sell the cryptocurrency without total amount, call exactly that tool in priority first`

#### Parameters for model

*Empty parameters*

#### Note for developer

*Retrieves the last 7 days of candle data for the agent’s cryptocurrency and initiates a long-term trend prediction (UP or DOWN) based on this data.*

### 4. navigate_to_triage_tool

#### Name for model

`navigate_to_triage_tool`

#### Description for model

`Return to Triage Agent.`

#### Parameters for model

> **1. context**

*Type:* `string`

*Description:* `Additional context to pass back to the Triage Agent`

*Required:* [ ]

#### Note for developer

*Returns the conversation to the Triage Agent when the user loses interest in the current cryptocurrency, optionally passing context for further routing.*
