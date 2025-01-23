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
import AgentValidationService from "./services/validation/AgentValidationService";
import ToolValidationService from "./services/validation/ToolValidationService";
import SessionValidationService from "./services/validation/SessionValidationService";
import SwarmValidationService from "./services/validation/SwarmValidationService";
import CompletionValidationService from "./services/validation/CompletionValidationService";

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

const validationServices = {
    agentValidationService: inject<AgentValidationService>(TYPES.agentValidationService),
    toolValidationService: inject<ToolValidationService>(TYPES.toolValidationService),
    sessionValidationService: inject<SessionValidationService>(TYPES.sessionValidationService),
    swarmValidationService: inject<SwarmValidationService>(TYPES.swarmValidationService),
    completionValidationService: inject<CompletionValidationService>(TYPES.completionValidationService),
};

export const swarm = {
  ...baseServices,
  ...connectionServices,
  ...specServices,
  ...publicServices,
  ...validationServices,
};

init();

export { ContextService };

export default swarm;
