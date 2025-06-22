---
title: example/02_signal_generation_and_validation
group: example
---

# Signal Generation and Validation

This document covers the signal generation and validation system, which is responsible for determining when to create new trading signals and when to close existing ones. The system implements automated validation rules based on technical analysis indicators, price movements, and timing constraints to ensure safe and profitable trading decisions.

For information about signal execution and management after validation, see [Signal Logic and Management](./11_Signal_Logic_and_Management.md). For details on the automated job processing that triggers signal validation, see [Automated Job Processing](./12_Automated_Job_Processing.md).

## Purpose and Scope

The signal validation system acts as the decision-making engine that determines whether trading signals should be executed or resolved. It analyzes market conditions, existing positions, and technical indicators to make data-driven trading decisions while implementing risk management rules to prevent losses.

## Signal Data Structure

The system works with standardized signal data structures that define the properties and state of trading signals:

| Property | Type | Description |
|----------|------|-------------|
| `symbol` | string | Trading pair (e.g., "BTCUSDT") |
| `quantity` | number | Amount to trade |
| `buyPrice` | number | Entry price for the position |
| `sellPrice` | number | Target exit price |
| `stopLossPrice` | number | Stop loss price (optional) |
| `possibilityPercent` | number | Confidence percentage (optional) |
| `resolved` | boolean | Whether signal is closed |
| `ignore` | boolean | Whether to ignore this signal |
| `date` | Date | Signal creation timestamp |
| `comment` | string | Additional information |

## Signal Validation Logic

### Execute Validation

The `validateExecute` method determines whether a new trading signal should be created. It implements multiple validation layers:

![Mermaid Diagram](./diagrams\10_Signal_Generation_and_Validation_1.svg)

The validation process includes:

1. **Time-based constraints**: Prevents rapid signal generation by enforcing waiting periods based on price movement direction
2. **Technical analysis validation**: Uses EMA signals to confirm market conditions favor buying
3. **Price range conflicts**: Ensures new signals don't interfere with existing active positions

### EMA Signal Analysis

The system analyzes EMA (Exponential Moving Average) signals to determine market sentiment:

![Mermaid Diagram](./diagrams\10_Signal_Generation_and_Validation_2.svg)

The `validateShouldExecute` function implements these rules:
- Requires at least 1 strong BUY signal OR 1 medium BUY + 2 additional signals
- Calculates weighted strength scores for BUY vs SELL signals
- Only executes when BUY strength exceeds SELL strength

### Resolve Validation

The `validateResolve` method determines when to close existing positions:

![Mermaid Diagram](./diagrams\10_Signal_Generation_and_Validation_3.svg)

The resolution logic:
- Calculates current revenue based on market price vs entry price
- Compares against minimum required revenue (based on `CC_LADDER_TRADE_REVENUE`)
- Only resolves signals that have reached profitability targets

## Configuration Parameters

The validation system uses several configuration parameters to control trading behavior:

| Parameter | Purpose | Effect |
|-----------|---------|--------|
| `CC_LADDER_FAIL_HOURS` | Price fall timeout | Prevents rapid reentry after price drops |
| `CC_LADDER_GROWTH_HOURS` | Price growth timeout | Prevents rapid reentry after price rises |
| `CC_LADDER_STEP_PERCENT` | Price range buffer | Prevents overlapping signal ranges |
| `CC_LADDER_TRADE_REVENUE` | Minimum profit threshold | Defines when to close profitable positions |

These parameters implement a "ladder" trading strategy that spaces out entries and ensures minimum profit margins.

## Integration Points

The validation system integrates with several other components:

- **Technical Analysis Services**: Uses `ShortRangeMathService` for EMA signal analysis
- **Market Data**: Integrates with `BinanceService` for real-time price and exchange information
- **Signal Database**: Stores and retrieves signal data through `SignalDbService`
- **Price Formatting**: Uses `roundTicks` utility for proper price precision

This system forms the core decision-making engine that determines when and how trading signals are executed and resolved within the broader trading platform.
