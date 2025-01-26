import { AgentName, IAgent } from "../interfaces/Agent.interface";
import { ILogger } from "../interfaces/Logger.interface";

/**
 * Parameters for initializing a swarm.
 * @interface
 * @extends {Omit<ISwarmSchema, 'agentList'>}
 */
export interface ISwarmParams extends Omit<ISwarmSchema, keyof {
  agentList: never;
}> {
  /** Client identifier */
  clientId: string;
  /** Logger instance */
  logger: ILogger;
  /** Map of agent names to agent instances */
  agentMap: Record<AgentName, IAgent>;
  /** Emit the callback on agent change */
  onAgentChanged(clientId: string, agentName: AgentName, swarmName: SwarmName): Promise<void>;
}

/**
 * Schema for defining a swarm.
 * @interface
 */
export interface ISwarmSchema {
  /** Default agent name */
  defaultAgent: AgentName;
  /** Name of the swarm */
  swarmName: string;
  /** List of agent names */
  agentList: string[];
}

/**
 * Interface for a swarm.
 * @interface
 */
export interface ISwarm {
  /**
   * Waits for the output from the swarm.
   * @returns {Promise<string>} The output from the swarm.
   */
  waitForOutput(): Promise<string>;

  /**
   * Gets the name of the agent.
   * @returns {Promise<AgentName>} The name of the agent.
   */
  getAgentName(): Promise<AgentName>;

  /**
   * Gets the agent instance.
   * @returns {Promise<IAgent>} The agent instance.
   */
  getAgent(): Promise<IAgent>;

  /**
   * Sets the reference to an agent.
   * @param {AgentName} agentName - The name of the agent.
   * @param {IAgent} agent - The agent instance.
   * @returns {Promise<void>}
   */
  setAgentRef(agentName: AgentName, agent: IAgent): Promise<void>;

  /**
   * Sets the name of the agent.
   * @param {AgentName} agentName - The name of the agent.
   * @returns {Promise<void>}
   */
  setAgentName(agentName: AgentName): Promise<void>;
}

/** Type alias for swarm name */
export type SwarmName = string;

export default ISwarm;
