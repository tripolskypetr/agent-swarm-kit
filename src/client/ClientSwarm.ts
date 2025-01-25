import { queued, Subject } from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { AgentName, IAgent } from "../interfaces/Agent.interface";
import ISwarm, { ISwarmParams } from "../interfaces/Swarm.interface";

const AGENT_REF_CHANGED = Symbol('agent-ref-changed');

export class ClientSwarm implements ISwarm {

  private _agentChangedSubject = new Subject<void>();

  private _activeAgent: AgentName;

  constructor(readonly params: ISwarmParams) {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} CTOR`, {
      params,
    })
    this._activeAgent = params.defaultAgent;
  }

  waitForOutput = queued(async (): Promise<string> => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} waitForOutput`);
    const START_TIME = Date.now();
    while (true) {
      if (Date.now() - START_TIME >= GLOBAL_CONFIG.CC_ANSWER_TIMEOUT_SECONDS) {
        throw new Error(
          `agent-swarm ClientSwarm waitForOutput timeout reached for ${this.params.swarmName}`
        );
      }
      const [agentName, output] = await Promise.race([
        ...Object.entries(this.params.agentMap).map(async ([agentName, agent]) => [
          agentName,
          await agent.waitForOutput(),
        ]),
        this._agentChangedSubject.toPromise().then(() => [AGENT_REF_CHANGED as never]),
      ]);
      if (agentName === AGENT_REF_CHANGED as never) {
        continue;
      }
      if (agentName === (await this.getAgentName())) {
        return output;
      }
    }
  }) as () => Promise<string>;

  getAgentName = async (): Promise<AgentName> => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgentName`);
    return this._activeAgent;
  };

  getAgent = async () => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgent`);
    const agent = await this.getAgentName();
    return this.params.agentMap[agent];
  };

  setAgentRef = async (agentName: AgentName, agent: IAgent) => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentRef agentName=${agentName}`);
    if (!this.params.agentMap[agentName]) {
      throw new Error(`agent-swarm agent ${agentName} not in the swarm`);
    }
    this.params.agentMap[agentName] = agent;
    await this._agentChangedSubject.next();
  };

  setAgentName = async (agentName: AgentName) => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentName agentName=${agentName}`);
    this._activeAgent = agentName;
  };
}

export default ClientSwarm;
