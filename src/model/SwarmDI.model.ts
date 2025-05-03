import LoggerService from "../lib/services/base/LoggerService";
import AgentConnectionService from "../lib/services/connection/AgentConnectionService";
import HistoryConnectionService from "../lib/services/connection/HistoryConnectionService";
import AgentSchemaService from "../lib/services/schema/AgentSchemaService";
import ToolSchemaService from "../lib/services/schema/ToolSchemaService";
import SwarmConnectionService from "../lib/services/connection/SwarmConnectionService";
import SwarmSchemaService from "../lib/services/schema/SwarmSchemaService";
import CompletionSchemaService from "../lib/services/schema/CompletionSchemaService";
import { TMethodContextService } from "../lib/services/context/MethodContextService";
import SessionConnectionService from "../lib/services/connection/SessionConnectionService";
import AgentPublicService from "../lib/services/public/AgentPublicService";
import HistoryPublicService from "../lib/services/public/HistoryPublicService";
import SessionPublicService from "../lib/services/public/SessionPublicService";
import SwarmPublicService from "../lib/services/public/SwarmPublicService";
import AgentValidationService from "../lib/services/validation/AgentValidationService";
import ToolValidationService from "../lib/services/validation/ToolValidationService";
import SessionValidationService from "../lib/services/validation/SessionValidationService";
import SwarmValidationService from "../lib/services/validation/SwarmValidationService";
import CompletionValidationService from "../lib/services/validation/CompletionValidationService";
import EmbeddingSchemaService from "../lib/services/schema/EmbeddingSchemaService";
import StorageSchemaService from "../lib/services/schema/StorageSchemaService";
import StorageConnectionService from "../lib/services/connection/StorageConnectionService";
import StoragePublicService from "../lib/services/public/StoragePublicService";
import StorageValidationService from "../lib/services/validation/StorageValidationService";
import EmbeddingValidationService from "../lib/services/validation/EmbeddingValidationService";
import StatePublicService from "../lib/services/public/StatePublicService";
import StateSchemaService from "../lib/services/schema/StateSchemaService";
import StateConnectionService from "../lib/services/connection/StateConnectionService";
import BusService from "../lib/services/base/BusService";
import { TExecutionContextService } from "../lib/services/context/ExecutionContextService";
import AgentMetaService from "../lib/services/meta/AgentMetaService";
import SwarmMetaService from "../lib/services/meta/SwarmMetaService";
import DocService from "../lib/services/base/DocService";
import SharedStorageConnectionService from "../lib/services/connection/SharedStorageConnectionService";
import SharedStateConnectionService from "../lib/services/connection/SharedStateConnectionService";
import SharedStatePublicService from "../lib/services/public/SharedStatePublicService";
import SharedStoragePublicService from "../lib/services/public/SharedStoragePublicService";
import MemorySchemaService from "../lib/services/schema/MemorySchemaService";
import PerfService from "../lib/services/base/PerfService";
import PolicySchemaService from "../lib/services/schema/PolicySchemaService";
import PolicyValidationService from "../lib/services/validation/PolicyValidationService";
import PolicyPublicService from "../lib/services/public/PolicyPublicService";
import PolicyConnectionService from "../lib/services/connection/PolicyConnectionService";
import { TPayloadContextService } from "../lib/services/context/PayloadContextService";
import AliveService from "../lib/services/base/AliveService";
import NavigationValidationService from "../lib/services/validation/NavigationValidationService";
import WikiValidationService from "../lib/services/validation/WikiValidationService";
import WikiSchemaService from "../lib/services/schema/WikiSchemaService";
import MCPConnectionService from "../lib/services/connection/MCPConnectionService";
import MCPSchemaService from "../lib/services/schema/MCPSchemaService";
import MCPPublicService from "../lib/services/public/MCPPublicService";
import MCPValidationService from "../lib/services/validation/MCPValidationService";
import ComputeValidationService from "../lib/services/validation/ComputeValidationService";
import StateValidationService from "../lib/services/validation/StateValidationService";
import ComputeSchemaService from "../lib/services/schema/ComputeSchemaService";
import ComputePublicService from "../lib/services/public/ComputePublicService";
import SharedComputePublicService from "../lib/services/public/SharedComputePublicService";
import ComputeConnectionService from "../lib/services/connection/ComputeConnectionService";
import SharedComputeConnectionService from "../lib/services/connection/SharedComputeConnectionService";

