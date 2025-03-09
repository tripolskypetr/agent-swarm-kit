# DocService

Service for generating documentation for swarms and agents.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### perfService

```ts
perfService: any
```

### swarmValidationService

```ts
swarmValidationService: any
```

### agentValidationService

```ts
agentValidationService: any
```

### swarmSchemaService

```ts
swarmSchemaService: any
```

### agentSchemaService

```ts
agentSchemaService: any
```

### policySchemaService

```ts
policySchemaService: any
```

### toolSchemaService

```ts
toolSchemaService: any
```

### storageSchemaService

```ts
storageSchemaService: any
```

### stateSchemaService

```ts
stateSchemaService: any
```

### agentMetaService

```ts
agentMetaService: any
```

### swarmMetaService

```ts
swarmMetaService: any
```

### writeSwarmDoc

```ts
writeSwarmDoc: any
```

Writes documentation for a swarm schema.

### writeAgentDoc

```ts
writeAgentDoc: any
```

Writes documentation for an agent schema.

### dumpDocs

```ts
dumpDocs: (dirName?: string) => Promise<void>
```

Dumps the documentation for all swarms and agents.

### dumpPerfomance

```ts
dumpPerfomance: (dirName?: string) => Promise<void>
```

Dumps the performance data to a file.

### dumpClientPerfomance

```ts
dumpClientPerfomance: (clientId: string, dirName?: string) => Promise<void>
```

Dumps the client performance data to a file.
