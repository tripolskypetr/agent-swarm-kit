import "./core/provide";
import { inject, init } from "./core/di";
import TYPES from "./core/types";
import LoggerService from "./services/base/LoggerService";
import AgentConnectionService from "./services/connection/AgentConnectionService";
import HistoryConnectionService from "./services/connection/HistoryConnectionService";
import AgentSchemaService from "./services/schema/AgentSchemaService";
import ToolSchemaService from "./services/schema/ToolSchemaService";
import SwarmConnectionService from "./services/connection/SwarmConnectionService";
import SwarmSchemaService from "./services/schema/SwarmSchemaService";
import CompletionSchemaService from "./services/schema/CompletionSchemaService";
import MethodContextService, {
  TMethodContextService,
} from "./services/context/MethodContextService";
import SessionConnectionService from "./services/connection/SessionConnectionService";
import AgentPublicService from "./services/public/AgentPublicService";
import HistoryPublicService from "./services/public/HistoryPublicService";
import SessionPublicService from "./services/public/SessionPublicService";
import SwarmPublicService from "./services/public/SwarmPublicService";
import AgentValidationService from "./services/validation/AgentValidationService";
import ToolValidationService from "./services/validation/ToolValidationService";
import SessionValidationService from "./services/validation/SessionValidationService";
import SwarmValidationService from "./services/validation/SwarmValidationService";
import CompletionValidationService from "./services/validation/CompletionValidationService";
import EmbeddingSchemaService from "./services/schema/EmbeddingSchemaService";
import StorageSchemaService from "./services/schema/StorageSchemaService";
import StorageConnectionService from "./services/connection/StorageConnectionService";
import StoragePublicService from "./services/public/StoragePublicService";
import StorageValidationService from "./services/validation/StorageValidationService";
import EmbeddingValidationService from "./services/validation/EmbeddingValidationService";
import StatePublicService from "./services/public/StatePublicService";
import StateSchemaService from "./services/schema/StateSchemaService";
import StateConnectionService from "./services/connection/StateConnectionService";
import BusService from "./services/base/BusService";
import ExecutionContextService, {
  TExecutionContextService,
} from "./services/context/ExecutionContextService";
import AgentMetaService from "./services/meta/AgentMetaService";
import SwarmMetaService from "./services/meta/SwarmMetaService";
import DocService from "./services/base/DocService";
import SharedStorageConnectionService from "./services/connection/SharedStorageConnectionService";
import SharedStateConnectionService from "./services/connection/SharedStateConnectionService";
import SharedStatePublicService from "./services/public/SharedStatePublicService";
import SharedStoragePublicService from "./services/public/SharedStoragePublicService";
import MemorySchemaService from "./services/schema/MemorySchemaService";
import PerfService from "./services/base/PerfService";
import PolicySchemaService from "./services/schema/PolicySchemaService";
import PolicyValidationService from "./services/validation/PolicyValidationService";
import PolicyPublicService from "./services/public/PolicyPublicService";
import PolicyConnectionService from "./services/connection/PolicyConnectionService";
import PayloadContextService, {
  TPayloadContextService,
} from "./services/context/PayloadContextService";
import AliveService from "./services/base/AliveService";
import { ISwarmDI } from "../model/SwarmDI.model";
import NavigationValidationService from "./services/validation/NavigationValidationService";
import WikiValidationService from "./services/validation/WikiValidationService";
import WikiSchemaService from "./services/schema/WikiSchemaService";
import MCPConnectionService from "./services/connection/MCPConnectionService";
import MCPSchemaService from "./services/schema/MCPSchemaService";
import MCPPublicService from "./services/public/MCPPublicService";
import MCPValidationService from "./services/validation/MCPValidationService";
import ComputeValidationService from "./services/validation/ComputeValidationService";
import StateValidationService from "./services/validation/StateValidationService";
import ComputeSchemaService from "./services/schema/ComputeSchemaService";
import ComputeConnectionService from "./services/connection/ComputeConnectionService";
import SharedComputeConnectionService from "./services/connection/SharedComputeConnectionService";
import ComputePublicService from "./services/public/ComputePublicService";
import SharedComputePublicService from "./services/public/SharedComputePublicService";
import PipelineSchemaService from "./services/schema/PipelineSchemaService";
import PipelineValidationService from "./services/validation/PipelineValidationService";
import SchemaContextService, {
  TSchemaContextService,
} from "./services/context/SchemaContextService";
import ExecutionValidationService from "./services/validation/ExecutionValidationService";
import NavigationSchemaService from "./services/schema/NavigationSchemaService";
import OutlineSchemaService from "./services/schema/OutlineSchemaService";
import OutlineValidationService from "./services/validation/OutlineValidationService";