/**
 * Interface defining the structure of the dependency injection container for the swarm system.
 * Aggregates all services providing core functionality, context management, connectivity, schema definitions,
 * public APIs, metadata, and validation for the swarm system.
 */
export interface ISwarmDI {
  // Base Services
  /**
   * Service for managing documentation generation and retrieval within the swarm system.
   * Integrates with `DocService` to provide system-wide documentation capabilities.
   */
  docService: DocService;

  /**
   * Service for event-driven communication across the swarm system.
   * Implements `IBus` to dispatch events like "run" or "emit-output" to clients via `bus.emit`.
   */
  busService: BusService;

  /**
   * Service for monitoring and recording performance metrics in the swarm system.
   * Tracks execution times and resource usage, e.g., via `startExecution` in `PerfService`.
   */
  perfService: PerfService;

  /**
   * Service for tracking the liveness and health of swarm components.
   * Ensures system components remain operational, integrating with persistence layers like `PersistAlive`.
   */
  aliveService: AliveService;

  /**
   * Service for logging system events and debugging information.
   * Implements `ILogger` to provide log, debug, and info-level logging across components.
   */
  loggerService: LoggerService;

  // Context Services
  /**
   * Service for managing method-level execution context.
   * Tracks invocation metadata, scoped via `MethodContextService` for debugging and tracing.
   */
  methodContextService: TMethodContextService;

  /**
   * Service for encapsulating payload-related context data.
   * Implements `IPayloadContext` to provide execution metadata and payload access via `PayloadContextService`.
   */
  payloadContextService: TPayloadContextService;

  /**
   * Service for managing execution-level context across the swarm system.
   * Implements `IExecutionContext` to track `clientId`, `executionId`, and `processId` via `ExecutionContextService`.
   */
  executionContextService: TExecutionContextService;

  // Connection Services
  /**
   * Service for managing agent connections within the swarm.
   * Handles lifecycle events like `makeConnection` and `disposeConnection` for agents.
   */
  agentConnectionService: AgentConnectionService;

  /**
   * Service for managing history connections and persistence.
   * Integrates with `IHistory` to connect and store historical data via `HistoryConnectionService`.
   */
  historyConnectionService: HistoryConnectionService;

  /**
   * Service for managing swarm-level connections.
   * Facilitates swarm lifecycle operations like agent navigation via `SwarmConnectionService`.
   */
  swarmConnectionService: SwarmConnectionService;

  /**
   * Service for managing client session connections.
   * Implements `ISession` connectivity via `SessionConnectionService` for client interactions.
   */
  sessionConnectionService: SessionConnectionService;

  /**
   * Service for managing storage connections within the swarm.
   * Handles `IStorage` connectivity and persistence via `StorageConnectionService`.
   */
  storageConnectionService: StorageConnectionService;

  /**
   * Service for managing shared storage connections across agents.
   * Provides shared `IStorage` access via `SharedStorageConnectionService`.
   */
  sharedStorageConnectionService: SharedStorageConnectionService;

  /**
   * Service for managing state connections within the swarm.
   * Handles `IState` connectivity and persistence via `StateConnectionService`.
   */
  stateConnectionService: StateConnectionService;

  /**
   * Service for managing shared state connections across agents.
   * Provides shared `IState` access via `SharedStateConnectionService`.
   */
  sharedStateConnectionService: SharedStateConnectionService;

