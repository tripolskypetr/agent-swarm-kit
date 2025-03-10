import {
  cancelable,
  CANCELED_PROMISE_SYMBOL,
  createAwaiter,
  queued,
  Subject,
} from "functools-kit";
import { GLOBAL_CONFIG } from "../config/params";
import { AgentName, IAgent } from "../interfaces/Agent.interface";
import ISwarm, { ISwarmParams } from "../interfaces/Swarm.interface";
import { IBusEvent } from "../model/Event.model";

const AGENT_NEED_FETCH = Symbol("agent-need-fetch");
const STACK_NEED_FETCH = Symbol("stack-need-fetch");

const WAIT_FOR_OUTPUT_FN = async (self: ClientSwarm): Promise<string> => {
  GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientSwarm swarmName=${self.params.swarmName} clientId=${self.params.clientId} waitForOutput`
    );

  const [awaiter, { resolve }] = createAwaiter<{
    agentName: AgentName;
    output: string;
  }>();

  const getOutput = cancelable(
    async () =>
      await Promise.race(
        self._agentList
          .map(async ([agentName, agent]) => ({
            agentName,
            output: await agent.waitForOutput(),
          }))
          .concat(self._cancelOutputSubject.toPromise())
      )
  );

  const handleOutput = () => {
    getOutput.cancel();
    getOutput().then((value) => {
      if (value === CANCELED_PROMISE_SYMBOL) {
        return;
      }
      resolve(value);
    });
  };

  const un = self._agentChangedSubject.subscribe(handleOutput);
  handleOutput();

  const { agentName, output } = await awaiter;
  un();

  const expectAgent = await self.getAgentName();

  agentName !== expectAgent &&
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
    self.params.logger.debug(
      `ClientSwarm swarmName=${self.params.swarmName} clientId=${self.params.clientId} waitForAgent agent miss`,
      { agentName, expectAgent }
    );

  await self.params.bus.emit<IBusEvent>(self.params.clientId, {
    type: "wait-for-output",
    source: "swarm-bus",
    input: {},
    output: {
      result: output,
    },
    context: {
      swarmName: self.params.swarmName,
    },
    clientId: self.params.clientId,
  });

  return output;
};

/**
 * ClientSwarm class implements the ISwarm interface and manages agents within a swarm.
 */
export class ClientSwarm implements ISwarm {
  _agentChangedSubject = new Subject<[agentName: AgentName, agent: IAgent]>();

  _activeAgent: AgentName | typeof AGENT_NEED_FETCH = AGENT_NEED_FETCH;
  _navigationStack: AgentName[] | typeof STACK_NEED_FETCH = STACK_NEED_FETCH;

  _cancelOutputSubject = new Subject<{
    agentName: string;
    output: string;
  }>();

  get _agentList() {
    return Object.entries(this.params.agentMap);
  }

  /**
   * Creates an instance of ClientSwarm.
   * @param {ISwarmParams} params - The parameters for the swarm.
   */
  constructor(readonly params: ISwarmParams) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} CTOR`,
        {
          params,
        }
      );
  }

  /**
   * Pop the navigation stack or return default agent
   * @returns {Promise<string>} - The pending agent for navigation
   */
  async navigationPop() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} navigationPop`
      );
    if (this._navigationStack === STACK_NEED_FETCH) {
      this._navigationStack = await this.params.getNavigationStack(
        this.params.clientId,
        this.params.swarmName
      );
    }
    const prevAgent = this._navigationStack.pop();
    await this.params.setNavigationStack(
      this.params.clientId,
      this._navigationStack,
      this.params.swarmName
    );
    return prevAgent ? prevAgent : this.params.defaultAgent;
  }

  /**
   * Cancel the await of output by emit of empty string
   * @returns {Promise<string>} - The output from the active agent.
   */
  async cancelOutput() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} cancelOutput`
      );
    await this._cancelOutputSubject.next({
      agentName: await this.getAgentName(),
      output: "",
    });
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "cancel-output",
      source: "swarm-bus",
      input: {},
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
  }

  /**
   * Waits for output from the active agent.
   * @returns {Promise<string>} - The output from the active agent.
   */
  waitForOutput = queued(
    async () => await WAIT_FOR_OUTPUT_FN(this)
  ) as () => Promise<string>;

  /**
   * Gets the name of the active agent.
   * @returns {Promise<AgentName>} - The name of the active agent.
   */
  async getAgentName(): Promise<AgentName> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgentName`
      );
    if (this._activeAgent === AGENT_NEED_FETCH) {
      this._activeAgent = await this.params.getActiveAgent(
        this.params.clientId,
        this.params.swarmName,
        this.params.defaultAgent
      );
    }
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "get-agent-name",
      source: "swarm-bus",
      input: {},
      output: {
        activeAgent: this._activeAgent,
      },
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return this._activeAgent;
  }

  /**
   * Gets the active agent.
   * @returns {Promise<IAgent>} - The active agent.
   */
  async getAgent() {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgent`
      );
    const agent = await this.getAgentName();
    const result = this.params.agentMap[agent];
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "get-agent",
      source: "swarm-bus",
      input: {
        result,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    return result;
  }

  /**
   * Sets the reference of an agent in the swarm.
   * @param {AgentName} agentName - The name of the agent.
   * @param {IAgent} agent - The agent instance.
   * @throws {Error} - If the agent is not in the swarm.
   */
  async setAgentRef(agentName: AgentName, agent: IAgent) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentRef agentName=${agentName}`
      );
    if (!this.params.agentMap[agentName]) {
      throw new Error(`agent-swarm agent ${agentName} not in the swarm`);
    }
    this.params.agentMap[agentName] = agent;
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "set-agent-ref",
      source: "swarm-bus",
      input: {
        agentName,
        agent,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
    await this._agentChangedSubject.next([agentName, agent]);
  }

  /**
   * Sets the active agent by name.
   * @param {AgentName} agentName - The name of the agent to set as active.
   */
  async setAgentName(agentName: AgentName) {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} setAgentName agentName=${agentName}`
      );
    this._activeAgent = agentName;
    await this.params.setActiveAgent(
      this.params.clientId,
      agentName,
      this.params.swarmName
    );
    if (this.params.callbacks?.onAgentChanged) {
      this.params.callbacks.onAgentChanged(
        this.params.clientId,
        agentName,
        this.params.swarmName
      );
    }
    if (this._navigationStack === STACK_NEED_FETCH) {
      this._navigationStack = await this.params.getNavigationStack(
        this.params.clientId,
        this.params.swarmName
      );
    }
    this._navigationStack.push(agentName);
    await this.params.setNavigationStack(
      this.params.clientId,
      this._navigationStack,
      this.params.swarmName
    );
    await this.params.bus.emit<IBusEvent>(this.params.clientId, {
      type: "set-agent-name",
      source: "swarm-bus",
      input: {
        agentName,
      },
      output: {},
      context: {
        swarmName: this.params.swarmName,
      },
      clientId: this.params.clientId,
    });
  }
}

export default ClientSwarm;
