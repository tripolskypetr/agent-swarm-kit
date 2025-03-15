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

/**
 * Waits for output from an agent in the swarm, handling cancellation and agent changes.
 * Resolves with the output from the active agent or an empty string if canceled.
 * @param {ClientSwarm} self - The ClientSwarm instance.
 * @returns {Promise<string>} The output from the active agent.
 * @private
 */
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
 * Manages a collection of agents within a swarm, handling agent switching, output waiting, and navigation.
 * @implements {ISwarm}
 */
export class ClientSwarm implements ISwarm {
  /**
   * Subject that emits when an agent reference changes, providing the agent name and instance.
   */
  _agentChangedSubject = new Subject<[agentName: AgentName, agent: IAgent]>();

  /**
   * The name of the currently active agent, or a symbol indicating it needs to be fetched.
   */
  _activeAgent: AgentName | typeof AGENT_NEED_FETCH = AGENT_NEED_FETCH;

  /**
   * The navigation stack of agent names, or a symbol indicating it needs to be fetched.
   */
  _navigationStack: AgentName[] | typeof STACK_NEED_FETCH = STACK_NEED_FETCH;

  /**
   * Subject that emits to cancel output waiting, providing an empty output string.
   */
  _cancelOutputSubject = new Subject<{
    agentName: string;
    output: string;
  }>();

  /**
   * Getter for the list of agent name-agent pairs from the agent map.
   * @returns {[string, IAgent][]} An array of tuples containing agent names and their instances.
   */
  get _agentList(): [string, IAgent][] {
    return Object.entries(this.params.agentMap);
  }

  /**
   * Creates an instance of ClientSwarm.
   * @param {ISwarmParams} params - The parameters for initializing the swarm, including agent map and callbacks.
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
   * Pops the most recent agent from the navigation stack or returns the default agent if empty.
   * Updates the persisted navigation stack.
   * @returns {Promise<string>} The name of the previous agent, or the default agent if the stack is empty.
   */
  async navigationPop(): Promise<string> {
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
   * Cancels the current output wait by emitting an empty string via the cancel subject.
   * @returns {Promise<void>} A promise that resolves when the cancellation is complete.
   */
  async cancelOutput(): Promise<void> {
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
   * Waits for output from the active agent in a queued manner.
   * Handles cancellation and agent changes, ensuring only one wait operation at a time.
   * @returns {Promise<string>} The output from the active agent, or an empty string if canceled.
   */
  waitForOutput = queued(
    async (): Promise<string> => await WAIT_FOR_OUTPUT_FN(this)
  ) as () => Promise<string>;

  /**
   * Retrieves the name of the active agent, fetching it if not yet loaded.
   * Emits an event with the result.
   * @returns {Promise<AgentName>} The name of the active agent.
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
   * Retrieves the active agent instance based on its name.
   * Emits an event with the result.
   * @returns {Promise<IAgent>} The active agent instance.
   */
  async getAgent(): Promise<IAgent> {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_DEBUG &&
      this.params.logger.debug(
        `ClientSwarm swarmName=${this.params.swarmName} clientId=${this.params.clientId} getAgent`
      );
    const agentName = await this.getAgentName();
    const result = this.params.agentMap[agentName];
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
   * Updates the reference to an agent in the swarm's agent map.
   * Notifies subscribers via the agent changed subject.
   * @param {AgentName} agentName - The name of the agent to update.
   * @param {IAgent} agent - The new agent instance.
   * @throws {Error} If the agent name is not found in the swarm's agent map.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  async setAgentRef(agentName: AgentName, agent: IAgent): Promise<void> {
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
   * Sets the active agent by name, updates the navigation stack, and persists the change.
   * Invokes the onAgentChanged callback if provided.
   * @param {AgentName} agentName - The name of the agent to set as active.
   * @returns {Promise<void>} A promise that resolves when the agent is set and persisted.
   */
  async setAgentName(agentName: AgentName): Promise<void> {
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
