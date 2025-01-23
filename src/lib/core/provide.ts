import ContextService from "../services/base/ContextService";
import LoggerService from "../services/base/LoggerService";
import AgentSpecService from "../services/spec/AgentSpecService";
import AgentConnectionService from "../services/connection/AgentConnectionService";
import HistoryConnectionService from "../services/connection/HistoryConnectionService";
import { provide } from "./di";
import TYPES from "./types";
import ToolSpecService from "../services/spec/ToolSpecService";
import SwarmConnectionService from "../services/connection/SwarmConnectionService";
import SwarmSpecService from "../services/spec/SwarmSpecService";
import CompletionSpecService from "../services/spec/CompletionSpecService";
import SessionConnectionService from "../services/connection/SessionConnectionService";
import AgentPublicService from "../services/public/AgentPublicService";
import HistoryPublicService from "../services/public/HistoryPublicService";
import SessionPublicService from "../services/public/SessionPublicService";
import SwarmPublicService from "../services/public/SwarmPublicService";
import AgentValidationService from "../services/schema/AgentValidationService";
import CompletionValidationService from "../services/schema/CompletionValidationService";
import SessionValidationService from "../services/schema/SessionValidationService";
import SwarmValidationService from "../services/schema/SwarmValidationService";
import ToolValidationService from "../services/schema/ToolValidationService";

{
    provide(TYPES.loggerService, () => new LoggerService());
    provide(TYPES.contextService, () => new ContextService());
}

{
    provide(TYPES.agentConnectionService, () => new AgentConnectionService());
    provide(TYPES.historyConnectionService, () => new HistoryConnectionService());
    provide(TYPES.swarmConnectionService, () => new SwarmConnectionService());
    provide(TYPES.sessionConnectionService, () => new SessionConnectionService());
}

{
    provide(TYPES.agentSpecService, () => new AgentSpecService());
    provide(TYPES.toolSpecService, () => new ToolSpecService());
    provide(TYPES.swarmSpecService, () => new SwarmSpecService());
    provide(TYPES.completionSpecService, () => new CompletionSpecService());
}

{
    provide(TYPES.agentPublicService, () => new AgentPublicService());
    provide(TYPES.historyPublicService, () => new HistoryPublicService());
    provide(TYPES.sessionPublicService, () => new SessionPublicService());
    provide(TYPES.swarmPublicService, () => new SwarmPublicService());
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
}
