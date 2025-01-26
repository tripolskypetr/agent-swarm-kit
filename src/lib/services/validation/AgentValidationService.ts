import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import {
  AgentName,
  IAgentSchema,
  ToolName,
} from "../../../interfaces/Agent.interface";
import ToolValidationService from "./ToolValidationService";
import CompletionValidationService from "./CompletionValidationService";
import { memoize } from "functools-kit";

/**
 * Service for validating agents within the agent swarm.
 */
export class AgentValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly toolValidationService = inject<ToolValidationService>(
    TYPES.toolValidationService
  );
  private readonly completionValidationService =
    inject<CompletionValidationService>(TYPES.completionValidationService);

  private _agentMap = new Map<AgentName, IAgentSchema>();

  /**
   * Adds a new agent to the validation service.
   * @param {AgentName} agentName - The name of the agent.
   * @param {IAgentSchema} agentSchema - The schema of the agent.
   * @throws {Error} If the agent already exists.
   */
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

  /**
   * Validates an agent by its name and source.
   * @param {AgentName} agentName - The name of the agent.
   * @param {string} source - The source of the validation request.
   * @throws {Error} If the agent is not found.
   */
  public validate = memoize(
    ([agentName]) => agentName,
    (agentName: AgentName, source: string) => {
      this.loggerService.log("agentValidationService validate", {
        agentName,
        source,
      });
      const agent = this._agentMap.get(agentName);
      if (!agent) {
        throw new Error(`agent-swarm agent ${agentName} not found source=${source}`);
      }
      this.completionValidationService.validate(agent.completion, source);
      agent.tools?.forEach((toolName: ToolName) => {
        this.toolValidationService.validate(toolName, source);
      });
    }
  ) as (agentName: AgentName, source: string) => void;
}

export default AgentValidationService;