const baseServices = {
  docService: inject<DocService>(TYPES.docService),
  busService: inject<BusService>(TYPES.busService),
  perfService: inject<PerfService>(TYPES.perfService),
  aliveService: inject<AliveService>(TYPES.aliveService),
  loggerService: inject<LoggerService>(TYPES.loggerService),
};

const contextServices = {
  methodContextService: inject<TMethodContextService>(
    TYPES.methodContextService
  ),
  payloadContextService: inject<TPayloadContextService>(
    TYPES.payloadContextService
  ),
  executionContextService: inject<TExecutionContextService>(
    TYPES.executionContextService
  ),
  schemaContextService: inject<TSchemaContextService>(
    TYPES.schemaContextService
  ),
};

const connectionServices = {
  agentConnectionService: inject<AgentConnectionService>(
    TYPES.agentConnectionService
  ),
  historyConnectionService: inject<HistoryConnectionService>(
    TYPES.historyConnectionService
  ),
  swarmConnectionService: inject<SwarmConnectionService>(
    TYPES.swarmConnectionService
  ),
  sessionConnectionService: inject<SessionConnectionService>(
    TYPES.sessionConnectionService
  ),
  storageConnectionService: inject<StorageConnectionService>(
    TYPES.storageConnectionService
  ),
  sharedStorageConnectionService: inject<SharedStorageConnectionService>(
    TYPES.sharedStorageConnectionService
  ),
  stateConnectionService: inject<StateConnectionService>(
    TYPES.stateConnectionService
  ),
  sharedStateConnectionService: inject<SharedStateConnectionService>(
    TYPES.sharedStateConnectionService
  ),
  policyConnectionService: inject<PolicyConnectionService>(
    TYPES.policyConnectionService
  ),
  mcpConnectionService: inject<MCPConnectionService>(
    TYPES.mcpConnectionService
  ),
  computeConnectionService: inject<ComputeConnectionService>(
    TYPES.computeConnectionService
  ),
  sharedComputeConnectionService: inject<SharedComputeConnectionService>(
    TYPES.sharedComputeConnectionService
  ),
};

const schemaServices = {
  agentSchemaService: inject<AgentSchemaService>(TYPES.agentSchemaService),
  toolSchemaService: inject<ToolSchemaService>(TYPES.toolSchemaService),
  swarmSchemaService: inject<SwarmSchemaService>(TYPES.swarmSchemaService),
  completionSchemaService: inject<CompletionSchemaService>(
    TYPES.completionSchemaService
  ),
  embeddingSchemaService: inject<EmbeddingSchemaService>(
    TYPES.embeddingSchemaService
  ),
  storageSchemaService: inject<StorageSchemaService>(
    TYPES.storageSchemaService
  ),
  stateSchemaService: inject<StateSchemaService>(TYPES.stateSchemaService),
  memorySchemaService: inject<MemorySchemaService>(TYPES.memorySchemaService),
  policySchemaService: inject<PolicySchemaService>(TYPES.policySchemaService),
  wikiSchemaService: inject<WikiSchemaService>(TYPES.wikiSchemaService),
  mcpSchemaService: inject<MCPSchemaService>(TYPES.mcpSchemaService),
  computeSchemaService: inject<ComputeSchemaService>(
    TYPES.computeSchemaService
  ),
  pipelineSchemaService: inject<PipelineSchemaService>(
    TYPES.pipelineSchemaService
  ),
  navigationSchemaService: inject<NavigationSchemaService>(
    TYPES.navigationSchemaService
  ),
  outlineSchemaService: inject<OutlineSchemaService>(
    TYPES.outlineSchemaService
  ),
};

