import { GLOBAL_CONFIG } from "../config/params";
import { AgentName } from "../interfaces/Agent.interface";
import ISwarm, { ISwarmParams } from "../interfaces/Swarm.interface";

export class ClientSwarm implements ISwarm {
  private _activeAgent: AgentName;

  constructor(readonly params: ISwarmParams) {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} CTOR`)
    this._activeAgent = params.defaultAgent;
  }

  waitForOutput = async (): Promise<string> => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} waitForOutput`);
    const START_TIME = Date.now();
    while (true) {
      if (Date.now() - START_TIME >= GLOBAL_CONFIG.CC_ANSWER_TIMEOUT_SECONDS) {
        throw new Error(
          `agent-swarm ClientSwarm waitForOutput timeout reached for ${this.params.swarmName}`
        );
      }
      const [agentName, output] = await Promise.race(
        Object.entries(this.params.agentMap).map(async ([agentName, agent]) => [
          agentName,
          await agent.waitForOutput(),
        ])
      );
      if (agentName === (await this.getAgentName())) {
        return output;
      }
    }
  };

  getAgentName = async (): Promise<AgentName> => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgentName`);
    return this._activeAgent;
  };

  getAgent = async () => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgent`);
    const agent = await this.getAgentName();
    return this.params.agentMap[agent];
  };

  setAgentName = async (agentName: AgentName) => {
    this.params.logger.debug(`ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentName agentName=${agentName}`);
    this._activeAgent = agentName;
  };
}

export default ClientSwarm;
