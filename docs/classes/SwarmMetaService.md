---
title: docs/api-reference/class/SwarmMetaService
group: docs
---

# SwarmMetaService

Service class for managing swarm metadata and converting it to UML format in the swarm system.
Builds IMetaNode trees from swarm schemas (via SwarmSchemaService) and serializes them to UML for visualization, integrating with DocService (e.g., writeSwarmDoc UML diagrams).
Leverages LoggerService for info-level logging (controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO), AgentMetaService for agent node creation, and supports ClientAgent (e.g., swarm-agent relationships) and PerfService (e.g., computeClientState context).
Provides methods to create swarm nodes and generate UML strings, enhancing system documentation and debugging.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance, injected via DI, for logging swarm metadata operations.
Used in makeSwarmNode and toUML when GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true, consistent with DocService and AgentMetaService logging patterns.

### swarmSchemaService

```ts
swarmSchemaService: any
```

Swarm schema service instance, injected via DI, for retrieving swarm schema data (e.g., defaultAgent).
Used in makeSwarmNode to build meta nodes, aligning with ClientAgent’s swarm definitions and DocService’s swarm documentation.

### agentMetaService

```ts
agentMetaService: any
```

Agent meta service instance, injected via DI, for creating agent meta nodes within swarm trees.
Used in makeSwarmNode to include the default agent, linking to ClientAgent’s agent metadata and DocService’s agent UML generation.

### serialize

```ts
serialize: any
```

Serialization function created by createSerialize from AgentMetaService, used to convert IMetaNode trees to UML format.
Employed in toUML to generate strings for DocService’s UML diagrams (e.g., swarm_schema_[swarmName].svg), ensuring consistency with AgentMetaService.

### makeSwarmNode

```ts
makeSwarmNode: (swarmName: string) => IMetaNode
```

Creates a meta node for the given swarm, including its default agent as a child node.
Builds a tree using SwarmSchemaService for swarm data and AgentMetaService for the default agent node, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Supports ClientAgent (e.g., swarm-agent linkage) and DocService (e.g., swarm UML in writeSwarmDoc), used in toUML for visualization.

### toUML

```ts
toUML: (swarmName: string) => string
```

Converts the swarm metadata to UML format for visualization.
Uses makeSwarmNode to build the tree and serialize to generate the UML string, logging via LoggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is true.
Called by DocService (e.g., writeSwarmDoc) to produce UML diagrams (e.g., swarm_schema_[swarmName].svg), enhancing swarm visualization.