const publicServices = {
  agentPublicService: inject<AgentPublicService>(TYPES.agentPublicService),
  historyPublicService: inject<HistoryPublicService>(
    TYPES.historyPublicService
  ),
  sessionPublicService: inject<SessionPublicService>(
    TYPES.sessionPublicService
  ),
  swarmPublicService: inject<SwarmPublicService>(TYPES.swarmPublicService),
  storagePublicService: inject<StoragePublicService>(
    TYPES.storagePublicService
  ),
  sharedStoragePublicService: inject<SharedStoragePublicService>(
    TYPES.sharedStoragePublicService
  ),
  statePublicService: inject<StatePublicService>(TYPES.statePublicService),
  sharedStatePublicService: inject<SharedStatePublicService>(
    TYPES.sharedStatePublicService
  ),
  policyPublicService: inject<PolicyPublicService>(TYPES.policyPublicService),
  mcpPublicService: inject<MCPPublicService>(TYPES.mcpPublicService),
  computePublicService: inject<ComputePublicService>(
    TYPES.computePublicService
  ),
  sharedComputePublicService: inject<SharedComputePublicService>(
    TYPES.sharedComputePublicService
  ),
};

const metaServices = {
  agentMetaService: inject<AgentMetaService>(TYPES.agentMetaService),
  swarmMetaService: inject<SwarmMetaService>(TYPES.swarmMetaService),
};

const validationServices = {
  agentValidationService: inject<AgentValidationService>(
    TYPES.agentValidationService
  ),
  toolValidationService: inject<ToolValidationService>(
    TYPES.toolValidationService
  ),
  sessionValidationService: inject<SessionValidationService>(
    TYPES.sessionValidationService
  ),
  swarmValidationService: inject<SwarmValidationService>(
    TYPES.swarmValidationService
  ),
  completionValidationService: inject<CompletionValidationService>(
    TYPES.completionValidationService
  ),
  storageValidationService: inject<StorageValidationService>(
    TYPES.storageValidationService
  ),
  embeddingValidationService: inject<EmbeddingValidationService>(
    TYPES.embeddingValidationService
  ),
  policyValidationService: inject<PolicyValidationService>(
    TYPES.policyValidationService
  ),
  navigationValidationService: inject<NavigationValidationService>(
    TYPES.navigationValidationService
  ),
  wikiValidationService: inject<WikiValidationService>(
    TYPES.wikiValidationService
  ),
  mcpValidationService: inject<MCPValidationService>(
    TYPES.mcpValidationService
  ),
  computeValidationService: inject<ComputeValidationService>(
    TYPES.computeValidationService
  ),
  stateValidationService: inject<StateValidationService>(
    TYPES.stateValidationService
  ),
  pipelineValidationService: inject<PipelineValidationService>(
    TYPES.pipelineValidationService
  ),
  executionValidationService: inject<ExecutionValidationService>(
    TYPES.executionValidationService
  ),
  outlineValidationService: inject<OutlineValidationService>(
    TYPES.outlineValidationService
  ),
};

/** @inheritDoc*/
export const swarm: ISwarmDI = {
  ...baseServices,
  ...contextServices,
  ...connectionServices,
  ...schemaServices,
  ...publicServices,
  ...metaServices,
  ...validationServices,
};

init();

export { MethodContextService };
export { PayloadContextService };
export { ExecutionContextService };
export { SchemaContextService };

export default swarm;
