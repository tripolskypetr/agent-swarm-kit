---
title: example/17_api_endpoints
group: example
---

# API Endpoints

This document describes the REST API endpoints provided by the web server for cryptocurrency wallet operations, trading activities, and market data retrieval. The API serves the frontend applications and enables management of trading orders, technical analysis, and financial reporting.

For information about the underlying web server infrastructure and middleware, see [Web Server and Error Handling](./15_Web_Server_and_Error_Handling.md). For details about external service integrations that provide market data, see [External Service Integrations](./16_External_Service_Integrations.md).

## API Architecture and Request Structure

All API endpoints in the system follow a consistent POST-based architecture with standardized request and response formats. The endpoints are defined in the Hono web server and use dependency injection to access underlying services.

![Mermaid Diagram](./diagrams\17_API_Endpoints_0.svg)

### Request Structure

All endpoints accept POST requests with a standardized JSON payload containing:

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Unique identifier for request tracking |
| `serviceName` | string | Name of the calling service |
| `pagination` | object | Pagination parameters (for list endpoints) |
| `filterData` | object | Filter criteria (for list endpoints) |
| Additional fields | varies | Endpoint-specific data |

### Response Structure

All endpoints return a consistent JSON response format:

| Field | Type | Description |
|-------|------|-------------|
| `data` | object/array | The actual response data |
| `status` | string | "ok" or "error" |
| `error` | string | Error message (empty if status is "ok") |
| `requestId` | string | Echo of the request ID |
| `serviceName` | string | Echo of the service name |

## Order Management Endpoints

These endpoints handle the creation, modification, and lifecycle management of trading orders.

![Mermaid Diagram](./diagrams\17_API_Endpoints_1.svg)

### Order Creation

**Endpoint:** `POST /crypto-wallet/order/create`

Creates a new trading order with validation for price, quantity, and timestamp fields.

**Request Interface:**
- Extends `CreateRequest` with symbol and data fields
- Validates numeric inputs to prevent NaN values
- Formats price and quantity using `BinanceService`

**Key Operations:**
- Input validation for `price`, `quantity`, `timestamp`
- Price formatting via `binanceService.formatPrice()`
- Quantity formatting via `binanceService.formatQuantity()`
- Database persistence via `orderOpenDbService.create()`

### Order Modification

**Endpoint:** `POST /crypto-wallet/order/edit/:id`

Updates an existing order with new price, quantity, or comment information.

**Process Flow:**
1. Retrieve existing order via `orderOpenDbService.findById()`
2. Validate new input parameters
3. Format price and quantity values
4. Update record via `orderOpenDbService.update()`

### Order Closing

**Endpoint:** `POST /crypto-wallet/action/commit_close`

Closes an open order by creating a close record and marking the original order as ignored.

**Close Process:**
1. Validate close price is not NaN
2. Calculate estimated revenue: `(closePrice - originalPrice) * quantity`
3. Create `OrderClose` record via `orderCloseDbService.create()`
4. Update original order with `ignore: true` and `orderCloseId`

The `commitClose` function demonstrates the two-phase close operation:

## Market Data and Analysis Endpoints

These endpoints provide access to market data, technical indicators, and trading analysis information.

### Trading Information

**Endpoint:** `POST /crypto-wallet/trade_info`

Returns comprehensive trading information including technical indicators, order statistics, and financial metrics.

**Data Sources:**
- Short Range: EMA indicators via `shortRangeMathService.getEMA()`
- Swing Range: MACD indicators via `swingRangeMathService.getMACD()`
- Long Range: RSI indicators via `longRangeMathService.getRSI()`
- Volume Data: SMA indicators via `volumeDataMathService.getSMA()`
- Order Statistics: Open orders, average cost, total coins, revenue data

The `getTradeInfo` function aggregates multiple data sources:

### Technical Analysis Status Endpoints

Four separate endpoints provide detailed technical analysis reports:

| Endpoint | Service | Indicator Type |
|----------|---------|----------------|
| `/crypto-wallet/status/short` | `shortRangeMathService` | EMA (Exponential Moving Average) |
| `/crypto-wallet/status/swing` | `swingRangeMathService` | MACD (Moving Average Convergence Divergence) |
| `/crypto-wallet/status/long` | `longRangeMathService` | RSI (Relative Strength Index) |
| `/crypto-wallet/status/volume` | `volumeDataMathService` | SMA (Simple Moving Average) |

Each endpoint follows the same pattern:
1. Accept `StatusRequest` with symbol parameter
2. Call corresponding service's report generation method
3. Return formatted technical analysis data

### Market Data Retrieval

**Endpoint:** `POST /crypto-wallet/candles/range`

Retrieves candlestick chart data for a specified time range and interval.

**Parameters:**
- `startDate` / `endDate`: Date range for data retrieval
- `interval`: Binance API interval type
- `symbol`: Trading pair symbol

**Implementation:**
- Uses `dayjs` for date parsing and conversion
- Calls `binanceService.getChartCandles()` with date range and interval
- Returns raw candlestick data from Binance API

## Order History and Reporting Endpoints

These endpoints provide access to closed orders, hidden orders, and generate various types of reports.

![Mermaid Diagram](./diagrams\17_API_Endpoints_2.svg)

### Order Close Management

**Revert Closed Order:** `POST /crypto-wallet/order_close/revert/:id`

Reopens a previously closed order by:
1. Validating the close record is not already ignored
2. Verifying the original order is currently ignored
3. Setting original order `ignore: false` and clearing `orderCloseId`
4. Setting close record `ignore: true`

This implements a two-phase reversal operation ensuring data consistency.

### Report Generation

**Order Report:** `POST /crypto-wallet/report/order/one/:id`

Generates a markdown-formatted report for a single order using `OrderOpenDbService.generateOrderReport()`.

**Order History Report:** `POST /crypto-wallet/report/history`

Generates a comprehensive markdown table of order history for a symbol using `OrderOpenDbService.generateOrderHistoryReport()`.

The report generation methods in `OrderOpenDbService` demonstrate markdown formatting:

## Error Handling and Logging

All endpoints implement consistent error handling with:
- Try-catch blocks around business logic
- Structured logging via `pinolog` logger
- Performance timing with `console.time()`/`console.timeEnd()`
- Standardized error response format

**Error Response Pattern:**
```json
{
  "status": "error",
  "error": "Error message string",
  "requestId": "original-request-id",
  "serviceName": "original-service-name"
}
```

The error handling uses `functools-kit` utilities for error processing:
- `errorData()`: Extracts structured error information
- `getErrorMessage()`: Formats user-friendly error messages
