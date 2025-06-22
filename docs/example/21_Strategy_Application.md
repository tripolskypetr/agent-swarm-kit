---
title: example/21_strategy_application
group: example
---

# Strategy Application

## Purpose and Scope

The Strategy Application is a React-based financial planning tool that provides cryptocurrency trading strategy analysis and calculation capabilities. It implements a ladder-based dollar-cost averaging (DCA) strategy calculator that helps users plan their cryptocurrency investments by modeling worst-case scenarios and calculating key financial metrics.

The application is designed as a multi-step wizard interface that guides users through price input, investment parameters configuration, and comprehensive report generation. For general information about frontend applications, see [Frontend Applications](./18_Frontend_Applications.md). For wallet management and order tracking functionality, see [Wallet Application](./19_Wallet_Application.md).

## Application Architecture

The Strategy Application follows a wizard-based architecture built with React and Material-UI components, utilizing the `react-declarative` framework for form management and navigation.

### Wizard Steps Configuration

The application defines three main wizard steps with corresponding routes:

| Step ID | Label | Component | Purpose |
|---------|-------|-----------|---------|
| `price` | Цена | `PriceView` | Cryptocurrency price input |
| `amount` | Шаг | `AmountView` | Investment parameters |
| `report` | Отчет | `ReportView` | Strategy analysis report |

## Wizard Interface Flow

The application implements a three-step wizard interface that guides users through the strategy calculation process:

### Wizard Flow Diagram

![Mermaid Diagram](./diagrams\21_Strategy_Application_1.svg)

### Price Input Step

The `PriceView` component handles cryptocurrency selection and price configuration. It supports five major cryptocurrencies with pre-configured default values and descriptions:

- **BTCUSDT**: Bitcoin with default price $100,000.00
- **ETHUSDT**: Ethereum with default price $4,000.00  
- **BNBUSDT**: BNB with default price $600.00
- **XRPUSDT**: XRP with default price $0.50
- **SOLUSDT**: Solana with default price $150.00

The component dynamically displays relevant fields based on the selected cryptocurrency symbol and validates user input for price and investment amount.

## Strategy Calculation Engine

The core calculation logic is implemented in the `generateReport` function, which performs ladder-based dollar-cost averaging calculations with commission consideration.

### Calculation Process

![Mermaid Diagram](./diagrams\21_Strategy_Application_2.svg)

### Key Calculation Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `fiatAmount` | number | Total investment amount in USDT | - |
| `lastClosePrice` | number | Current cryptocurrency price | - |
| `ladderPercent` | number | Price decrease percentage per step | - |
| `orderPrice` | number | Amount invested per step | - |
| `priceGrowthRate` | number | Expected daily price growth | 1.5% |
| `commissionRate` | number | Trading commission rate | 0.2% |

### Validation Logic

The calculation engine implements comprehensive input validation:

```typescript
// Validation conditions from generateReport.ts:13-24
- fiatAmount > 0
- lastClosePrice > 0  
- 0 < ladderPercent < 100
- 0 < orderPrice <= fiatAmount
- priceGrowthRate > 0
- commissionRate >= 0
```

## Report Generation

The `generateReport` function produces comprehensive markdown reports with detailed financial analysis and projections.

### Report Structure

The generated report includes the following sections:

1. **Cryptocurrency Information** (`# Монета`)
   - Symbol and current price
   - Timestamp with timezone

2. **Key Metrics** (`# Метрики`)
   - Break-even price calculation
   - Stop price determination
   - Profit target price (20% return)
   - Commission rate information

3. **Worst-Case Scenario Table** (`# Наихудший сценарий`)
   - Step-by-step price ladder breakdown
   - Coins purchased at each level
   - Running totals and remaining funds
   - Commission costs per transaction

4. **Profitability Analysis** (`# Доходность в наихудшем сценарии`)
   - Expected time to reach profit target
   - Growth rate assumptions and disclaimers

### Report Calculation Formulas

The report generation implements several key financial calculations:

```typescript
// Key formulas from generateReport.ts
const breakEvenPrice = totalSpent / totalCoins;
const stopPrice = steps[steps.length - 1].price;
const targetProfit = fiatAmount * 0.2; // 20% profit target
const profitPrice = (totalSpent + targetProfit) / totalCoins;
const daysToProfit = Math.ceil(
  Math.log(profitPrice / stopPrice) / Math.log(dailyGrowthMultiplier)
);
```

## Backend Integration

The Strategy Application integrates with the backend API to fetch real-time cryptocurrency prices and supports report downloading functionality.

### API Integration Flow

![Mermaid Diagram](./diagrams\21_Strategy_Application_3.svg)

The application uses the `/price/close_price` endpoint to fetch current cryptocurrency prices, which are then used as default values in the price input form.

### Download Functionality

The `ReportView` component implements markdown report downloading through the `downloadSubject` subscription mechanism, allowing users to save their strategy analysis reports locally.
