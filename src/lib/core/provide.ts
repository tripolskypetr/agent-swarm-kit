import MethodContextService from "../services/context/MethodContextService";
import LoggerService from "../services/base/LoggerService";
import AgentSchemaService from "../services/schema/AgentSchemaService";
import AgentConnectionService from "../services/connection/AgentConnectionService";
import HistoryConnectionService from "../services/connection/HistoryConnectionService";
import { provide } from "./di";
import TYPES from "./types";
import ToolSchemaService from "../services/schema/ToolSchemaService";
import SwarmConnectionService from "../services/connection/SwarmConnectionService";
import SwarmSchemaService from "../services/schema/SwarmSchemaService";
import CompletionSchemaService from "../services/schema/CompletionSchemaService";
import SessionConnectionService from "../services/connection/SessionConnectionService";
import AgentPublicService from "../services/public/AgentPublicService";
import HistoryPublicService from "../services/public/HistoryPublicService";
import SessionPublicService from "../services/public/SessionPublicService";
import SwarmPublicService from "../services/public/SwarmPublicService";
import AgentValidationService from "../services/validation/AgentValidationService";
import CompletionValidationService from "../services/validation/CompletionValidationService";
import SessionValidationService from "../services/validation/SessionValidationService";
import SwarmValidationService from "../services/validation/SwarmValidationService";
import ToolValidationService from "../services/validation/ToolValidationService";
import EmbeddingSchemaService from "../services/schema/EmbeddingSchemaService";
import StorageSchemaService from "../services/schema/StorageSchemaService";
import StorageConnectionService from "../services/connection/StorageConnectionService";
import StoragePublicService from "../services/public/StoragePublicService";
import StorageValidationService from "../services/validation/StorageValidationService";
import EmbeddingValidationService from "../services/validation/EmbeddingValidationService";
import StateSchemaService from "../services/schema/StateSchemaService";
import StateConnectionService from "../services/connection/StateConnectionService";
import StatePublicService from "../services/public/StatePublicService";
import BusService from "../services/base/BusService";
import ExecutionContextService from "../services/context/ExecutionContextService";
import SwarmMetaService from "../services/meta/SwarmMetaService";
import AgentMetaService from "../services/meta/AgentMetaService";
import DocService from "../services/base/DocService";
import SharedStateConnectionService from "../services/connection/SharedStateConnectionService";
import SharedStorageConnectionService from "../services/connection/SharedStorageConnectionService";
import SharedStatePublicService from "../services/public/SharedStatePublicService";
import SharedStoragePublicService from "../services/public/SharedStoragePublicService";
import MemorySchemaService from "../services/schema/MemorySchemaService";
import PerfService from "../services/base/PerfService";
import PolicySchemaService from "../services/schema/PolicySchemaService";
import PolicyValidationService from "../services/validation/PolicyValidationService";
import PolicyPublicService from "../services/public/PolicyPublicService";
import PolicyConnectionService from "../services/connection/PolicyConnectionService";
import PayloadContextService from "../services/context/PayloadContextService";
import AliveService from "../services/base/AliveService";
import NavigationValidationService from "../services/validation/NavigationValidationService";
import WikiSchemaService from "../services/schema/WikiSchemaService";
import WikiValidationService from "../services/validation/WikiValidationService";
import MCPConnectionService from "../services/connection/MCPConnectionService";
import MCPSchemaService from "../services/schema/MCPSchemaService";
import MCPPublicService from "../services/public/MCPPublicService";
import MCPValidationService from "../services/validation/MCPValidationService";
import ComputeSchemaService from "../services/schema/ComputeSchemaService";
import ComputeValidationService from "../services/validation/ComputeValidationService";
import StateValidationService from "../services/validation/StateValidationService";
import ComputeConnectionService from "../services/connection/ComputeConnectionService";
import SharedComputeConnectionService from "../services/connection/SharedComputeConnectionService";
import ComputePublicService from "../services/public/ComputePublicService";
import SharedComputePublicService from "../services/public/SharedComputePublicService";
import PipelineSchemaService from "../services/schema/PipelineSchemaService";
import PipelineValidationService from "../services/validation/PipelineValidationService";

{
    provide(TYPES.docService, () => new DocService());
    provide(TYPES.busService, () => new BusService());
    provide(TYPES.perfService, () => new PerfService());
    provide(TYPES.aliveService, () => new AliveService());
    provide(TYPES.loggerService, () => new LoggerService());
}

