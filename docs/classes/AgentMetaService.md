---
title: docs/api-reference/class/AgentMetaService
group: docs
---

# AgentMetaService

Service class for managing agent metadata and converting it to UML format in the swarm system.
Builds IMetaNode trees from agent schemas (via AgentSchemaService) and serializes them to UML for visualization, integrating with DocService (e.g., writeAgentDoc UML diagrams).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO) and supports ClientAgent (e.g., agent metadata) and PerfService (e.g., computeClientState context).
Provides methods to create detailed or common agent nodes and generate UML strings, enhancing system documentation and debugging.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging meta node operations.
Used in makeAgentNode, makeAgentNodeCommon, and toUML when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and PerfService logging.

### agentSchemaService

```ts
agentSchemaService: any
```

Agent schema service instance, injected via DI, for retrieving agent schema data (e.g., dependsOn, states).
Used in makeAgentNode and makeAgentNodeCommon to build meta nodes, aligning with ClientAgent’s agent definitions and DocService’s agent documentation.

### serialize

```ts
serialize: any
```

Serialization function created by createSerialize, used to convert IMetaNode trees to UML format.
Employed in toUML to generate strings for DocService’s UML diagrams (e.g., agent_schema_[agentName].svg).

### makeAgentNode

```ts
makeAgentNode: (agentName: string, seen?: Set<string>) => IMetaNode
```

Creates a detailed meta node for the given agent, including dependencies, states, storages, and tools.
Recursively builds a tree with seen set to prevent cycles, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used in toUML for full agent visualization.
Integrates with ClientAgent (e.g., agent metadata) and DocService (e.g., detailed agent UML in writeAgentDoc).

### makeAgentNodeCommon

```ts
makeAgentNodeCommon: (agentName: string, seen?: Set<string>) => IMetaNode
```

Creates a common meta node for the given agent, focusing on dependency relationships.
Recursively builds a tree with seen set to prevent cycles, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, used as a helper in makeAgentNode.
Supports ClientAgent (e.g., dependency tracking) and PerfService (e.g., computeClientState agent context).

### toUML

```ts
toUML: (agentName: string, withSubtree?: boolean) => string
```

Converts the meta nodes of the given agent to UML format, optionally including a full subtree.
Uses makeAgentNode to build the tree and serialize to generate the UML string, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Called by DocService (e.g., writeAgentDoc) to produce UML diagrams (e.g., agent_schema_[agentName].svg), enhancing agent visualization.
