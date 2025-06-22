---
title: example/12_automated_job_processing
group: example
---

# Automated Job Processing

This document covers the automated job processing system that continuously monitors and executes trading signals for supported cryptocurrency symbols. The `SignalJobService` orchestrates periodic signal validation, resolution, and execution tasks on a 15-second interval.

For information about the signal generation and validation logic itself, see [Signal Generation and Validation](./10_Signal_Generation_and_Validation.md). For details about how signals are processed and persisted after generation, see [Signal Logic and Management](./11_Signal_Logic_and_Management.md).

## Architecture Overview

The automated job processing system is built around the `SignalJobService` class, which coordinates with multiple service dependencies to perform continuous signal monitoring and execution.

### SignalJobService Architecture

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_0.svg)

## Job Configuration and Lifecycle

### Supported Trading Pairs

The job service processes a predefined list of cryptocurrency trading pairs on each execution cycle.

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_1.svg)

| Configuration | Value | Description |
|---------------|-------|-------------|
| `JOB_INTERVAL` | 15,000 ms | Execution interval between job cycles |
| `JOB_LIST` | 5 symbols | Supported cryptocurrency trading pairs |

### Initialization Guards

The job service includes multiple safety checks before starting automated processing:

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_2.svg)

## Signal Processing Workflow

Each job execution cycle processes two distinct types of signal operations for every supported trading pair.

### Dual-Phase Processing

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_3.svg)

### Signal Resolution Process

The first phase of processing handles closing existing signals when market conditions indicate resolution:

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_4.svg)

### Signal Execution Process

The second phase handles generating and executing new signals:

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_5.svg)

## Runtime Controls and Configuration

### Command Line Arguments

The job service respects command line arguments that control its execution behavior:

| Argument | Effect | Implementation |
|----------|---------|----------------|
| `--repl` | Disables job processing in REPL mode | `bootstrapService.isRepl` |
| `--noJob` | Completely disables automated jobs | `bootstrapService.isNoJob` |

### Environment Configuration

Job processing also depends on various environment configurations that affect its operation:

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_6.svg)

## Error Handling and Resilience

The job service implements comprehensive error handling to ensure continuous operation despite individual symbol processing failures.

### Per-Symbol Error Isolation

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_7.svg)

### Logging and Monitoring

The service provides extensive logging for monitoring and debugging:

| Log Type | Content | Purpose |
|----------|---------|---------|
| Initialization | `signalJobService run` | Service startup confirmation |
| Signal Resolution | Russian language status messages | Operational transparency |
| Signal Execution | Request and skip messages | Processing decision tracking |
| Error Handling | Symbol-specific failure logs | Debugging and monitoring |

## Integration with Application Lifecycle

The `SignalJobService` is automatically initialized during application startup through the dependency injection container and runs continuously until application shutdown.

### Application Bootstrap Integration

![Mermaid Diagram](./diagrams\12_Automated_Job_Processing_8.svg)
