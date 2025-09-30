/**
 * @module SchemaContextService
 * Defines a service for managing schema context with a registry of schema services, using dependency injection for scoped instantiation.
*/

import { scoped } from "di-scoped";
import { ToolRegistry } from "functools-kit";
import {
  AgentName,
  IAgentSchemaInternal,
  IAgentTool,
  ToolName,
} from "../../../interfaces/Agent.interface";
import {
  CompletionName,
  ICompletionSchema,
} from "../../../interfaces/Completion.interface";
import {
  ComputeName,
  IComputeSchema,
} from "../../../interfaces/Compute.interface";
import {
  EmbeddingName,
  IEmbeddingSchema,
} from "../../../interfaces/Embedding.interface";
import { IMCPSchema, MCPName } from "../../../interfaces/MCP.interface";
import {
  IPolicySchema,
  PolicyName,
} from "../../../interfaces/Policy.interface";
import { IStateSchema, StateName } from "../../../interfaces/State.interface";
import {
  IStorageSchema,
  StorageName,
} from "../../../interfaces/Storage.interface";
import { ISwarmSchema, SwarmName } from "../../../interfaces/Swarm.interface";
import { IWikiSchema, WikiName } from "../../../interfaces/Wiki.interface";
import { IPipelineSchema, PipelineName } from "../../../model/Pipeline.model";
import { IOutlineSchema, OutlineName } from "../../../interfaces/Outline.interface";

/**
 * @interface ISchemaContext
 * Defines the structure of the schema context, containing a registry of schema services for various components.
*/
export interface ISchemaContext {
  /**
   * A collection of registries for different schema types, each managing specific schema records.
   * Provides centralized access to all schema services within the swarm system.
   */
  registry: {
    /**
     * @property {ToolRegistry<Record<AgentName, IAgentSchemaInternal>>} agentSchemaService
     * Registry for agent schemas, mapping agent names to their schemas.
    */
    agentSchemaService: ToolRegistry<Record<AgentName, IAgentSchemaInternal>>;

    /**
     * @property {ToolRegistry<Record<CompletionName, ICompletionSchema>>} completionSchemaService
     * Registry for completion schemas, mapping completion names to their schemas.
    */
    completionSchemaService: ToolRegistry<
      Record<CompletionName, ICompletionSchema>
    >;

    /**
     * @property {ToolRegistry<Record<ComputeName, IComputeSchema>>} computeSchemaService
     * Registry for compute schemas, mapping compute names to their schemas.
    */
    computeSchemaService: ToolRegistry<Record<ComputeName, IComputeSchema>>;

    /**
     * @property {ToolRegistry<Record<EmbeddingName, IEmbeddingSchema>>} embeddingSchemaService
     * Registry for embedding schemas, mapping embedding names to their schemas.
    */
    embeddingSchemaService: ToolRegistry<
      Record<EmbeddingName, IEmbeddingSchema>
    >;

    /**
     * @property {ToolRegistry<Record<MCPName, IMCPSchema>>} mcpSchemaService
     * Registry for MCP schemas, mapping MCP names to their schemas.
    */
    mcpSchemaService: ToolRegistry<Record<MCPName, IMCPSchema>>;

    /**
     * @property {ToolRegistry<Record<PipelineName, IPipelineSchema>>} pipelineSchemaService
     * Registry for pipeline schemas, mapping pipeline names to their schemas.
    */
    pipelineSchemaService: ToolRegistry<Record<PipelineName, IPipelineSchema>>;

    /**
     * @property {ToolRegistry<Record<PolicyName, IPolicySchema>>} policySchemaService
     * Registry for policy schemas, mapping policy names to their schemas.
    */
    policySchemaService: ToolRegistry<Record<PolicyName, IPolicySchema>>;

    /**
     * @property {ToolRegistry<Record<StateName, IStateSchema>>} stateSchemaService
     * Registry for state schemas, mapping state names to their schemas.
    */
    stateSchemaService: ToolRegistry<Record<StateName, IStateSchema>>;

    /**
     * @property {ToolRegistry<Record<StorageName, IStorageSchema>>} storageSchemaService
     * Registry for storage schemas, mapping storage names to their schemas.
    */
    storageSchemaService: ToolRegistry<Record<StorageName, IStorageSchema>>;

    /**
     * @property {ToolRegistry<Record<SwarmName, ISwarmSchema>>} swarmSchemaService
     * Registry for swarm schemas, mapping swarm names to their schemas.
    */
    swarmSchemaService: ToolRegistry<Record<SwarmName, ISwarmSchema>>;

    /**
     * @property {ToolRegistry<Record<ToolName, IAgentTool>>} toolSchemaService
     * Registry for tool schemas, mapping tool names to their schemas.
    */
    toolSchemaService: ToolRegistry<Record<ToolName, IAgentTool>>;

    /**
     * @property {ToolRegistry<Record<WikiName, IWikiSchema>>} wikiSchemaService
     * Registry for wiki schemas, mapping wiki names to their schemas.
    */
    wikiSchemaService: ToolRegistry<Record<WikiName, IWikiSchema>>;

    /**
     * @property {ToolRegistry<Record<OutlineName, IOutlineSchema>>} outlineSchemaService
     * Registry for outlines aka structured json outputs
    */
    outlineSchemaService: ToolRegistry<Record<OutlineName, IOutlineSchema>>;
  };
}

/**
 * @class SchemaContextService
 * A scoped service that holds the schema context, enabling dependency injection for schema registries.
*/
export const SchemaContextService = scoped(
  class {
    /**
     * @constructor
    */
    constructor(readonly context: ISchemaContext) {}
  }
);

/**
 * Type alias for instances of the SchemaContextService class.
 * Used for dependency injection and service management.
*/
export type TSchemaContextService = InstanceType<typeof SchemaContextService>;

/**
 * @export
 * @default SchemaContextService
 * Exports the SchemaContextService as the default export, configured for scoped dependency injection.
*/
export default SchemaContextService;
