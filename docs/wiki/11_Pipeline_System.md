# Pipeline System

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [src/functions/navigate/changeToAgent.ts](src/functions/navigate/changeToAgent.ts)
- [src/functions/navigate/changeToDefaultAgent.ts](src/functions/navigate/changeToDefaultAgent.ts)
- [src/functions/navigate/changeToPrevAgent.ts](src/functions/navigate/changeToPrevAgent.ts)
- [src/functions/setup/addPipeline.ts](src/functions/setup/addPipeline.ts)
- [src/functions/target/scope.ts](src/functions/target/scope.ts)
- [src/functions/target/startPipeline.ts](src/functions/target/startPipeline.ts)
- [src/functions/test/overridePipeline.ts](src/functions/test/overridePipeline.ts)
- [src/interfaces/History.interface.ts](src/interfaces/History.interface.ts)
- [src/lib/services/connection/HistoryConnectionService.ts](src/lib/services/connection/HistoryConnectionService.ts)
- [src/lib/services/schema/PipelineSchemaService.ts](src/lib/services/schema/PipelineSchemaService.ts)
- [src/lib/services/validation/PipelineValidationService.ts](src/lib/services/validation/PipelineValidationService.ts)
- [src/model/Pipeline.model.ts](src/model/Pipeline.model.ts)

</details>



The Pipeline System provides automated workflow execution capabilities within the agent swarm framework. It enables developers to define, register, and execute background processes that can operate independently of regular agent interactions while maintaining integration with the session management, agent navigation, and validation systems.

For information about agent navigation and routing, see [Navigation System](#2.7). For session and client management patterns, see [Session and Chat Management](#2.3).

## Pipeline Schema Structure

Pipelines are defined using the `IPipelineSchema` interface, which specifies the execution logic and optional lifecycle callbacks.

![Mermaid Diagram](./diagrams\11_Pipeline_System_0.svg)

**Sources:** [src/model/Pipeline.model.ts:9-78]()

The core pipeline schema includes:

| Property | Type | Description |
|----------|------|-------------|
| `pipelineName` | `PipelineName` | Unique string identifier for the pipeline |
| `execute` | `Function` | Main execution logic accepting clientId, agentName, and payload |
| `callbacks` | `IPipelineCallbacks` | Optional lifecycle event handlers |

## Pipeline Registration and Management

Pipelines are registered using the `addPipeline` function and managed through the schema and validation services.

![Mermaid Diagram](./diagrams\11_Pipeline_System_1.svg)

**Sources:** [src/functions/setup/addPipeline.ts:21-49](), [src/lib/services/schema/PipelineSchemaService.ts:96-107](), [src/lib/services/validation/PipelineValidationService.ts:33-49]()

### Pipeline Schema Service

The `PipelineSchemaService` manages pipeline schema storage and retrieval using a `ToolRegistry`:

- **Registration**: [src/lib/services/schema/PipelineSchemaService.ts:102-107]() validates and stores pipeline schemas
- **Override**: [src/lib/services/schema/PipelineSchemaService.ts:116-121]() allows partial schema updates for testing
- **Context Integration**: [src/lib/services/schema/PipelineSchemaService.ts:50-70]() supports schema context overrides

### Pipeline Validation Service

The `PipelineValidationService` ensures pipeline uniqueness and existence:

- **Duplicate Prevention**: [src/lib/services/validation/PipelineValidationService.ts:39-49]() prevents duplicate pipeline names
- **Memoized Validation**: [src/lib/services/validation/PipelineValidationService.ts:58-72]() provides efficient pipeline existence checks

## Pipeline Execution Flow

Pipeline execution is handled by the `startPipeline` function, which manages session validation, agent navigation, and lifecycle callbacks.

![Mermaid Diagram](./diagrams\11_Pipeline_System_2.svg)

**Sources:** [src/functions/target/startPipeline.ts:23-96]()

### Key Execution Features

1. **Session Validation**: [src/functions/target/startPipeline.ts:36-38]() ensures valid session, pipeline, and agent
2. **Agent Navigation**: [src/functions/target/startPipeline.ts:40-48]() switches to required agent if needed
3. **Error Handling**: [src/functions/target/startPipeline.ts:53-73]() provides comprehensive error handling with callbacks
4. **Cleanup**: [src/functions/target/startPipeline.ts:67-69]() restores original agent regardless of execution outcome

## Schema Context and Scoped Execution

The `scope` function enables temporary schema overrides for pipeline execution, allowing isolated testing and customization.

![Mermaid Diagram](./diagrams\11_Pipeline_System_3.svg)

**Sources:** [src/functions/target/scope.ts:29-79]()

The `scope` function allows temporary overrides of:

| Service | Purpose |
|---------|---------|
| `pipelineSchemaService` | Override pipeline definitions |
| `agentSchemaService` | Override agent configurations |
| `toolSchemaService` | Override tool definitions |
| `completionSchemaService` | Override AI model configurations |

## Integration with Core Systems

Pipelines integrate with several core systems within the agent swarm framework:

![Mermaid Diagram](./diagrams\11_Pipeline_System_4.svg)

**Sources:** [src/functions/target/startPipeline.ts:40-48](), [src/functions/navigate/changeToAgent.ts:185-187]()

### Background Processing Integration

Pipelines operate as background processes that can:

1. **Execute Independently**: Run without blocking main agent interactions
2. **Maintain Context**: Preserve client and agent context throughout execution
3. **Handle Failures**: Provide comprehensive error handling and recovery
4. **Integrate Navigation**: Seamlessly switch between agents as needed

## Pipeline Lifecycle Callbacks

The callback system provides hooks for monitoring and controlling pipeline execution:

| Callback | Trigger | Parameters | Purpose |
|----------|---------|------------|---------|
| `onStart` | Pipeline begins execution | `clientId`, `pipelineName`, `payload` | Initialize resources, logging |
| `onError` | Exception during execution | `clientId`, `pipelineName`, `payload`, `error` | Error handling, cleanup |
| `onEnd` | Pipeline completes | `clientId`, `pipelineName`, `payload`, `isError` | Final cleanup, reporting |

**Sources:** [src/model/Pipeline.model.ts:38-72](), [src/functions/target/startPipeline.ts:57-72]()

The callback system enables comprehensive pipeline monitoring and provides hooks for custom error handling, resource cleanup, and execution reporting.