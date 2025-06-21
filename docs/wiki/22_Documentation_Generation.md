---
title: design/22_documentation_generation
group: design
---

# Documentation Generation

The Documentation Generation system automatically creates comprehensive markdown documentation for agents, swarms, and system components within the agent-swarm-kit framework. This system transforms schema definitions into human-readable documentation with UML diagrams, performance metrics, and structured cross-references between components.

For information about performance monitoring data collection, see [Performance Monitoring](./4_Swarm_Management.md). For details about schema management and component registration, see [Schema Services](./3_Client_Agent.md).

## System Architecture

The documentation generation system centers around the `DocService` class, which orchestrates the creation of markdown files, UML diagrams, and performance dumps through a coordinated workflow involving multiple schema and validation services.

![Mermaid Diagram](./diagrams\22_Documentation_Generation_0.svg)

## Documentation Generation Workflow

The documentation generation process follows a structured workflow that validates components, processes schemas, and generates output files with concurrent execution for performance optimization.

![Mermaid Diagram](./diagrams\22_Documentation_Generation_1.svg)

## Output Structure and Formats

The documentation system generates a structured directory layout with markdown files, UML diagrams, and performance data organized for easy navigation and cross-referencing.

| Output Type | Location | Format | Purpose |
|------------|----------|--------|---------|
| Swarm Documentation | `[dirName]/[swarmName].md` | Markdown | Swarm overview with agent lists and policies |
| Agent Documentation | `[dirName]/agent/[agentName].md` | Markdown | Detailed agent configuration and tools |
| UML Diagrams | `[dirName]/image/[type]_schema_[name].svg` | SVG | Visual schema representations |
| Performance Data | `[dirName]/[timestamp].json` | JSON | System performance metrics |
| Client Performance | `[dirName]/[clientId].[timestamp].json` | JSON | Client-specific metrics |

### Markdown Template Structure

Each generated markdown file follows a consistent template structure with YAML frontmatter and organized sections:

```markdown
---
title: [prefix]/[componentName]
group: [prefix]
---

# [Component Name]

> [Component Description]

![schema](./image/[schema_diagram].svg)

## [Component-Specific Sections]
```

## Schema-Driven Documentation

The documentation generation system leverages the framework's schema services to extract structured information about agents, swarms, and their relationships, creating comprehensive documentation that reflects the actual system configuration.

![Mermaid Diagram](./diagrams\22_Documentation_Generation_2.svg)

## UML Diagram Generation

The system generates visual representations of agent and swarm schemas using PlantUML, providing developers with clear architectural diagrams that complement the textual documentation.

![Mermaid Diagram](./diagrams\22_Documentation_Generation_3.svg)

## Performance Documentation

The system includes capabilities for documenting performance metrics alongside functional documentation, providing insights into system operation and client-specific performance characteristics.

| Method | Output | Content | Use Case |
|--------|--------|---------|----------|
| `dumpPerfomance()` | `[momentStamp].[timeStamp].json` | System-wide performance records | System monitoring and optimization |
| `dumpClientPerfomance()` | `[clientId].[momentStamp].json` | Client-specific performance data | Client session analysis |

### Performance Data Structure

The performance documentation captures detailed metrics through the `PerfService`:

- **System Performance**: Global performance records via `perfService.toRecord()`  
- **Client Performance**: Session-specific metrics via `perfService.toClientRecord(clientId)`
- **Timestamped Output**: Files named with `getMomentStamp()` and `getTimeStamp()` for chronological organization

## CLI and Programmatic Access

The documentation generation system provides both command-line and programmatic interfaces for integration into build processes and development workflows.

### CLI Interface

The `dumpDocs` CLI command provides a developer-friendly interface with validation and configuration options:

```typescript
// CLI signature from dumpDocs.ts
dumpDocs(
  prefix = "swarm",
  dirName = "./docs/chat", 
  PlantUML?: (uml: string) => Promise<string>,
  sanitizeMarkdown: (text: string) => string = (t) => t
)
```

### Build Integration

The system includes automated build scripts for generating documentation across multiple demo projects:

- **Linux**: [scripts/linux/build_demo_docs.sh:1-12]()
- **Windows**: [scripts/win/build_demo_docs.bat:1-13]()

These scripts iterate through demo directories, install dependencies, and execute `npm run build:docs` commands.

## Thread Pool Optimization

Documentation generation employs concurrent processing through thread pools to optimize performance when generating large numbers of documentation files.

| Configuration | Value | Purpose |
|---------------|-------|---------|
| `THREAD_POOL_SIZE` | 5 | Maximum concurrent documentation workers |
| `THREAD_POOL_DELAY` | 0 | Delay between thread pool executions |
| `execpool` | Function wrapper | Manages concurrent execution of `writeSwarmDoc` and `writeAgentDoc` |

The thread pool system ensures efficient resource utilization while preventing system overload during bulk documentation generation operations.
