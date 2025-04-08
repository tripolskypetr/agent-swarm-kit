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
        console.log(content);
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
    docDescription: "This agent, named operator_agent, operates within an AI consulting swarm, redirecting interactions to the operator dashboard using a Firebase Realtime-implemented connection bus, enabling seamless human assistance when customers request it.",
    agentName: AgentName.OperatorAgent,
    operator: true,
});

addSwarm({
    docDescription: "This swarm, named root_swarm, forms the backbone of an AI consulting swarm, utilizing a single operator_agent as both its sole member and default agent, leveraging a Firebase Realtime-driven connection bus to redirect customer interactions to the operator dashboard for human assistance when needed.",
    swarmName: SwarmName.RootSwarm,
    agentList: [AgentName.OperatorAgent],
    defaultAgent: AgentName.OperatorAgent,
});