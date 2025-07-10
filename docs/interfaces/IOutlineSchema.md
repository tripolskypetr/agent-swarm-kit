---
title: docs/api-reference/interface/IOutlineSchema
group: docs
---

# IOutlineSchema

Interface representing the schema for configuring an outline operation.
Defines the structure and behavior of an outline, including data generation and validation.

## Properties

### docDescription

```ts
docDescription: string
```

Optional description for documentation purposes.
Aids in understanding the purpose or behavior of the outline.

### outlineName

```ts
outlineName: string
```

The unique name of the outline within the system.
Identifies the specific outline configuration.

### validations

```ts
validations: (IOutlineValidation<Data, Param> | IOutlineValidationFn<Data, Param>)[]
```

Array of validation functions or configurations to apply to the outline data.
Supports both direct validation functions and structured validation configurations.

### maxAttempts

```ts
maxAttempts: number
```

Optional maximum number of attempts for the outline operation.
Limits the number of retries if validations fail.

### callbacks

```ts
callbacks: IOutlineCallbacks<any, any>
```

Optional set of callbacks for outline lifecycle events.
Allows customization of attempt, document, and validation handling.

## Methods

### getStructuredOutput

```ts
getStructuredOutput: (args: IOutlineArgs<Param>) => Promise<Data>
```

Function to generate structured data for the outline operation.
Processes input param and history to produce the desired data.
