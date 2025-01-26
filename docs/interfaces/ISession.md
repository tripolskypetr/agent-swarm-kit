# ISession

## Methods

### emit

```ts
emit: (message: string) => Promise<void>
```

### execute

```ts
execute: (content: string) => Promise<string>
```

### connect

```ts
connect: (connector: SendMessageFn$1) => ReceiveMessageFn
```

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```
