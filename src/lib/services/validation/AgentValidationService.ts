import { inject } from "src/lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/lib/core/types";
import {
  AgentName,
  IAgentSchema,
  ToolName,
} from "src/interfaces/Agent.interface";
import ToolValidationService from "./ToolValidationService";
import CompletionValidationService from "./CompletionValidationService";
import { memoize } from "functools-kit";

export class AgentValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly toolValidationService = inject<ToolValidationService>(
    TYPES.toolValidationService
  );
  private readonly completionValidationService =
    inject<CompletionValidationService>(TYPES.completionValidationService);

  private _agentMap = new Map<AgentName, IAgentSchema>();

  public addAgent = (agentName: AgentName, agentSchema: IAgentSchema) => {
    this.loggerService.log("agentValidationService addAgent", {
      agentName,
      agentSchema,
    });
    if (this._agentMap.has(agentName)) {
      throw new Error(`agent-swarm agent ${agentName} already exist`);
    }
    this._agentMap.set(agentName, agentSchema);
  };

  public validate = memoize(
    ([agentName]) => agentName,
    (agentName: AgentName) => {
      this.loggerService.log("agentValidationService validate", {
        agentName,
      });
      const agent = this._agentMap.get(agentName);
      if (!agent) {
        throw new Error(`agent-swarm agent ${agentName} not found`);
      }
      this.completionValidationService.validate(agent.completion);
      agent.tools?.forEach((toolName: ToolName) => {
        this.toolValidationService.validate(toolName);
      });
    }
  ) as (agentName: AgentName) => void;
}

export default AgentValidationService;
