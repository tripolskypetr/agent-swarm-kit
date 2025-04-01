import {
    Adapter,
    addAgent,
    addCompletion,
    addSwarm,
    addTool,
    commitToolOutput,
    emit,
} from "agent-swarm-kit";
import { singleshot, str } from "functools-kit";
import OpenAI from "openai";

const getOpenAI = singleshot(
    () => new OpenAI({ baseURL: "http://127.0.0.1:1338/v1", apiKey: "noop" })
);

export enum CompletionName {
    VLLMCompletion = "vllm_completion",
}

export enum AgentName {
    TestAgent = "test_agent",
}

export enum ToolName {
    AddToCartTool = `add_to_cart_tool`,
}

export enum SwarmName {
    TestSwarm = "test_swarm",
}

addCompletion({
    completionName: CompletionName.VLLMCompletion,
    getCompletion: Adapter.fromOpenAI(getOpenAI(), "yagpt"),
});

addAgent({
    docDescription: "This agent acts as a pharmaceutical seller, providing consultations about pharma products to users, utilizing the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for responses, and calling the add-to-cart tool only when necessary to assist with purchases.",
    agentName: AgentName.TestAgent,
    completion: CompletionName.VLLMCompletion,
    prompt: str.newline(
        "You are the pharma seller agent.",
        "Provide me the consultation about the pharma product",
        "Call the tools only when necessary, if not required, just speak with users"
    ),
    system: [
        `To add the pharma product to the cart call the next tool: ${ToolName.AddToCartTool}`,
    ],
    tools: [ToolName.AddToCartTool],
    dependsOn: [],
});

addTool({
    docNote: "This tool enables adding a pharmaceutical product to the cart by taking a product title as input, logging the action for debugging, and notifying the user of successful addition through both tool output and an emitted message. It integrates with the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for agent-driven interactions.",
    toolName: ToolName.AddToCartTool,
    validate: async ({ params }) => true,
    call: async ({ toolId, clientId, agentName, params }) => {
        console.log(ToolName.AddToCartTool, params);
        await commitToolOutput(
            toolId,
            `Pharma product ${params.title} added successfully. `,
            clientId,
            agentName
        );
        await emit(`The product ${params.title} has been added to your cart.`, clientId, agentName);
    },
    type: "function",
    function: {
        name: ToolName.AddToCartTool,
        description: "Add the pharma product to cart",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: `Name of pharma product to be appended to cart`,
                },
            },
            required: [],
        },
    },
});

addSwarm({
    docDescription: "This swarm serves as a testing environment for a single-agent system, incorporating the TestAgent as both the sole member and default agent to handle pharmaceutical sales interactions via a WebSocket-based interface, leveraging the YandexGPT-5-Lite-8B-instruct-GGUF model running under vLLM for its responses, while also defining Nemotron Mini and Gemma3 Tools completions that remain available for potential future use or alternative agent configurations.",
    swarmName: SwarmName.TestSwarm,
    agentList: [AgentName.TestAgent],
    defaultAgent: AgentName.TestAgent,
});