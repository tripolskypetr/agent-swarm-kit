---
title: docs/api-reference/interface/IAdvisorSchema
group: docs
---

# IAdvisorSchema

## Properties

### docDescription

```ts
docDescription: string
```

Optional description of the advisor documentation

### advisorName

```ts
advisorName: string
```

Name identifier for the advisor

### callbacks

```ts
callbacks: IAdvisorCallbacks
```

Optional callbacks for advisor operations

## Methods

### getChat

```ts
getChat: (args: IChatArgs) => Promise<string>
```

Function to get chat response
