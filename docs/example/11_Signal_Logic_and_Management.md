---
title: example/11_signal_logic_and_management
group: example
---

# Signal Logic and Management

This document covers the `SignalLogicService` class and its role in processing, persisting, and distributing trading signals within the cryptocurrency trading platform. The `SignalLogicService` acts as the core business logic layer that commits validated signals to the database, calculates trading parameters, and coordinates notifications across multiple channels.

For information about signal generation and validation rules, see [Signal Generation and Validation](./10_Signal_Generation_and_Validation.md). For details about the automated job processing that triggers these signals, see [Automated Job Processing](./12_Automated_Job_Processing.md).

## SignalLogicService Overview

The `SignalLogicService` is the central coordinator for signal processing operations. It handles three types of signal actions: buy signals, wait signals, and close notifications. The service integrates with multiple external systems to ensure complete signal lifecycle management.

![Mermaid Diagram](./diagrams\11_Signal_Logic_and_Management_0.svg)

## Signal Processing Flow

The `SignalLogicService` processes three distinct signal types, each following a specific workflow pattern. All signal processing involves price calculation, database persistence, and multi-channel notification distribution.

![Mermaid Diagram](./diagrams\11_Signal_Logic_and_Management_1.svg)

## Buy Signal Processing

The `commitBuySignal` method handles the creation of new buy orders. It calculates trading parameters based on configuration constants and current market prices, then persists the signal and distributes notifications.

### Trading Parameter Calculation

| Parameter | Calculation | Source |
|-----------|-------------|---------|
| `buyPrice` | Current close price from Binance | `BinanceService.getClosePrice()` |
| `sellPrice` | Buy price + revenue percentage | `percentValue(price, 100 + CC_LADDER_TRADE_REVENUE)` |
| `quantity` | USD amount converted to coins | `usdToCoins(CC_LADDER_BUY_USDT, price)` |

### Buy Signal Data Flow

![Mermaid Diagram](./diagrams\11_Signal_Logic_and_Management_2.svg)

## Wait Signal Processing

The `commitWaitSignal` method handles situations where the analysis indicates waiting is the optimal strategy. Unlike buy signals, wait signals do not create tradeable orders but still log the decision and notify relevant channels.

### Wait Signal Characteristics

- **No Order Creation**: Wait signals do not generate database records in the signals collection
- **Information Logging**: All wait decisions are logged in the `InfoDbService` for analysis
- **Price Tracking**: Current market price is captured for reference
- **Multi-Channel Notification**: Telegram and webhook notifications are sent

![Mermaid Diagram](./diagrams\11_Signal_Logic_and_Management_3.svg)

## Close Signal Processing

The `commitCloseNotify` method handles the closing of existing buy orders when sell conditions are met. This method updates the original signal record and creates audit logs for the completed trade.

### Close Signal Validation

The method includes validation logic to ensure data integrity:

```typescript
if (dto.averagePrice === -1) {
  throw new Error(
    `signalLogicService commitCloseNotify invalid averagePrice for signalId=${dto.signal.id}`
  );
}
```

### Close Signal Operations

![Mermaid Diagram](./diagrams\11_Signal_Logic_and_Management_4.svg)

## Information Logging System

The `InfoDbService` maintains a comprehensive audit trail of all signal processing activities. The information logging system uses the `IInfoDto` schema to standardize log entries across all signal types.

### Info Schema Structure

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `action` | `"sell" \| "buy" \| "wait"` | Type of signal action | `"buy"`, `"wait"`, `"sell"` |
| `content` | `string` | Human-readable description | Signal comment or JSON data |
| `date` | `Date` | Timestamp of action | Current date/time |
| `symbol` | `string` | Trading pair symbol | `"BTCUSDT"`, `"ETHUSDT"` |
| `price` | `string` | Formatted price at time of action | `"45000.00"` |
| `info` | `string` | Additional metadata | Signal-specific information |
| `internal` | `string` | Internal system data | Signal report data |
| `reports` | `string[]` | Associated reports | Market analysis reports |

### Information Flow by Action Type

![Mermaid Diagram](./diagrams\11_Signal_Logic_and_Management_5.svg)

## Integration Points

The `SignalLogicService` serves as a central integration point connecting multiple subsystems. Understanding these integration points is crucial for maintaining and extending the signal processing pipeline.

### Service Dependencies

| Service | Purpose | Key Methods Used |
|---------|---------|------------------|
| `SignalDbService` | Signal persistence | `create()`, `update()` |
| `InfoDbService` | Audit logging | `create()` |
| `BinanceService` | Price data | `getClosePrice()`, `formatPrice()` |
| `TelegramWebService` | Telegram notifications | `publishBuySignal()`, `publishWaitSignal()`, `publishSellNotify()` |
| `WebhookService` | HTTP notifications | `sendBuy()`, `sendWait()`, `sendSell()` |
| `HumanReportService` | Market reports | `getReport()` |

### Configuration Dependencies

The service relies on configuration constants that control trading behavior:

- `CC_LADDER_BUY_USDT`: USD amount per buy order
- `CC_LADDER_TRADE_REVENUE`: Target profit percentage
