---
title: docs/api-reference/class/DocService
group: docs
---

# DocService

Service class for generating and writing documentation for swarms, agents, and performance data in the swarm system.
Produces Markdown files for swarm (ISwarmSchema) and agent (IAgentSchema) schemas, including UML diagrams via CC_FN_PLANTUML, and JSON files for performance metrics via PerfService.
Integrates indirectly with ClientAgent by documenting its schema (e.g., tools, prompts) and performance (e.g., via PerfService), using LoggerService for logging gated by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO.
Manages concurrent tasks with a thread pool (THREAD_POOL_SIZE) and organizes output in a directory structure (SUBDIR_LIST), enhancing developer understanding of the system.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

Logger service instance for logging documentation generation activities, injected via dependency injection.
Controlled by GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO, used in methods like dumpDocs, writeSwarmDoc, and writeAgentDoc for info-level logging.

### perfService

```ts
perfService: any
```

Performance service instance for retrieving system and client performance data, injected via DI.
Used in dumpPerfomance and dumpClientPerfomance to serialize IPerformanceRecord and IClientPerfomanceRecord data into JSON files.

### swarmValidationService

```ts
swarmValidationService: any
```

Swarm validation service instance, injected via DI.
Provides the list of swarm names for dumpDocs, ensuring only valid swarms are documented.

### agentValidationService

```ts
agentValidationService: any
```

Agent validation service instance, injected via DI.
Provides the list of agent names for dumpDocs, ensuring only valid agents are documented.

### swarmSchemaService

```ts
swarmSchemaService: any
```

Swarm schema service instance, injected via DI.
Retrieves ISwarmSchema objects for writeSwarmDoc, supplying swarm details like agents and policies.

### agentSchemaService

```ts
agentSchemaService: any
```

Agent schema service instance, injected via DI.
Retrieves IAgentSchema objects for writeAgentDoc and agent descriptions in writeSwarmDoc, providing details like tools and prompts.

### mcpSchemaService

```ts
mcpSchemaService: any
```

Model context protocol service instance, injected via DI.
Retrieves IMCPSchema objects for writeAgentDoc and agent descriptions in writeSwarmDoc, providing details like tools and prompts.

### policySchemaService

```ts
policySchemaService: any
```

Policy schema service instance, injected via DI.
Supplies policy descriptions for writeSwarmDoc, documenting banhammer policies associated with swarms.

### toolSchemaService

```ts
toolSchemaService: any
```

Tool schema service instance, injected via DI.
Provides tool details (e.g., function, callbacks) for writeAgentDoc, documenting tools used by agents (e.g., ClientAgent tools).

### storageSchemaService

```ts
storageSchemaService: any
```

Storage schema service instance, injected via DI.
Supplies storage details for writeAgentDoc, documenting storage resources used by agents.

### wikiSchemaService

```ts
wikiSchemaService: any
```

Wiki schema service instance, injected via DI.
Supplies wiki details for writeAgentDoc, documenting wiki resources used by agents.

### stateSchemaService

```ts
stateSchemaService: any
```

State schema service instance, injected via DI.
Provides state details for writeAgentDoc, documenting state resources used by agents.

### agentMetaService

```ts
agentMetaService: any
```

Agent meta service instance, injected via DI.
Generates UML diagrams for agents in writeAgentDoc, enhancing documentation with visual schema representations.

### swarmMetaService

```ts
swarmMetaService: any
```

Swarm meta service instance, injected via DI.
Generates UML diagrams for swarms in writeSwarmDoc, enhancing documentation with visual schema representations.

### writeSwarmDoc

```ts
writeSwarmDoc: any
```

Writes Markdown documentation for a swarm schema, detailing its name, description, UML diagram, agents, policies, and callbacks.
Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
Outputs to dirName/[swarmName].md, with UML images in dirName/image, and links to agent docs in dirName/agent, sourced from swarmSchemaService.

### writeAgentDoc

```ts
writeAgentDoc: any
```

Writes Markdown documentation for an agent schema, detailing its name, description, UML diagram, prompts, tools, storages, states, and callbacks.
Executes in a thread pool (THREAD_POOL_SIZE) to manage concurrency, logging via loggerService if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
Outputs to dirName/agent/[agentName].md, with UML images in dirName/image, sourced from agentSchemaService and related services (e.g., toolSchemaService).

### dumpDocs

```ts
dumpDocs: (prefix?: string, dirName?: string) => Promise<void>
```

Generates and writes documentation for all swarms and agents in the system.
Creates subdirectories (SUBDIR_LIST), then concurrently writes swarm and agent docs using writeSwarmDoc and writeAgentDoc, logging progress if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
Outputs to a directory structure rooted at dirName (default: "docs/chat"), integrating with ClientAgent by documenting its schema.

### dumpPerfomance

```ts
dumpPerfomance: (dirName?: string) => Promise<void>
```

Dumps system-wide performance data to a JSON file using PerfService.toRecord.
Ensures the output directory exists, then writes a timestamped file, logging the process if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
Outputs to dirName/[momentStamp].[timeStamp].json (default: "logs/meta"), providing a snapshot of system performance (e.g., tied to ClientAgent executions).

### dumpClientPerfomance

```ts
dumpClientPerfomance: (clientId: string, dirName?: string) => Promise<void>
```

Dumps performance data for a specific client to a JSON file using PerfService.toClientRecord.
Ensures the output directory exists, then writes a client-specific timestamped file, logging the process if GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO is enabled.
Outputs to dirName/[clientId].[momentStamp].json (default: "logs/client"), documenting client-specific metrics (e.g., ClientAgent session performance).
