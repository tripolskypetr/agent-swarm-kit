---
title: example/19_wallet_applications
group: example
---

# Wallet Application

## Purpose and Scope

The Wallet Application is a React-based frontend interface for cryptocurrency order management, revenue tracking, and trading operations within the signals platform. It provides users with tools to create, edit, close, and monitor trading positions across different cryptocurrency symbols.

This document covers the wallet application's architecture, routing, service layer, and user interface components. For information about the backend API endpoints that this application consumes, see [API Endpoints](./17_API_Endpoints.md). For details about the signal processing that drives trading decisions, see [Signal Processing Pipeline](./09_Signal_Processing_Pipeline.md).

## Application Architecture

The wallet application follows a modular React architecture with dependency injection, routing management, and a comprehensive service layer for API communication.

![Mermaid Diagram](./diagrams\19_Wallet_Application_0.svg)

## Routing System

The application uses a declarative routing system with four main routes and automatic redirects.

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Redirect | Automatically redirects to `/main` |
| `/main` | `MainView` | Primary dashboard for order management |
| `/revenue/:symbol` | `RevenueView` | Revenue analytics for specific symbols |
| `/order_closed/:symbol` | `OrderCloseView` | Closed order details and management |
| `/error_page` | `ErrorView` | Error handling and recovery |

The routing configuration uses `ISwitchItem[]` from react-declarative and integrates with the IoC container's `routerService` for navigation management.

![Mermaid Diagram](./diagrams\19_Wallet_Application_1.svg)

## Service Layer and API Integration

The wallet application implements a comprehensive service layer that handles all API communications with the backend crypto-wallet endpoints. All services use bearer token authentication and follow a consistent request pattern.

### Core Services

![Mermaid Diagram](./diagrams\19_Wallet_Application_2.svg)

### Key Service Operations

| Service | Key Methods | API Endpoints |
|---------|-------------|---------------|
| `ActionViewService` | `commitCreate`, `commitEdit`, `commitRemove`, `commitClose` | `/crypto-wallet/order/*`, `/crypto-wallet/action/commit_close` |
| `RevenueViewService` | `getLastClosePrice`, `getLongRangeStatus`, `getShortRangeStatus`, `getSwingRangeStatus`, `getVolumeDataStatus` | `/crypto-wallet/status/*` |
| `OrderCloseViewService` | `paginate`, `findOne`, `revertCancellation` | `/crypto-wallet/order_close/*` |
| `ReportViewService` | `getOrderReport`, `getHistoryReport` | `/crypto-wallet/report/*` |

## User Interface Components

### OrderGridWidget

The `OrderGridWidget` is the primary interface component for order management, providing a comprehensive grid with CRUD operations, real-time price updates, and administrative controls.

#### Grid Configuration

The widget displays orders with the following column structure:

- **Color indicator**: Visual color coding using `colorHelperService.getColorByIndex()`
- **Index number**: Sequential numbering of orders
- **Price**: Formatted price display with `formatAmount()`
- **Quantity**: Quantity with 6-decimal precision
- **Date**: Date/time formatting using dayjs

#### Available Actions

![Mermaid Diagram](./diagrams\19_Wallet_Application_3.svg)

All administrative actions require password verification using the constant `ADMIN_PASS = "88888888"`.

### Error Handling

The application implements comprehensive error handling with a dedicated `ErrorView` component that handles both application errors and offline states.

## Order Management Workflow

The wallet application supports a complete order lifecycle management system with the following workflow:

![Mermaid Diagram](./diagrams\19_Wallet_Application_4.svg)

### Order Data Structure

Each order contains the following key properties managed through the `OpenOrder` model:

- `id`: Unique order identifier
- `coin`: Cryptocurrency symbol
- `price`: Purchase price
- `quantity`: Order quantity  
- `date`: Order creation timestamp
- `comment`: Order description/notes
