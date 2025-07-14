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
prompt: string | ((outlineName: string) => string | Promise<string>)
```

The prompt used to initiate the outline operation.
Can be a static string or a function that generates the prompt dynamically based on the outline name.
If a function is provided, it may return a string or a Promise resolving to a string.
This prompt is typically sent to the completion engine or model to guide the generation process.

### system

```ts
system: string[] | ((outlineName: string) => string[] | Promise<string[]>)
```

The system prompt(s) provided to the language model for the outline operation.
Can be a static array of strings or a function that generates the system prompts dynamically based on the outline name.
These prompts are typically used to set context, instructions, or constraints for the model before user or assistant messages.

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
