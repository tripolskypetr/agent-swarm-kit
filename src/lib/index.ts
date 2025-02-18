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
import ContextService, {
  TContextService,
} from "./services/base/ContextService";
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

const baseServices = {
  loggerService: inject<LoggerService>(TYPES.loggerService),
  contextService: inject<TContextService>(TYPES.contextService),
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
};

const schemaServices = {
  agentSchemaService: inject<AgentSchemaService>(TYPES.agentSchemaService),
  toolSchemaService: inject<ToolSchemaService>(TYPES.toolSchemaService),
  swarmSchemaService: inject<SwarmSchemaService>(TYPES.swarmSchemaService),
  completionSchemaService: inject<CompletionSchemaService>(
    TYPES.completionSchemaService
  ),
  embeddingSchemaService: inject<EmbeddingSchemaService>(TYPES.embeddingSchemaService),
  storageSchemaService: inject<StorageSchemaService>(TYPES.storageSchemaService),
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
  storagePublicService: inject<StoragePublicService>(TYPES.storagePublicService),
};

const validationServices = {
    agentValidationService: inject<AgentValidationService>(TYPES.agentValidationService),
    toolValidationService: inject<ToolValidationService>(TYPES.toolValidationService),
    sessionValidationService: inject<SessionValidationService>(TYPES.sessionValidationService),
    swarmValidationService: inject<SwarmValidationService>(TYPES.swarmValidationService),
    completionValidationService: inject<CompletionValidationService>(TYPES.completionValidationService),
    storageValidationService: inject<StorageValidationService>(TYPES.storageValidationService),
    embeddingValidationService: inject<EmbeddingValidationService>(TYPES.embeddingValidationService),
};

export const swarm = {
  ...baseServices,
  ...connectionServices,
  ...schemaServices,
  ...publicServices,
  ...validationServices,
};

init();

export { ContextService };

export default swarm;
