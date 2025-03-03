import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { SwarmName, ISwarmSchema } from "../../../interfaces/Swarm.interface";
import AgentValidationService from "./AgentValidationService";
import { memoize } from "functools-kit";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating swarms and their agents.
 */
export class SwarmValidationService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly agentValidationService = inject<AgentValidationService>(
    TYPES.agentValidationService
  );

  private _swarmMap = new Map<SwarmName, ISwarmSchema>();

  /**
   * Adds a new swarm to the swarm map.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {ISwarmSchema} swarmSchema - The schema of the swarm.
   * @throws Will throw an error if the swarm already exists.
   */
  public addSwarm = (swarmName: SwarmName, swarmSchema: ISwarmSchema) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmValidationService addSwarm", {
        swarmName,
        swarmSchema,
      });
    if (this._swarmMap.has(swarmName)) {
      throw new Error(`swarm-swarm swarm ${swarmName} already exist`);
    }
    this._swarmMap.set(swarmName, swarmSchema);
  };

  /**
   * Retrieves the list of agents for a given swarm.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @returns {string[]} The list of agent names.
   * @throws Will throw an error if the swarm is not found.
   */
  public getAgentList = (swarmName: SwarmName) => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmValidationService getAgentList", {
        swarmName,
      });
    const swarm = this._swarmMap.get(swarmName);
    if (!swarm) {
      throw new Error(`agent-swarm swarm ${swarmName} not found`);
    }
    return swarm.agentList;
  };

  /**
   * Retrieves the list of swarms
   * @returns {string[]} The list of swarm names
   */
  public getSwarmList = () => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("swarmValidationService getSwarmList");
    return [...this._swarmMap.keys()];
  };

  /**
   * Validates a swarm and its agents.
   * @param {SwarmName} swarmName - The name of the swarm.
   * @param {string} source - The source of the validation request.
   * @throws Will throw an error if the swarm is not found or if the default agent is not in the agent list.
   */
  public validate = memoize(
    ([swarmName]) => swarmName,
    (swarmName: SwarmName, source: string) => {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info("swarmValidationService validate", {
          swarmName,
          source,
        });
      const swarm = this._swarmMap.get(swarmName);
      if (!swarm) {
        throw new Error(`agent-swarm swarm ${swarmName} not found`);
      }
      if (!swarm.agentList.includes(swarm.defaultAgent)) {
        throw new Error(
          `agent-swarm swarm ${swarmName} default agent not in agent list`
        );
      }
      swarm.agentList.forEach((agentName) =>
        this.agentValidationService.validate(agentName, source)
      );
      return {} as unknown as void;
    }
  ) as (swarmName: SwarmName, source: string) => void;
}

export default SwarmValidationService;
