# Swarm Management

This document covers the swarm management system in agent-swarm-kit, which orchestrates multiple agents, manages navigation between agents, and coordinates multi-agent workflows. Swarms serve as the primary orchestration layer that routes messages to the appropriate agents and maintains conversation state across agent transitions.

For information about individual agent execution and tool calling, see [Client Agent](#2.1). For session-level coordination and client isolation, see [Session Management](#2.3).

## Core Swarm Architecture

A swarm is a collection of agents organized under a single orchestration unit that manages agent selection, navigation, and message routing. The `ClientSwarm` class implements the core swarm functionality, providing a unified interface for multi-agent coordination.

### Swarm Component Structure

![Mermaid Diagram](./diagrams\5_Swarm_Management_0.svg)

**Sources:** [src/client/ClientSwarm.ts:289-600](), [src/lib/services/connection/SwarmConnectionService.ts:23-150](), [src/interfaces/Swarm.interface.ts:66-200]()

### Swarm Schema and Configuration

Swarms are defined using the `ISwarmSchema` interface, which specifies the agent collection, default agent, and behavioral configuration:

![Mermaid Diagram](./diagrams\5_Swarm_Management_1.svg)

**Sources:** [src/interfaces/Swarm.interface.ts:65-120](), [src/client/ClientSwarm.ts:25-50]()

## Agent Navigation and Routing

The swarm manages navigation between agents through a navigation stack and active agent tracking. This allows for complex conversation flows where different agents handle different aspects of a conversation.

### Navigation Stack Management

![Mermaid Diagram](./diagrams\5_Swarm_Management_2.svg)

**Sources:** [src/client/ClientSwarm.ts:350-450](), [src/config/params.ts:45-70]()

### Agent Resolution and Error Handling

The swarm uses a `NoopAgent` fallback mechanism when requested agents are not found in the swarm configuration:

![Mermaid Diagram](./diagrams\5_Swarm_Management_3.svg)

The `NoopAgent` class provides a safety mechanism that logs attempts to use non-existent agents while delegating operations to the default agent.

**Sources:** [src/client/ClientSwarm.ts:25-206](), [src/client/ClientSwarm.ts:558-620]()

## Active Agent Management

The swarm maintains an active agent that handles incoming messages and executes operations. Active agent management includes lazy initialization, memoization, and lifecycle tracking.

### Active Agent Resolution

![Mermaid Diagram](./diagrams\5_Swarm_Management_4.svg)

**Sources:** [src/client/ClientSwarm.ts:350-400](), [src/client/ClientSwarm.ts:25-206]()

## Message Flow and Output Handling

Swarms coordinate message flow between agents and manage output emission to external consumers through a subject-based event system.

### Message Execution Flow

![Mermaid Diagram](./diagrams\5_Swarm_Management_5.svg)

**Sources:** [src/client/ClientSwarm.ts:250-320](), [src/client/ClientSwarm.ts:400-500]()

### Output Subject Management

The `ClientSwarm` uses Subject patterns for asynchronous output handling and coordination:

![Mermaid Diagram](./diagrams\5_Swarm_Management_6.svg)

**Sources:** [src/client/ClientSwarm.ts:289-320](), [src/client/ClientSwarm.ts:216-279]()

## Integration with Service Layer

Swarms integrate with the service architecture through connection services, validation services, and schema services to provide a complete orchestration platform.

### Service Layer Integration

![Mermaid Diagram](./diagrams\5_Swarm_Management_7.svg)

**Sources:** [src/lib/services/public/SwarmPublicService.ts:1-100](), [src/lib/services/connection/SwarmConnectionService.ts:1-150](), [src/classes/Persist.ts:1-100]()

### Persistence and State Management

Swarms support persistence of navigation state and active agent information:

![Mermaid Diagram](./diagrams\5_Swarm_Management_8.svg)

**Sources:** [src/classes/Persist.ts:200-300](), [src/config/params.ts:45-70]()

## Configuration and Lifecycle

Swarms are configured through schema definitions and managed through service lifecycle patterns including initialization, memoization, and disposal.

### Swarm Lifecycle Management

![Mermaid Diagram](./diagrams\5_Swarm_Management_9.svg)

**Sources:** [src/functions/setup/addSwarm.ts:1-50](), [src/lib/services/connection/SwarmConnectionService.ts:100-200]()

### Validation and Error Recovery

Swarms include validation mechanisms for agent availability and navigation consistency:

![Mermaid Diagram](./diagrams\5_Swarm_Management_10.svg)

**Sources:** [src/client/ClientSwarm.ts:25-206](), [src/config/params.ts:17-285](), [src/interfaces/Swarm.interface.ts:65-200]()