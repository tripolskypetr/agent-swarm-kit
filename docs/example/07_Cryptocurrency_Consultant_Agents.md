---
title: example/07_cryptocurrency_consultant_agent
group: example
---

# Cryptocurrency Consultant Agents

This document covers the specialized AI agents that provide cryptocurrency trading consultation services within the agent swarm system. These agents are cryptocurrency-specific consultants that analyze market data, provide trading recommendations, and offer investment strategies for Bitcoin, Ethereum, Binance Coin, Solana, and Ripple.

For information about the overall agent architecture and setup, see [Agent Architecture and Setup](./06_Agent_Architecture_and_Setup.md). For details about agent routing and navigation between agents, see [Agent Navigation and Routing](./08_Agent_Navigation_and_Routing.md).

## Agent Overview

The system implements five specialized cryptocurrency consultant agents, each dedicated to providing expert analysis and trading advice for a specific digital asset. These agents integrate real-time market data, technical indicators, and social sentiment analysis to deliver comprehensive investment recommendations.

### Consultant Agent Architecture

![Mermaid Diagram](./diagrams\7_Cryptocurrency_Consultant_Agents_0.svg)

## Agent Implementation Details

### Agent Registration and Configuration

All cryptocurrency consultant agents follow a consistent implementation pattern using the `addAgent` function from `agent-swarm-kit`. Each agent is configured with specific parameters for their cryptocurrency specialization.

| Agent | AgentName Enum | Cryptocurrency | Symbol |
|-------|---------------|---------------|---------|
| Bitcoin Consultant | `AgentName.BtcConsultantAgent` | Bitcoin | BTC |
| Ethereum Consultant | `AgentName.EthConsultantAgent` | Ethereum | ETH |
| Binance Coin Consultant | `AgentName.BnbConsultantAgent` | Binance Coin | BNB |
| Solana Consultant | `AgentName.SolConsultantAgent` | Solana | SOL |
| Ripple Consultant | `AgentName.XrpConsultantAgent` | Ripple | XRP |

Each agent uses `CompletionName.GrokMiniStreamCompletion` for AI processing and maintains conversation history with `keepMessages: 10`. Tool calls are unlimited with `maxToolCalls: Number.POSITIVE_INFINITY`.

### Dynamic System Context

Each agent generates dynamic system context that includes real-time market information:

![Mermaid Diagram](./diagrams\7_Cryptocurrency_Consultant_Agents_1.svg)

The `systemDynamic` function provides each agent with:
- Current date and time in DD/MM/YYYY HH:mm Z format
- Real-time cryptocurrency price from Binance API
- Balance report for web-based clients (not Telegram)

## Trading Strategy Framework

### Core Trading Parameters

All consultant agents implement a unified trading strategy based on the `CC_LADDER_TRADE_REVENUE` configuration parameter. The strategy focuses on trend reversal identification and risk management.

**Trading Strategy Rules:**
- Recommend purchases when price trends reverse from decline to growth
- Target growth of 1% over 56 hours with 8/10 confidence
- Maximum acceptable risk level: 4/10 (presented as "probability of success" 6/10)
- Risk-to-profit ratio requirement: minimum 1:1, preferably 1:2 or higher
- Stop-loss positioning to minimize immediate losses

### Analysis Time Horizons

Each agent analyzes market conditions across three time perspectives:

| Time Horizon | Duration | Technical Indicators | Data Sources |
|--------------|----------|---------------------|--------------|
| Short-term | 8 hours | EMA, SMA | Price data, Mastodon posts |
| Medium-term | 2-3 days | MACD, SMA | Price data, Mastodon posts |
| Long-term | 1 week | MACD, RSI | Price data, Mastodon posts |

## Analysis Tools and Data Sources

### Technical Analysis Tools

![Mermaid Diagram](./diagrams\7_Cryptocurrency_Consultant_Agents_2.svg)

Each consultant agent has access to the same comprehensive set of analysis tools:

**Technical Indicators:**
- `FetchShortRangeEmaSignals`: Exponential Moving Average for short-term analysis
- `FetchSwingRangeMacdSignals`: MACD for swing trading signals
- `FetchLongRangeRsiSignals`: RSI for long-term momentum analysis
- `FetchVolumeDataSmaSignals`: Simple Moving Average of trading volume

**Market Data:**
- `FetchPriceDataCandles`: Historical price data (last 100 hourly candles)
- `FetchMastodonNewsSignals`: Social media sentiment from Mastodon posts (7-day window)

**Navigation:**
- `NavigateToTriageTool`: Seamless handoff to triage agent when topic changes

## Agent Behavior and Communication Constraints

### Response Format Limitations

All consultant agents operate under strict communication constraints to ensure compatibility with the chat interface:

**Supported Formats:**
- Text-only Markdown messages
- Hyperlinks
- Inline code formatting

**Prohibited Formats:**
- Files or file attachments
- Images or graphics
- Tables
- HTML markup
- Code blocks with triple backticks
- Line breaks within responses

### Agent Navigation Logic

Each consultant agent monitors conversation context to determine when to redirect users to other agents:

**Navigation Triggers:**
- User expresses disinterest in the agent's specific cryptocurrency
- User mentions other cryptocurrencies (BTC, ETH, BNB, SOL, XRP)
- Trading discussions about non-specialized assets
- Purchase/sale requests for other cryptocurrencies

The navigation is implemented silently using `NavigateToTriageTool` without explicit user notification about the transfer.

## Error Handling and Rate Limiting

### Callback Implementation

Each consultant agent implements two critical callbacks for operational reliability:

![Mermaid Diagram](./diagrams\7_Cryptocurrency_Consultant_Agents_3.svg)

**`onResurrect` Callback:**
- Triggered when rate limits are exceeded
- Sends user notification via Telegram API
- Only applies to Telegram-based clients (clientId starts with "telegram-")
- Message: "Привышено количество запросов. Пожалуйста, повторите попытку"

**`onToolError` Callback:**
- Captures tool execution failures
- Logs comprehensive error information to `tool_error.txt`
- Records: error message, error data, client ID, agent name, tool name

## Agent Dependencies

All cryptocurrency consultant agents depend on the `TriageAgent` for proper routing and conversation management. This dependency ensures that users can be seamlessly transferred between specialized agents based on their queries and interests.

The dependency relationship is declared in each agent configuration using `dependsOn: [AgentName.TriageAgent]`, establishing the hierarchical agent structure within the swarm system.
