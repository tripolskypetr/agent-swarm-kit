# Navigation System

The Navigation System provides agent switching and routing capabilities within the agent-swarm-kit framework. It enables dynamic transitions between agents in a swarm, maintains navigation history, and integrates with tool execution to facilitate complex multi-agent workflows.

This document covers agent navigation functions, navigation templates for tool creation, and the integration points with swarm management and session handling. For information about swarm orchestration and agent lifecycle, see [Swarm Management](#2.2). For session coordination and resource tracking, see [Session Management](#2.3).

## Core Navigation Functions

The navigation system provides three primary functions for agent transitions, each handling different navigation scenarios with validation, queuing, and resource management.

### Agent Switching Functions

| Function | Purpose | Usage Pattern |
|----------|---------|---------------|
| `changeToAgent` | Switch to specific agent | Direct navigation with agent name |
| `changeToDefaultAgent` | Switch to swarm's default agent | Return to triage/main agent |
| `changeToPrevAgent` | Switch to previous agent in stack | Navigate back in history |

![Mermaid Diagram](./diagrams\10_Navigation_System_0.svg)

**Sources:** [src/functions/navigate/changeToAgent.ts:124-187](), [src/functions/navigate/changeToDefaultAgent.ts:124-160](), [src/functions/navigate/changeToPrevAgent.ts:124-164]()

### Navigation Implementation Pattern

All navigation functions follow a consistent implementation pattern with memoized, queued execution to prevent race conditions and ensure proper resource cleanup.

![Mermaid Diagram](./diagrams\10_Navigation_System_1.svg)

**Sources:** [src/functions/navigate/changeToAgent.ts:35-105](), [src/functions/navigate/changeToDefaultAgent.ts:35-105](), [src/functions/navigate/changeToPrevAgent.ts:35-105]()

## Navigation Templates

The template system provides factory functions for creating navigation handlers with customizable behavior, tool output, and execution patterns.

### Navigation Template Architecture

![Mermaid Diagram](./diagrams\10_Navigation_System_2.svg)

**Sources:** [src/template/createNavigateToAgent.ts:153-262](), [src/template/createNavigateToTriageAgent.ts:118-192]()

### Template Configuration Options

The navigation templates support extensive configuration for different use cases:

| Parameter | Type | Purpose |
|-----------|------|---------|
| `beforeNavigate` | Callback | Pre-navigation hook |
| `lastMessage` | Function/String | Message formatter for context |
| `toolOutput` | Function/String | Tool response content |
| `executeMessage` | Function/String | Execution message content |
| `emitMessage` | Function/String | Emission message content |
| `flushMessage` | Function/String | Fallback flush message |

**Sources:** [src/template/createNavigateToAgent.ts:48-83](), [src/template/createNavigateToTriageAgent.ts:48-73]()

## Navigation Tools and Aliases

The alias system provides convenient functions for creating navigation tools that can be added to agents, enabling tool-based navigation triggers.

### Navigation Tool Creation

![Mermaid Diagram](./diagrams\10_Navigation_System_3.svg)

**Sources:** [src/functions/alias/addAgentNavigation.ts:37-74](), [src/functions/alias/addTriageNavigation.ts:35-71]()

### Tool Registration and Schema

Navigation tools are registered in both the tool schema service and navigation schema service:

![Mermaid Diagram](./diagrams\10_Navigation_System_4.svg)

**Sources:** [src/functions/alias/addAgentNavigation.ts:49-73](), [src/functions/alias/addTriageNavigation.ts:46-70]()

## Integration with System Components

The navigation system integrates deeply with other framework components, providing navigation capabilities across different execution contexts.

### Pipeline Integration

Navigation integrates with pipeline execution through agent switching during pipeline runs:

![Mermaid Diagram](./diagrams\10_Navigation_System_5.svg)

**Sources:** [src/functions/target/startPipeline.ts:40-75]()

### Chat System Integration

The chat system maintains agent context through navigation:

![Mermaid Diagram](./diagrams\10_Navigation_System_6.svg)

**Sources:** [src/classes/Chat.ts:179-233]()

### History Management Integration

Navigation triggers history lifecycle events, ensuring proper cleanup and initialization:

![Mermaid Diagram](./diagrams\10_Navigation_System_7.svg)

**Sources:** [src/lib/services/connection/HistoryConnectionService.ts:78-92](), [src/functions/navigate/changeToAgent.ts:67-94]()

## Navigation State and Validation

The navigation system includes validation mechanisms to prevent circular navigation and ensure proper agent transitions.

### Navigation Validation Flow

![Mermaid Diagram](./diagrams\10_Navigation_System_8.svg)

**Sources:** [src/functions/navigate/changeToAgent.ts:136-162](), [src/functions/navigate/changeToAgent.ts:44-53]()

### Resource Management and Cleanup

Navigation ensures proper resource cleanup through garbage collection and dispose patterns:

![Mermaid Diagram](./diagrams\10_Navigation_System_9.svg)

**Sources:** [src/functions/navigate/changeToAgent.ts:115-119](), [src/config/emitters.ts:1-4]()