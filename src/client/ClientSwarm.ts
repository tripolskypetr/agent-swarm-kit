import { Subject } from "functools-kit";
import { AgentName, IAgent } from "src/interfaces/Agent.interface";
import ISwarm, { ISwarmParams } from "src/interfaces/Swarm.interface";

export class ClientSwarm implements ISwarm {
  
  private _activeAgent: AgentName;  
  readonly _agentList: IAgent[];

  constructor(readonly params: ISwarmParams) {
    this._activeAgent = params.defaultAgent;
    this._agentList = Object.values(params.agentMap);
  }

  waitForOutput = async (): Promise<string> => {
    this.params.logger.debug("BaseConnection waitForOutput");
    return await Promise.race(
      this._agentList.map(async (agent) => await agent.waitForOutput())
    );
  };

  getAgentName = async (): Promise<AgentName> => {
    this.params.logger.debug(
      `ClientSwarm getAgentName`
    );
    return this._activeAgent;
  };

  getAgent = async () => {
    this.params.logger.debug(
      `ClientSwarm getAgent`
    );
    const agent = await this.getAgentName();
    return this.params.agentMap[agent];
  };

  setAgentName = async (agentName: AgentName) => {
    this.params.logger.debug(
      `ClientSwarm setAgentName agentName=${agentName}`
    );
    this._activeAgent = agentName;
  };
}

export default ClientSwarm;
