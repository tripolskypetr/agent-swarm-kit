import { sleep } from "functools-kit";
import { GLOBAL_CONFIG } from "src/config/params";
import { AgentName, IAgent } from "src/interfaces/Agent.interface";
import ISwarm, { ISwarmParams } from "src/interfaces/Swarm.interface";

export class ClientSwarm implements ISwarm {
  private _activeAgent: AgentName;

  constructor(readonly params: ISwarmParams) {
    this._activeAgent = params.defaultAgent;
  }

  waitForOutput = async (): Promise<string> => {
    this.params.logger.debug("BaseConnection waitForOutput");
    const START_TIME = Date.now();
    while (true) {
      const elapsedTime = Date.now() - START_TIME;
      if (elapsedTime >= GLOBAL_CONFIG.CC_ANSWER_TIMEOUT_SECONDS) {
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
      await sleep(1_000);
    }
  };

  getAgentName = async (): Promise<AgentName> => {
    this.params.logger.debug(`ClientSwarm getAgentName`);
    return this._activeAgent;
  };

  getAgent = async () => {
    this.params.logger.debug(`ClientSwarm getAgent`);
    const agent = await this.getAgentName();
    return this.params.agentMap[agent];
  };

  setAgentName = async (agentName: AgentName) => {
    this.params.logger.debug(`ClientSwarm setAgentName agentName=${agentName}`);
    this._activeAgent = agentName;
  };
}

export default ClientSwarm;
