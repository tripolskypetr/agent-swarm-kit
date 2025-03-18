# AliveService

Service class for managing the online/offline status of clients within swarms.
Provides methods to mark clients as online or offline, leveraging persistent storage via `PersistAliveAdapter`.

## Constructor

```ts
constructor();
```

## Properties

### loggerService

```ts
loggerService: any
```

### markOnline

```ts
markOnline: (clientId: string, swarmName: string, methodName: string) => Promise<void>
```

Marks a client as online within a specific swarm and logs the action.
Persists the online status using `PersistAliveAdapter` if persistence is enabled in the global configuration.

### markOffline

```ts
markOffline: (clientId: string, swarmName: string, methodName: string) => Promise<void>
```

Marks a client as offline within a specific swarm and logs the action.
Persists the offline status using `PersistAliveAdapter` if persistence is enabled in the global configuration.
