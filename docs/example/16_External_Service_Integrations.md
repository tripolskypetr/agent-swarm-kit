---
title: example/16_external_service_integrations
group: example
---

# External Service Integrations

This page documents the various external service integrations that enable the signals platform to operate effectively. The system integrates with multiple third-party APIs and services for market data, notifications, AI processing, and social media monitoring.

For information about the web server and API endpoints that facilitate these integrations, see [5.1](./14_Web_Services_and_External_Integrations.md). For details about the AI agent system that utilizes some of these integrations, see [3](./05_AI_Agent_Swarm_System.md).

## Integration Overview

The platform integrates with several categories of external services to provide comprehensive trading signal functionality:

![Mermaid Diagram](./diagrams\16_External_Service_Integrations_0.svg)

## Telegram Integration

The `TelegramWebService` handles publishing trading signals to Telegram channels and provides bot interaction capabilities.

### Signal Publishing

The service formats and publishes three types of signals:

| Signal Type | Method | Description |
|-------------|--------|-------------|
| Buy Signal | `publishBuySignal` | Publishes buy recommendations with stop-loss and possibility data |
| Wait Signal | `publishWaitSignal` | Publishes wait recommendations with TTL caching |
| Sell Signal | `publishSellNotify` | Publishes sell notifications with profit/loss calculations |

### Signal Formatting

Each signal type generates structured markdown content that gets converted to Telegram HTML:

![Mermaid Diagram](./diagrams\16_External_Service_Integrations_1.svg)

### Configuration Parameters

The Telegram integration uses these environment variables:

- `CC_TELEGRAM_TOKEN` - Bot authentication token
- `CC_TELEGRAM_CHANNEL` - Target channel for publishing
- `CC_TELEGRAM_BOT` - Bot username for deep linking

### TTL Caching

Wait signals implement TTL caching to prevent spam:
- Cache duration: 6 hours (`WAIT_SIGNAL_TTL = 6 * 60 * 60 * 1000`)
- Cache key: Symbol name
- Automatic cache clearing on buy/sell signals

## Binance API Integration

The `BinanceService` provides market data and price formatting capabilities used throughout the system.

### Market Data Functions

The service integrates with Binance API to provide:

- Real-time price data via `getClosePrice(symbol)`
- Price formatting via `formatPrice(symbol, price)`
- Quantity formatting via `formatQuantity(symbol, quantity)`

### Integration Points

Binance service is used by multiple components:

![Mermaid Diagram](./diagrams\16_External_Service_Integrations_2.svg)

## Webhook Integration

The `WebhookService` sends HTTP notifications to external systems for signal events.

### Webhook Endpoints

The service provides three webhook types:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/buy` | POST | Buy signal notifications |
| `/api/v1/wait` | POST | Wait signal notifications |
| `/api/v1/sell` | POST | Sell signal notifications |

### Authentication

Webhooks use JWT authentication:
- `JwtService.generateAccessToken()` for token generation
- `Authorization: Bearer <token>` header format

### Payload Structure

**Buy Signal Payload:**
```json
{
  "symbol": "string",
  "stopLoss": "string", 
  "comment": "string",
  "signalId": "string"
}
```

**Wait Signal Payload:**
```json
{
  "symbol": "string",
  "comment": "string"
}
```

**Sell Signal Payload:**
```json
{
  "signalId": "string",
  "symbol": "string"
}
```

### Error Handling

The service implements comprehensive error handling with logging for failed webhook deliveries, including error data serialization and message extraction.

## AI Service Integration

The system integrates with Grok AI for LLM-powered signal analysis and agent conversations.

### Signal Processing Integration

AI integration occurs within the agent-swarm-kit framework:

![Mermaid Diagram](./diagrams\16_External_Service_Integrations_3.svg)

### Tool Integration

The system overrides agent-swarm-kit tools for signal recommendations:

- `ToolName.SignalRecommendBuy` - Processes buy recommendations with stop-loss and possibility parameters
- `ToolName.SignalRecommendWait` - Processes wait recommendations with reasoning

### Error Handling

AI tool errors are captured and logged to `signal_tool_error.txt` with comprehensive error data including client ID, agent name, and tool name.

## Social Media Integration

The platform integrates with Mastodon API for social sentiment analysis, though the specific implementation details are handled by the `MastodonWebService`.

### Integration Purpose

Social media integration provides:
- Market sentiment data
- News aggregation from social sources
- Additional signal validation data

### Service Architecture

![Mermaid Diagram](./diagrams\16_External_Service_Integrations_4.svg)

## Integration Configuration

### Environment Variables

External service integrations are configured through environment variables:

| Service | Variables | Purpose |
|---------|-----------|---------|
| Telegram | `CC_TELEGRAM_TOKEN`, `CC_TELEGRAM_CHANNEL`, `CC_TELEGRAM_BOT` | Bot authentication and channel configuration |
| Webhook | `CC_WEBHOOK_URL` | Target webhook endpoint URL |
| Signal Processing | `CC_SIGNAL_CHECK_TTL` | Signal processing timeout configuration |

### Service Registration

External services are registered in the IoC container with specific type identifiers:

- `TYPES.telegramApiService` - Telegram API client
- `TYPES.binanceService` - Binance API client  
- `TYPES.jwtService` - JWT token service for webhook authentication
