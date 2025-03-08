# IPerformanceRecord

Interface representing a performance record.

## Properties

### processId

```ts
processId: string
```

The ID of current process

### clients

```ts
clients: IClientPerfomanceRecord[]
```

Array of client performance records.

### totalExecutionCount

```ts
totalExecutionCount: number
```

Total execution count.

### totalResponseTime

```ts
totalResponseTime: string
```

Total response time as a string.

### averageResponseTime

```ts
averageResponseTime: string
```

Average response time as a string.

### momentStamp

```ts
momentStamp: number
```

Days since 01/01/1970 in London.

### timeStamp

```ts
timeStamp: number
```

Seconds since 00:00 of the momentStamp.

### date

```ts
date: string
```

Current date in UTC format
