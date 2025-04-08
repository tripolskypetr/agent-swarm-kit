import { addAgent, addSwarm, Operator, OperatorInstance } from "agent-swarm-kit";

import { watchMessages } from "../utils/watchMessages";
import { saveMessage } from "../utils/saveMessage";

export enum AgentName {
    OperatorAgent = "operator_agent"
}

export enum SwarmName {
    RootSwarm = "root_swarm"
}

Operator.useOperatorAdapter(class extends OperatorInstance {

    _disposeFn: Function | null = null;

    async init() {
        this._disposeFn = watchMessages(this.clientId, async (message) => {
            await this.answer(message);
        });
        await super.init();
    }

    /**
     * Used when operator takes initiative and send message first.
     * When user send question first, the next operator message will trigger 
     * the answer method instead
     * 
     * The answer method is working automatically sending the last incoming operator message to the client
     * The notify method should be overriten to send the message to client using prefered transport
     * like `listenEvent` or `notify` for `makeConnection` 
     */
    async notify(content: string) {
        {
            console.log(content);
            console.log()
        }
        await super.notify(content);
    }

    async recieveMessage(message: string) {
        await saveMessage(this.clientId, message);
        await super.recieveMessage(message);
    }

    async dispose(): Promise<void> {
        this._disposeFn && this._disposeFn();
        await super.dispose();
    }
});

addAgent({
    agentName: AgentName.OperatorAgent,
    operator: true,
})

addSwarm({
    swarmName: SwarmName.RootSwarm,
    agentList: [AgentName.OperatorAgent],
    defaultAgent: AgentName.OperatorAgent,
});
