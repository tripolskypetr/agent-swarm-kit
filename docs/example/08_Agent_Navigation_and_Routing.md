---
title: example/08_agent_navigation_and_routing
group: example
---

# Agent Navigation and Routing

This document explains the navigation and routing system within the AI agent swarm, focusing on how users are directed between the triage agent and specialized cryptocurrency consultant agents. The system uses the agent-swarm-kit framework to provide seamless navigation between different conversation contexts based on user intent and cryptocurrency mentions.

For information about the individual consultant agents themselves, see [Cryptocurrency Consultant Agents](./07_Cryptocurrency_Consultant_Agents.md). For the overall agent architecture setup, see [Agent Architecture and Setup](./06_Agent_Architecture_and_Setup.md).

## Triage Agent Overview

The triage system is built around the `TriageAgent`, which serves as the primary entry point and router for user conversations. This agent analyzes user messages to determine which cryptocurrency the user is interested in and routes them to the appropriate specialist consultant.

![Mermaid Diagram](./diagrams\8_Agent_Navigation_and_Routing_0.svg)

## Navigation Tools Architecture

The navigation system uses a collection of specialized tools that handle routing between agents. Each navigation tool is responsible for detecting specific cryptocurrency mentions and initiating the appropriate agent transition.

### Navigation Tool Types

| Tool Name | Target Agent | Trigger Condition |
|-----------|-------------|-------------------|
| `NavigateToBtcConsultantTool` | `BtcConsultantAgent` | Bitcoin (BTC) mentions |
| `NavigateToEthConsultantTool` | `EthConsultantAgent` | Ethereum (ETH) mentions |
| `NavigateToBnbConsultantTool` | `BnbConsultantAgent` | Binance Coin (BNB) mentions |
| `NavigateToXrpConsultantTool` | `XrpConsultantAgent` | Ripple (XRP) mentions |
| `NavigateToSolConsultantTool` | `SolConsultantAgent` | Solana (SOL) mentions |
| `NavigateToTriageTool` | `TriageAgent` | Off-topic or return navigation |

## Agent Routing Flow

The routing process follows a structured pattern where the triage agent maintains conversation flow while evaluating each user message for navigation triggers.

![Mermaid Diagram](./diagrams\8_Agent_Navigation_and_Routing_1.svg)

## Navigation Tool Implementation

### Agent Navigation Tools

Each cryptocurrency-specific navigation tool follows a consistent implementation pattern using the `addAgentNavigation` function from agent-swarm-kit:

![Mermaid Diagram](./diagrams\8_Agent_Navigation_and_Routing_2.svg)

**Key Implementation Details:**

- **Immediate Execution**: All navigation tools include the instruction "Вызывается немедленно" (called immediately) when the target cryptocurrency is mentioned
- **Exclusive Execution**: Tools include "Если ты выбрал этот инструмент, не вызывай другие" (if you choose this tool, don't call others)
- **AgentName Enum**: Navigation targets are specified using the `AgentName` enum for type safety

### Triage Navigation Tool

The `NavigateToTriageTool` uses `addTriageNavigation` instead of `addAgentNavigation`, providing a special mechanism for returning to the main routing agent:

**Features:**
- **Force Flush**: Calls `commitFlushForce(clientId)` before navigation to ensure clean state transition
- **Off-topic Handling**: exampleed for questions not related to supported cryptocurrencies
- **No Response Requirement**: Explicitly instructs not to answer the user's question when navigating

## Agent-Symbol Mapping System

The `SignalMetaService` provides mapping between agent names and their corresponding trading symbols and display names, supporting the navigation system with metadata:

![Mermaid Diagram](./diagrams\8_Agent_Navigation_and_Routing_3.svg)

**Mapping Tables:**

| Agent | Trading Symbol | Display Name |
|-------|---------------|--------------|
| `BtcConsultantAgent` | `BTCUSDT` | `Bitcoin` |
| `EthConsultantAgent` | `ETHUSDT` | `Ethereum` |
| `BnbConsultantAgent` | `BNBUSDT` | `Binance Coin` |
| `XrpConsultantAgent` | `XRPUSDT` | `Ripple` |
| `SolConsultantAgent` | `SOLUSDT` | `Solana` |

## Error Handling and Callbacks

The triage agent implements several callback mechanisms for robust error handling and user experience management:

**Callback Functions:**
- **onResurrect**: Handles rate limiting by sending Telegram notifications when request limits are exceeded
- **onToolError**: Logs navigation tool errors to `./tool_error.txt` for debugging

**Error Logging Structure:**
- Client ID tracking
- Agent name identification
- Tool name specification
- Complete error payload with stack traces
