# SessionPublicService

Implements `TSessionConnectionService`

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### sessionConnectionService

```ts
sessionConnectionService: any
```

### execute

```ts
execute: (content: string, clientId: string, swarmName: string) => Promise<string>
```

### connect

```ts
connect: (connector: SendMessageFn, clientId: string, swarmName: string) => ReceiveMessageFn
```

### commitToolOutput

```ts
commitToolOutput: (content: string, clientId: string, swarmName: string) => Promise<void>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string, clientId: string, swarmName: string) => Promise<void>
```

### dispose

```ts
dispose: (clientId: string, swarmName: string) => Promise<void>
```
