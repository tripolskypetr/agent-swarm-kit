---
title: example/05_ai_agent_swarm_system
group: example
---

# AI Agent Swarm System

## Purpose and Scope

The AI Agent Swarm System provides conversational AI consultation for cryptocurrency trading through a coordinated network of specialized agents. This system uses the `agent-swarm-kit` framework to orchestrate multiple AI agents that can handle different cryptocurrencies, analyze market data, and provide trading recommendations. The system supports both Telegram bot interactions and web-based chat sessions.

For information about the signal processing pipeline that agents use for market analysis, see [Signal Processing Pipeline](./09_Signal_Processing_Pipeline.md). For details about the web server and API endpoints that support the chat interfaces, see [Web Services and External Integrations](./14_Web_Services_and_External_Integrations.md).

## Framework Integration and Configuration

The system is built on the `agent-swarm-kit` framework, which provides the core agent orchestration, conversation management, and persistence capabilities. The framework is configured with Redis-based persistence adapters for all agent state management.

### Core Framework Setup

The main framework configuration is established in `src/config/setup.ts`, where global settings are applied:

```typescript
setConfig({
  CC_PERSIST_EMBEDDING_CACHE: true,
  CC_KEEP_MESSAGES: 50,
  CC_MAX_NESTED_EXECUTIONS: 20,
});
```

The system implements a custom `ChatInstance` adapter that prevents concurrent message processing using the `singlerun` decorator `src/config/setup.ts`.

![Mermaid Diagram](./diagrams\5_AI_Agent_Swarm_System_0.svg)

### Redis Persistence Adapters

The system implements comprehensive Redis-based persistence for all agent-swarm-kit components. Each adapter follows a consistent pattern with Redis key namespacing and TTL management:

| Adapter Type | Redis Key Pattern | TTL | Purpose |
|-------------|-------------------|-----|---------|
| History | `history:{clientId}:messages` | 900s | Chat message history |
| ActiveAgent | `swarm:{swarmName}:active_agent:{clientId}` | None | Current active agent |
| NavigationStack | `swarm:{swarmName}:navigation_stack:{clientId}` | None | Agent navigation history |
| State | `state:{stateName}:{clientId}` | None | Agent-specific state |
| Storage | `storage:{storageName}:{clientId}` | None | Agent storage |
| Memory | `memory:{memoryName}:{clientId}` | None | Agent memory |
| Policy | `policy:{swarmName}:{policyName}` | None | Swarm policies |
| Alive | `alive:{swarmName}:{clientId}` | 600s | Session keepalive |
| Embedding | `embedding:{embeddingName}:{stringHash}` | 604800s | Vector embeddings cache |

## Agent Architecture and Types

The system implements several types of specialized agents, each with specific roles and capabilities within the swarm.

### Agent Hierarchy

![Mermaid Diagram](./diagrams\5_AI_Agent_Swarm_System_1.svg)

### Cryptocurrency Consultant Agents

Each cryptocurrency consultant agent follows a standardized pattern with identical system prompts and tool configurations, specialized only for their specific cryptocurrency:

- **Bitcoin Consultant** (`btc_consultant_agent`) - Specializes in Bitcoin analysis and recommendations
- **Ethereum Consultant** (`eth_consultant_agent`) - Focuses on Ethereum market analysis  
- **BNB Consultant** (`bnb_consultant_agent`) - Handles Binance Coin trading strategies
- **Solana Consultant** (`sol_consultant_agent`) - Provides Solana-specific consultation
- **Ripple Consultant** (`xrp_consultant_agent`) - Specializes in XRP analysis

All consultant agents share the same core capabilities:
- Investment recommendations with risk assessment
- Technical analysis using multiple timeframes (8 hours, 2-3 days, 1 week)
- Stop-loss calculations based on market volume indicators
- Navigation back to triage agent for off-topic queries

### Signal Agent

The `signal_agent` serves as an internal market analysis tool that processes professional trading reports and generates buy/wait recommendations. Unlike consultant agents, it focuses on binary decision-making rather than conversational consultation.

Key characteristics:
- Uses `grok_mini_completion` (non-streaming) for decisive responses
- Implements specific trading strategy criteria (1% growth in 56 hours, 8/10 confidence)
- Provides two tool options: `trade_recommend_buy` and `trade_recommend_wait`
- Requires detailed risk assessment and stop-loss justification

## Communication Interfaces

The swarm system supports multiple communication channels for user interaction, each with specific client ID patterns and message handling.

### Communication Flow Architecture

![Mermaid Diagram](./diagrams\5_AI_Agent_Swarm_System_2.svg)

### Telegram Integration

The Telegram interface implements a bot that handles text messages and provides cryptocurrency consultation. The bot configuration includes:

- Command handling for `/start` with optional symbol parameters
- Automatic query generation for supported symbols (BTCUSDT, ETHUSDT, BNBUSDT, XRPUSDT, SOLUSDT)
- Message streaming with HTML parsing for rich text display
- Session lifecycle management with Redis persistence

Client ID pattern: `telegram-{chatId}` `src/main/telegram.ts`

### WebSocket Integration

The WebSocket interface provides real-time communication for web-based chat applications:

- Upgrade endpoint at `/session/:chatId` 
- Token-level streaming for responsive user experience
- JSON message protocol for bidirectional communication
- Automatic session cleanup on connection close

Client ID pattern: `web-{chatId}` `src/routes/session.ts`

## Agent Tools and Capabilities

Each agent in the swarm has access to a comprehensive set of tools for market analysis and navigation. The tools are consistently implemented across all cryptocurrency consultant agents.

### Market Analysis Tools

All consultant agents share the same set of market analysis tools:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `fetch_short_range_ema_signals` | EMA signals for 8-hour analysis | None |
| `fetch_swing_range_macd_signals` | MACD signals for 2-3 day analysis | None |
| `fetch_long_range_rsi_signals` | RSI signals for 1-week analysis | None |
| `fetch_volume_data_sma_signals` | SMA volume analysis for stop-loss calculation | None |
| `fetch_mastodon_news_signals` | Social media sentiment from Mastodon | None |
| `fetch_price_data_candles` | Last 100 1-hour price candles | None |

### Navigation Tools

Agent navigation is handled through a standardized tool available to all consultant agents:

- `navigate_to_triage_tool` - Returns control to the triage agent for topic routing
- Implements silent navigation (no user notification of the switch)
- Prevents calling other tools when navigation is triggered

### Signal Agent Tools

The signal agent has specialized tools for decision-making:

| Tool Name | Purpose | Required Parameters |
|-----------|---------|-------------------|
| `trade_recommend_buy` | Send buy recommendation | reason, stop_loss, possibility |
| `trade_recommend_wait` | Send wait recommendation | reason |

## Agent Tool Integration with Services

The agent tools connect to the broader system through service layer integrations that provide market data and analysis capabilities.

![Mermaid Diagram](./diagrams\5_AI_Agent_Swarm_System_3.svg)

## Swarm Orchestration and Lifecycle

The swarm system manages agent lifecycles, conversation state, and resource allocation through the `SwarmName.RootSwarm` configuration.

### Session Lifecycle Management

![Mermaid Diagram](./diagrams\5_AI_Agent_Swarm_System_4.svg)

The system implements automatic session cleanup with TTL-based expiration for different data types, ensuring resource efficiency while maintaining conversation continuity during active use.