  /**
   * Service for managing policy connections within the swarm.
   * Handles `IPolicy` connectivity and enforcement via `PolicyConnectionService`.
   */
  policyConnectionService: PolicyConnectionService;

  /**
   * Service for managing mcp connections within the swarm.
   * Handles `IMCP` connectivity and enforcement via `MCPConnectionService`.
   */
  mcpConnectionService: MCPConnectionService;

  /**
   * Service for managing compute connections within the swarm.
   * Handles `ICompute` connectivity via `ComputeConnectionService`.
   */
  computeConnectionService: ComputeConnectionService;

  /**
   * Service for managing shared compute connections within the swarm.
   * Handles `ICompute` connectivity via `SharedComputePublicService`.
   */
  sharedComputeConnectionService: SharedComputeConnectionService;

  // Schema Services
  /**
   * Service for defining and managing agent schemas.
   * Implements `IAgentSchema` to configure agent behavior via `AgentSchemaService`.
   */
  agentSchemaService: AgentSchemaService;

  /**
   * Service for defining and managing tool schemas.
   * Configures `ITool` structures for agent use via `ToolSchemaService`.
   */
  toolSchemaService: ToolSchemaService;

  /**
   * Service for defining and managing swarm schemas.
   * Implements `ISwarmSchema` to configure swarm behavior via `SwarmSchemaService`.
   */
  swarmSchemaService: SwarmSchemaService;

  /**
   * Service for defining and managing completion schemas.
   * Configures `ICompletionSchema` for AI model interactions via `CompletionSchemaService`.
   */
  completionSchemaService: CompletionSchemaService;

  /**
   * Service for defining and managing embedding schemas.
   * Implements `IEmbeddingSchema` for text encoding via `EmbeddingSchemaService`.
   */
  embeddingSchemaService: EmbeddingSchemaService;

  /**
   * Service for defining and managing storage schemas.
   * Implements `IStorageSchema` for data persistence via `StorageSchemaService`.
   */
  storageSchemaService: StorageSchemaService;

  /**
   * Service for defining and managing state schemas.
   * Implements `IStateSchema` for state management via `StateSchemaService`.
   */
  stateSchemaService: StateSchemaService;

  /**
   * Service for defining and managing memory schemas.
   * Handles session memory structures via `MemorySchemaService` for client state persistence.
   */
  memorySchemaService: MemorySchemaService;

  /**
   * Service for defining and managing policy schemas.
   * Implements `IPolicySchema` for rule enforcement via `PolicySchemaService`.
   */
  policySchemaService: PolicySchemaService;

  /**
   * Service for defining and managing policy schemas.
   * Implements `IMCPSchema` for rule enforcement via `MCPSchemaService`.
   */
  mcpSchemaService: MCPSchemaService;

  /**
   * Service for defining and managing compute schemas.
   * Implements `IComputeSchema` for rule enforcement via `ComputeSchemaService`.
   */
  computeSchemaService: ComputeSchemaService;

  /**
   * Service for defining and managing agent wikies.
   * Implements `IWikiSchema` for rule enforcement via `WikiSchemaService`.
   */
  wikiSchemaService: WikiSchemaService;

  // Public Services
  /**
   * Service exposing public APIs for agent operations.
   * Provides methods like `execute` and `runStateless` via `AgentPublicService`.
   */
  agentPublicService: AgentPublicService;

  /**
   * Service exposing public APIs for historical data management.
   * Implements `IHistory` operations like `push` via `HistoryPublicService`.
   */
  historyPublicService: HistoryPublicService;

  /**
   * Service exposing public APIs for session management.
   * Provides session lifecycle methods via `SessionPublicService`.
   */
  sessionPublicService: SessionPublicService;

  /**
   * Service exposing public APIs for swarm operations.
   * Handles swarm navigation and management via `SwarmPublicService`.
   */
  swarmPublicService: SwarmPublicService;

