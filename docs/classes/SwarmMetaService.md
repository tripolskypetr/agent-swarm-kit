# SwarmMetaService

Service for handling swarm metadata.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### swarmSchemaService

```ts
swarmSchemaService: any
```

### agentMetaService

```ts
agentMetaService: any
```

### serialize

```ts
serialize: any
```

### makeSwarmNode

```ts
makeSwarmNode: (swarmName: string) => IMetaNode
```

Creates a swarm node with the given swarm name.

### toUML

```ts
toUML: (swarmName: string) => string
```

Converts the swarm metadata to UML format.
