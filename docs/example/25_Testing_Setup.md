---
title: example/25_testing_setup
group: example
---

# Testing Setup

This document covers the test environment configuration and mocking infrastructure used in the signals repository. The testing setup provides mechanisms to override production services, disable persistence layers, and configure in-memory adapters for the agent-swarm-kit framework.

For information about the overall build process, see [Build Process](./23_Build_Process.md). For Docker-based testing environments, see [Docker Configuration](./24_Docker_Configuration.md).

## Overview

The testing infrastructure is designed around two key configuration files that establish a controlled testing environment by:

- Disabling persistent storage mechanisms
- Mocking external service dependencies  
- Overriding license validation services
- Configuring in-memory adapters for agent communication

## Test Configuration Architecture

The test setup follows a two-stage initialization process where overrides are applied before the main system initializes, ensuring that test-specific configurations take precedence over production settings.

### Test Setup Flow

![Mermaid Diagram](./diagrams\25_Testing_Setup_0.svg)

### Configuration Stages

| Stage | Purpose | File | Key Actions |
|-------|---------|------|-------------|
| Override | Service Mocking | `override.ts` | License service override |
| Setup | Environment Config | `setup.ts` | Agent framework configuration |
| Import | Module Loading | `setup.ts` | Main signals module import |
| Adaptation | Storage Mocking | `setup.ts` | Persistence adapter setup |

## Service Overrides and Dependency Injection

The testing framework uses the `di-kit` library's `beforeInit` mechanism to override specific services before the dependency injection container initializes them.

### Override Mechanism

![Mermaid Diagram](./diagrams\25_Testing_Setup_1.svg)

The `licenseService` is overridden to always return `true` from its `validate()` method, bypassing any license validation requirements during testing:

```typescript
override(Symbol.for("licenseService"), {
  async validate() {
    return true;
  }
})
```

## Agent-Swarm-Kit Test Configuration

The `setup.ts` file configures the agent-swarm-kit framework for testing by disabling various persistence and storage mechanisms that would interfere with test execution.

### Configuration Settings

| Setting | Production Value | Test Value | Purpose |
|---------|------------------|------------|---------|
| `CC_PERSIST_ENABLED_BY_DEFAULT` | `true` | `false` | Disable automatic persistence |
| `CC_PERSIST_MEMORY_STORAGE` | `true` | `false` | Disable memory storage persistence |
| `CC_PERSIST_EMBEDDING_CACHE` | `true` | `false` | Disable embedding cache persistence |
| `CC_STORAGE_DISABLE_GET_DATA` | `false` | `true` | Disable data retrieval operations |

### Agent Framework Configuration Flow

![Mermaid Diagram](./diagrams\25_Testing_Setup_2.svg)

## Persistence Layer Mocking

The test configuration provides mock implementations for the persistence layer to prevent actual data storage during test execution.

### Embedding Persistence Mock

The `PersistEmbedding` adapter is replaced with a mock that:

- Always returns `false` for `hasValue()` checks
- Throws an error when `readValue()` is called
- Performs no operation for `writeValue()` calls

```typescript
PersistEmbedding.usePersistEmbeddingAdapter(
  class extends PersistBase {
    async waitForInit() {}
    async readValue(): Promise<any> {
      throw new Error("Unimplemented method");
    }
    async hasValue() {
      return false;
    }
    async writeValue() {}
  }
);
```

### History Adapter Configuration

The `History` service uses the `HistoryMemoryInstance` adapter, which provides in-memory storage for conversation history without persistence to external storage systems.

## Test Environment Isolation  

The testing setup ensures complete isolation from production systems by:

1. **Storage Isolation**: All persistence operations are disabled or mocked
2. **Service Isolation**: Critical services like license validation are overridden
3. **Memory Management**: In-memory adapters prevent external data leakage
4. **Configuration Isolation**: Test-specific configuration values override production defaults

This isolation guarantees that tests run in a controlled environment without affecting production data or requiring external service dependencies.