  /**
   * Service exposing public APIs for storage operations.
   * Implements `IStorage` methods like `upsert` and `take` via `StoragePublicService`.
   */
  storagePublicService: StoragePublicService;

  /**
   * Service exposing public APIs for shared storage operations.
   * Provides shared `IStorage` access via `SharedStoragePublicService`.
   */
  sharedStoragePublicService: SharedStoragePublicService;

  /**
   * Service exposing public APIs for state operations.
   * Implements `IState` methods like `getState` and `setState` via `StatePublicService`.
   */
  statePublicService: StatePublicService;

  /**
   * Service exposing public APIs for compute operations.
   * Implements `IComput` methods
   */
  computePublicService: ComputePublicService;

  /**
   * Service exposing public APIs for shared state operations.
   * Provides shared `IState` access via `SharedStatePublicService`.
   */
  sharedStatePublicService: SharedStatePublicService;

  /**
   * Service exposing public APIs for shared compute operations.
   * Provides shared `ICompute` access via `SharedComputePublicService`.
   */
  sharedComputePublicService: SharedComputePublicService;

  /**
   * Service exposing public APIs for policy operations.
   * Implements `IPolicy` methods like `banClient` via `PolicyPublicService`.
   */
  policyPublicService: PolicyPublicService;

  /**
   * Service exposing public APIs for mcp operations.
   * Implements `IMCP` methods like `listTools` via `MCPPublicService`.
   */
  mcpPublicService: MCPPublicService;

  // Meta Services
  /**
   * Service managing metadata for agents.
   * Tracks agent-specific metadata via `AgentMetaService`.
   */
  agentMetaService: AgentMetaService;

  /**
   * Service managing metadata for swarms.
   * Tracks swarm-specific metadata via `SwarmMetaService`.
   */
  swarmMetaService: SwarmMetaService;

  // Validation Services
  /**
   * Service validating agent-related data and configurations.
   * Ensures agent integrity via `AgentValidationService`.
   */
  agentValidationService: AgentValidationService;

  /**
   * Service validating tool-related data and parameters.
   * Ensures tool correctness via `ToolValidationService`.
   */
  toolValidationService: ToolValidationService;

  /**
   * Service validating session-related data and connectivity.
   * Ensures session validity via `SessionValidationService`.
   */
  sessionValidationService: SessionValidationService;

  /**
   * Service validating swarm-related data and configurations.
   * Ensures swarm integrity via `SwarmValidationService`.
   */
  swarmValidationService: SwarmValidationService;

  /**
   * Service validating completion-related data and responses.
   * Ensures completion integrity via `CompletionValidationService`.
   */
  completionValidationService: CompletionValidationService;

  /**
   * Service validating storage-related data and operations.
   * Ensures storage integrity via `StorageValidationService`.
   */
  storageValidationService: StorageValidationService;

  /**
   * Service validating embedding-related data and configurations.
   * Ensures embedding integrity via `EmbeddingValidationService`.
   */
  embeddingValidationService: EmbeddingValidationService;

  /**
   * Service validating policy-related data and enforcement rules.
   * Ensures policy integrity via `PolicyValidationService`.
   */
  policyValidationService: PolicyValidationService;

  /**
   * Service validating mcp-related data and enforcement rules.
   * Ensures mcp integrity via `MCPValidationService`.
   */
  mcpValidationService: MCPValidationService;

  /**
   * Service validating compute data
   * Ensures compute integrity via `ComputeValidationService`.
   */
  computeValidationService: ComputeValidationService;

  /**
   * Service validating state-related data.
   * Ensures mcp integrity via `StateValidationService`.
   */
  stateValidationService: StateValidationService;

  /**
   * Service preventing the recursive call of changeToAgent
   */
  navigationValidationService: NavigationValidationService;

  /**
   * Service preventing the recursive call of changeToAgent
   */
  wikiValidationService: WikiValidationService;
}
