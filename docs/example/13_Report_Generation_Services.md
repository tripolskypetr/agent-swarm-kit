---
title: example/13_report_generation_services
group: example
---

# Report Generation Services

## Purpose and Scope

The Report Generation Services provide AI-powered market analysis and trading insights for cryptocurrency trading signals. These services generate various types of reports including technical analysis, social sentiment analysis, and market data reports across different time ranges. The system leverages the AI agent swarm to create detailed, contextual reports for specific cryptocurrency symbols.

For information about signal processing and validation, see [Signal Generation and Validation](./10_Signal_Generation_and_Validation.md). For details about the AI agents that power these reports, see [AI Agent Swarm System](./05_AI_Agent_Swarm_System.md).

## Architecture Overview

The report generation system follows a layered architecture with public service facades that orchestrate private implementation services through the AI agent swarm framework.

![Mermaid Diagram](./diagrams\13_Report_Generation_Services_0.svg)

## Report Types and Categories

The system provides six distinct types of reports, each specialized for different aspects of market analysis:

| Report Type | Purpose | Data Sources | Time Frame |
|-------------|---------|--------------|------------|
| **Short Range** | Short-term technical analysis | Binance price data, technical indicators | Short-term |
| **Swing Range** | Swing trading analysis | Binance price data, technical indicators | Medium-term |
| **Long Range** | Long-term trend analysis | Binance price data, technical indicators | Long-term |
| **Price Data** | Price-focused technical analysis | Binance price data, technical indicators | Variable |
| **Volume Data** | Volume-based market analysis | Binance volume data, technical indicators | Variable |
| **Mastodon Search** | Social sentiment analysis | Mastodon social media posts | Real-time |

## Service Architecture and Patterns

All report generation services follow a consistent architectural pattern with public facades, dependency injection, and standardized caching mechanisms.

### Common Structure Pattern

![Mermaid Diagram](./diagrams\13_Report_Generation_Services_1.svg)

### Dependency Injection Pattern

Each public service uses the IoC container to inject its dependencies:

```typescript
// Common injection pattern across all report services
private privateService = inject<PrivateServiceType>(TYPES.privateServiceType);
private binanceService = inject<BinanceService>(TYPES.binanceService);
private coinMetaService = inject<CoinMetaService>(TYPES.coinMetaService);
```

## Agent Swarm Integration

The report generation services integrate deeply with the AI agent swarm system to provide contextual, AI-generated analysis.

![Mermaid Diagram](./diagrams\13_Report_Generation_Services_2.svg)

### Agent Override Configuration

All services configure the `ReportAgent` with dynamic system prompts that include real-time market context:

```typescript
overrideAgent({
  agentName: AgentName.ReportAgent,
  systemDynamic: async () => {
    const averagePrice = await this.binanceService.formatPrice(
      symbol,
      await this.binanceService.getClosePrice(symbol)
    );
    return str.newline([
      `Текущая дата/время: ${new Date().toISOString()}`,
      `Текущая цена ${this.coinMetaService.getCoinNameForSymbol(symbol)}: ${averagePrice}`,
      `Отчет создается для монеты ${this.coinMetaService.getCoinNameForSymbol(symbol)}`,
      "В отчете обязательно напиши дату индикаторов, на которые ты ссылаешься",
    ]);
  },
  mcp: [],
});
```

## Caching and Performance Optimization

The system implements sophisticated caching mechanisms using TTL (time-to-live) strategies to optimize performance and reduce redundant API calls.

### TTL Configuration

| Service | TTL Constant | Cache Key Pattern |
|---------|--------------|-------------------|
| `SwingRangeReportPublicService` | `CC_SWING_RANGE_REPORT_TTL` | `${symbol}` |
| `ShortRangeReportPublicService` | `CC_SHORT_RANGE_REPORT_TTL` | `${symbol}` |
| `LongRangeReportPublicService` | `CC_LONG_RANGE_REPORT_TTL` | `${symbol}` |
| `PriceDataReportPublicService` | `CC_PRICE_DATA_REPORT_TTL` | `${symbol}` |
| `VolumeDataReportPublicService` | `CC_VOLUME_DATA_REPORT_TTL` | `${symbol}` |
| `MastodonSearchReportPublicService` | `CC_MASTODON_REPORT_TTL` | `${symbol}` |

### TTL Implementation Pattern

```typescript
public getReport = ttl(
  async (symbol: string) => {
    // Report generation logic
  },
  {
    timeout: TTL_CONSTANT,
    key: ([symbol]) => `${symbol}`,
  }
);
```

## Data Sources and Dependencies

The report generation services integrate with multiple data sources to provide comprehensive market analysis.

### Primary Data Sources

![Mermaid Diagram](./diagrams\13_Report_Generation_Services_3.svg)

### Service Dependencies

Most technical analysis services depend on:
- `BinanceService` for real-time price and volume data
- `CoinMetaService` for cryptocurrency metadata and symbol resolution

The `MastodonSearchReportPublicService` is unique in that it:
- Does not depend on `BinanceService`
- Focuses solely on social sentiment analysis
- Uses simplified system prompts without price context

## Client ID Generation and Swarm Context

Each report generation creates a unique execution context within the agent swarm using structured client ID patterns and consistent swarm naming.

### Client ID Patterns

```typescript
// Format: {report-type}_{symbol}_{randomString()}
clientId: `swing-range-report_${symbol}_${randomString()}`
clientId: `short-range-report_${symbol}_${randomString()}`
clientId: `long-range-report_${symbol}_${randomString()}`
clientId: `price-data-report_${symbol}_${randomString()}`
clientId: `volume-data-report_${symbol}_${randomString()}`
clientId: `mastadon-search-report_${symbol}_${randomString()}`
```

All services use `SwarmName.ReportSwarm` as their execution context, ensuring consistent agent behavior and resource management across different report types.
