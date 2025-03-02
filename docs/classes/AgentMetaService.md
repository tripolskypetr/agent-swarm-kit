# AgentMetaService

Service class for managing agent meta nodes and converting them to UML format.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### agentSchemaService

```ts
agentSchemaService: any
```

### serialize

```ts
serialize: any
```

### makeAgentNode

```ts
makeAgentNode: (agentName: string, seen?: Set<string>) => IMetaNode
```

Creates a meta node for the given agent.

### makeAgentNodeCommon

```ts
makeAgentNodeCommon: (agentName: string, seen?: Set<string>) => IMetaNode
```

Creates a meta node for the given agent.

### toUML

```ts
toUML: (agentName: string, withSubtree?: boolean) => string
```

Converts the meta nodes of the given agent to UML format.
