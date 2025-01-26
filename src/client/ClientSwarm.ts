import { queued, Subject } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { AgentName, IAgent } from "../interfaces/Agent.interface";
import ISwarm, { ISwarmParams } from "../interfaces/Swarm.interface";

const AGENT_REF_CHANGED = Symbol("agent-ref-changed");
const AGENT_NEED_FETCH = Symbol("agent-need-fetch");

/**
 * ClientSwarm class implements the ISwarm interface and manages agents within a swarm.
 */
export class ClientSwarm implements ISwarm {
  private _agentChangedSubject = new Subject<void>();

  private _activeAgent: AgentName | typeof AGENT_NEED_FETCH = AGENT_NEED_FETCH;

  /**
   * Creates an instance of ClientSwarm.
   * @param {ISwarmParams} params - The parameters for the swarm.
   */
  constructor(readonly params: ISwarmParams) {
    this.params.logger.debug(
      `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} CTOR`,
      {
        params,
      }
    );
  }

  /**
   * Waits for output from the active agent.
   * @returns {Promise<string>} - The output from the active agent.
   * @throws {Error} - If the timeout is reached.
   */
  waitForOutput = queued(async (): Promise<string> => {
    this.params.logger.debug(
      `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} waitForOutput`
    );
    const START_TIME = Date.now();
    while (true) {
      if (Date.now() - START_TIME >= GLOBAL_CONFIG.CC_ANSWER_TIMEOUT_SECONDS) {
        throw new Error(
          `agent-swarm ClientSwarm waitForOutput timeout reached for ${this.params.swarmName}`
        );
      }
      const [agentName, output] = await Promise.race([
        ...Object.entries(this.params.agentMap).map(
          async ([agentName, agent]) => [agentName, await agent.waitForOutput()]
        ),
        this._agentChangedSubject
          .toPromise()
          .then(() => [AGENT_REF_CHANGED as never]),
      ]);
      if (agentName === (AGENT_REF_CHANGED as never)) {
        continue;
      }
      if (agentName === (await this.getAgentName())) {
        return output;
      }
    }
  }) as () => Promise<string>;

  /**
   * Gets the name of the active agent.
   * @returns {Promise<AgentName>} - The name of the active agent.
   */
  getAgentName = async (): Promise<AgentName> => {
    this.params.logger.debug(
      `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgentName`
    );
    if (this._activeAgent === AGENT_NEED_FETCH) {
      this._activeAgent = await GLOBAL_CONFIG.CC_SWARM_DEFAULT_AGENT(
        this.params.clientId,
        this.params.swarmName,
        this.params.defaultAgent
      );
    }
    return this._activeAgent;
  };

  /**
   * Gets the active agent.
   * @returns {Promise<IAgent>} - The active agent.
   */
  getAgent = async () => {
    this.params.logger.debug(
      `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgent`
    );
    const agent = await this.getAgentName();
    return this.params.agentMap[agent];
  };

  /**
   * Sets the reference of an agent in the swarm.
   * @param {AgentName} agentName - The name of the agent.
   * @param {IAgent} agent - The agent instance.
   * @throws {Error} - If the agent is not in the swarm.
   */
  setAgentRef = async (agentName: AgentName, agent: IAgent) => {
    this.params.logger.debug(
      `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentRef agentName=${agentName}`
    );
    if (!this.params.agentMap[agentName]) {
      throw new Error(`agent-swarm agent ${agentName} not in the swarm`);
    }
    this.params.agentMap[agentName] = agent;
    await this._agentChangedSubject.next();
  };

  /**
   * Sets the active agent by name.
   * @param {AgentName} agentName - The name of the agent to set as active.
   */
  setAgentName = async (agentName: AgentName) => {
    this.params.logger.debug(
      `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentName agentName=${agentName}`
    );
    this._activeAgent = agentName;
    await this.params.onAgentChanged(
      this.params.clientId,
      agentName,
      this.params.swarmName
    );
  };
}

export default ClientSwarm;
