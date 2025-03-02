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

{
    provide(TYPES.busService, () => new BusService());
    provide(TYPES.loggerService, () => new LoggerService());
}

{
    provide(TYPES.methodContextService, () => new MethodContextService());
    provide(TYPES.executionContextService, () => new ExecutionContextService());
}

{
    provide(TYPES.agentConnectionService, () => new AgentConnectionService());
    provide(TYPES.historyConnectionService, () => new HistoryConnectionService());
    provide(TYPES.swarmConnectionService, () => new SwarmConnectionService());
    provide(TYPES.sessionConnectionService, () => new SessionConnectionService());
    provide(TYPES.storageConnectionService, () => new StorageConnectionService());
    provide(TYPES.stateConnectionService, () => new StateConnectionService());
}

{
    provide(TYPES.agentSchemaService, () => new AgentSchemaService());
    provide(TYPES.toolSchemaService, () => new ToolSchemaService());
    provide(TYPES.swarmSchemaService, () => new SwarmSchemaService());
    provide(TYPES.completionSchemaService, () => new CompletionSchemaService());
    provide(TYPES.embeddingSchemaService, () => new EmbeddingSchemaService());
    provide(TYPES.storageSchemaService, () => new StorageSchemaService());
    provide(TYPES.stateSchemaService, () => new StateSchemaService());
}

{
    provide(TYPES.agentPublicService, () => new AgentPublicService());
    provide(TYPES.historyPublicService, () => new HistoryPublicService());
    provide(TYPES.sessionPublicService, () => new SessionPublicService());
    provide(TYPES.swarmPublicService, () => new SwarmPublicService());
    provide(TYPES.storagePublicService, () => new StoragePublicService());
    provide(TYPES.statePublicService, () => new StatePublicService());
}

{
    provide(TYPES.swarmMetaService, () => new SwarmMetaService());
    provide(TYPES.agentMetaService, () => new AgentMetaService());
}

{
    provide(TYPES.agentPublicService, () => new AgentPublicService());
    provide(TYPES.historyPublicService, () => new HistoryPublicService());
    provide(TYPES.sessionPublicService, () => new SessionPublicService());
    provide(TYPES.swarmPublicService, () => new SwarmPublicService());
}

{
    provide(TYPES.agentValidationService, () => new AgentValidationService());
    provide(TYPES.completionValidationService, () => new CompletionValidationService());
    provide(TYPES.sessionValidationService, () => new SessionValidationService());
    provide(TYPES.swarmValidationService, () => new SwarmValidationService());
    provide(TYPES.toolValidationService, () => new ToolValidationService());
    provide(TYPES.storageValidationService, () => new StorageValidationService());
    provide(TYPES.embeddingValidationService, () => new EmbeddingValidationService());
}