{
    provide(TYPES.methodContextService, () => new MethodContextService());
    provide(TYPES.payloadContextService, () => new PayloadContextService());
    provide(TYPES.executionContextService, () => new ExecutionContextService());
}

{
    provide(TYPES.agentConnectionService, () => new AgentConnectionService());
    provide(TYPES.historyConnectionService, () => new HistoryConnectionService());
    provide(TYPES.swarmConnectionService, () => new SwarmConnectionService());
    provide(TYPES.sessionConnectionService, () => new SessionConnectionService());
    provide(TYPES.storageConnectionService, () => new StorageConnectionService());
    provide(TYPES.sharedStorageConnectionService, () => new SharedStorageConnectionService());
    provide(TYPES.stateConnectionService, () => new StateConnectionService());
    provide(TYPES.sharedStateConnectionService, () => new SharedStateConnectionService());
    provide(TYPES.policyConnectionService, () => new PolicyConnectionService());
    provide(TYPES.mcpConnectionService, () => new MCPConnectionService());
    provide(TYPES.computeConnectionService, () => new ComputeConnectionService());
    provide(TYPES.sharedComputeConnectionService, () => new SharedComputeConnectionService());
}

{
    provide(TYPES.agentSchemaService, () => new AgentSchemaService());
    provide(TYPES.toolSchemaService, () => new ToolSchemaService());
    provide(TYPES.swarmSchemaService, () => new SwarmSchemaService());
    provide(TYPES.completionSchemaService, () => new CompletionSchemaService());
    provide(TYPES.embeddingSchemaService, () => new EmbeddingSchemaService());
    provide(TYPES.storageSchemaService, () => new StorageSchemaService());
    provide(TYPES.stateSchemaService, () => new StateSchemaService());
    provide(TYPES.memorySchemaService, () => new MemorySchemaService());
    provide(TYPES.policySchemaService, () => new PolicySchemaService());
    provide(TYPES.wikiSchemaService, () => new WikiSchemaService());
    provide(TYPES.mcpSchemaService, () => new MCPSchemaService());
    provide(TYPES.computeSchemaService, () => new ComputeSchemaService());
    provide(TYPES.pipelineSchemaService, () => new PipelineSchemaService());
}

{
    provide(TYPES.agentPublicService, () => new AgentPublicService());
    provide(TYPES.historyPublicService, () => new HistoryPublicService());
    provide(TYPES.sessionPublicService, () => new SessionPublicService());
    provide(TYPES.swarmPublicService, () => new SwarmPublicService());
    provide(TYPES.storagePublicService, () => new StoragePublicService());
    provide(TYPES.sharedStoragePublicService, () => new SharedStoragePublicService());
    provide(TYPES.statePublicService, () => new StatePublicService());
    provide(TYPES.sharedStatePublicService, () => new SharedStatePublicService());
    provide(TYPES.policyPublicService, () => new PolicyPublicService());
    provide(TYPES.mcpPublicService, () => new MCPPublicService());
    provide(TYPES.computePublicService, () => new ComputePublicService());
    provide(TYPES.sharedComputePublicService, () => new SharedComputePublicService());
}

{
    provide(TYPES.swarmMetaService, () => new SwarmMetaService());
    provide(TYPES.agentMetaService, () => new AgentMetaService());
}

{
    provide(TYPES.agentValidationService, () => new AgentValidationService());
    provide(TYPES.completionValidationService, () => new CompletionValidationService());
    provide(TYPES.sessionValidationService, () => new SessionValidationService());
    provide(TYPES.swarmValidationService, () => new SwarmValidationService());
    provide(TYPES.toolValidationService, () => new ToolValidationService());
    provide(TYPES.storageValidationService, () => new StorageValidationService());
    provide(TYPES.embeddingValidationService, () => new EmbeddingValidationService());
    provide(TYPES.policyValidationService, () => new PolicyValidationService());
    provide(TYPES.navigationValidationService, () => new NavigationValidationService());
    provide(TYPES.wikiValidationService, () => new WikiValidationService());
    provide(TYPES.mcpValidationService, () => new MCPValidationService());
    provide(TYPES.computeValidationService, () => new ComputeValidationService());
    provide(TYPES.stateValidationService, () => new StateValidationService());
    provide(TYPES.pipelineValidationService, () => new PipelineValidationService())
}
