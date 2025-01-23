import "./core/provide";
import { inject, init } from "./core/di";
import TYPES from "./core/types";
import LoggerService from "./services/base/LoggerService";
import AgentConnectionService from "./services/connection/AgentConnectionService";
import HistoryConnectionService from "./services/connection/HistoryConnectionService";
import AgentSpecService from "./services/spec/AgentSpecService";
import ToolSpecService from "./services/spec/ToolSpecService";
import SwarmConnectionService from "./services/connection/SwarmConnectionService";
import SwarmSpecService from "./services/spec/SwarmSpecService";
import CompletionSpecService from "./services/spec/CompletionSpecService";
import ContextService, {
  TContextService,
} from "./services/base/ContextService";
import SessionConnectionService from "./services/connection/SessionConnectionService";
import AgentPublicService from "./services/public/AgentPublicService";
import HistoryPublicService from "./services/public/HistoryPublicService";
import SessionPublicService from "./services/public/SessionPublicService";
import SwarmPublicService from "./services/public/SwarmPublicService";
import AgentSchemaService from "./services/schema/AgentSchemaService";
import ToolSchemaService from "./services/schema/ToolSchemaService";
import SessionSchemaService from "./services/schema/SessionSchemaService";
import SwarmSchemaService from "./services/schema/SwarmSchemaService";
import CompletionSchemaService from "./services/schema/CompletionSchemaService";

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
};

const specServices = {
  agentSpecService: inject<AgentSpecService>(TYPES.agentSpecService),
  toolSpecService: inject<ToolSpecService>(TYPES.toolSpecService),
  swarmSpecService: inject<SwarmSpecService>(TYPES.swarmSpecService),
  completionSpecService: inject<CompletionSpecService>(
    TYPES.completionSpecService
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
};

const schemaServices = {
    agentSchemaService: inject<AgentSchemaService>(TYPES.agentSchemaService),
    toolSchemaService: inject<ToolSchemaService>(TYPES.toolSchemaService),
    sessionSchemaService: inject<SessionSchemaService>(TYPES.sessionSchemaService),
    swarmSchemaService: inject<SwarmSchemaService>(TYPES.swarmSchemaService),
    completionSchemaService: inject<CompletionSchemaService>(TYPES.completionSchemaService),
};

export const swarm = {
  ...baseServices,
  ...connectionServices,
  ...specServices,
  ...publicServices,
  ...schemaServices,
};

init();

export { ContextService };

export default swarm;
