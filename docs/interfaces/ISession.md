# ISession

## Methods

### execute

```ts
execute: (content: string) => Promise<string>
```

### connect

```ts
connect: (connector: SendMessageFn) => ReceiveMessageFn
```

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```
