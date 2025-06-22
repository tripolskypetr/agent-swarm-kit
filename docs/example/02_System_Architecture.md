---
title: example/02_system_architecture
group: example
---

# System Architecture

This document provides a high-level overview of the cryptocurrency trading signals platform's core architectural components, dependency injection system, and how the major subsystems interact to deliver AI-powered trading insights and automated signal processing.

For detailed information about the AI agent swarm system, see [AI Agent Swarm System](./05_AI_Agent_Swarm_System.md). For specific web service implementations and external integrations, see [Web Services and External Integrations](./14_Web_Services_and_External_Integrations.md). For frontend application architecture, see [Frontend Applications](./18_Frontend_Applications.md).

## Core System Overview

The platform follows a service-oriented architecture built around a custom IoC (Inversion of Control) container that manages dependency injection across all system components. The architecture separates concerns into distinct service layers, each responsible for specific business functions.

![Mermaid Diagram](./diagrams\2_System_Architecture_0.svg)

## Dependency Injection Architecture

The system uses a custom dependency injection framework centered around the `TYPES` symbol registry and service provider pattern. All services are registered during application bootstrap and resolved through the IoC container.

![Mermaid Diagram](./diagrams\2_System_Architecture_1.svg)

## Service Layer Organization

Services are organized into logical categories, each handling specific aspects of the trading platform's functionality. This modular approach enables clear separation of concerns and testability.

| Service Category | Purpose | Key Services |
|------------------|---------|--------------|
| **Base Services** | Core infrastructure and utilities | `BootstrapService`, `ErrorService`, `MongooseService`, `RedisService` |
| **API Services** | External API communication | `MastodonApiService`, `TelegramApiService` |
| **Math Services** | Technical analysis calculations | `LongRangeMathService`, `SwingRangeMathService`, `ShortRangeMathService` |
| **Database Services** | Data persistence and retrieval | `SignalDbService`, `OrderOpenDbService`, `OrderCloseDbService` |
| **Web Services** | HTTP integrations and webhooks | `MastodonWebService`, `TelegramWebService` |
| **Logic Services** | Business rule processing | `SignalLogicService`, `SignalValidationService` |
| **Job Services** | Automated background processing | `SignalJobService` |
| **Report Services** | Data analysis and reporting | `SignalReportService`, `BalanceReportService`, `HumanReportService` |

## Configuration Management

The system uses environment-based configuration with fallback defaults, centralized in the params module. Configuration covers database connections, external API credentials, trading parameters, and application feature flags.

![Mermaid Diagram](./diagrams\2_System_Architecture_2.svg)

## Service Integration Patterns

The architecture implements several key patterns for service integration and data flow. Services communicate through well-defined interfaces and dependency injection, enabling loose coupling and testability.

![Mermaid Diagram](./diagrams\2_System_Architecture_3.svg)

## Automated Processing Architecture

The system includes automated job processing capabilities that run signal analysis and execution logic on configurable intervals. The `SignalJobService` orchestrates the automated trading workflow.

![Mermaid Diagram](./diagrams\2_System_Architecture_4.svg)

## Data Model Integration

The system defines clear data transfer objects (DTOs) and database models for all major entities. The architecture supports both transactional data (orders, signals) and analytical data (reports, metrics).

| Entity Type | DTO Interface | Database Service | Purpose |
|-------------|---------------|------------------|---------|
| **Trading Signals** | `ISignalDto` | `SignalDbService` | Buy/sell signal management |
| **Open Orders** | `IOrderOpenDto` | `OrderOpenDbService` | Active trade positions |
| **Closed Orders** | `IOrderCloseDto` | `OrderCloseDbService` | Completed trades |
| **Information** | `IInfoDto` | `InfoDbService` | System events and logs |
| **Reports** | `IReportDto` | `ReportDbService` | Analysis and insights |
