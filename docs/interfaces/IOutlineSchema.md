---
title: docs/api-reference/interface/IOutlineSchema
group: docs
---

# IOutlineSchema

Interface representing the schema for configuring an outline operation.
Defines the structure and behavior of an outline, including data generation and validation.

## Properties

### completion

```ts
completion: string
```

The name of the completion for JSON

### prompt

```ts
prompt: string | string[] | ((outlineName: string) => string | string[] | Promise<string | string[]>)
```

The prompt or prompt generator for the outline operation.
Can be a string, an array of strings, or a function that returns a string, array of strings, or a promise resolving to either.
If a function is provided, it receives the outline name and can return a prompt dynamically.
Used as the initial instruction or context for the outline process.

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

### format

```ts
format: IOutlineFormat
```

The format/schema definition for the outline data.
Specifies the expected structure, required fields, and property metadata for validation and documentation.

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

### getOutlineHistory

```ts
getOutlineHistory: (args: IOutlineArgs<Param>) => Promise<void>
```

Function to generate structured data for the outline operation.
Processes input param and history to produce the desired data.
