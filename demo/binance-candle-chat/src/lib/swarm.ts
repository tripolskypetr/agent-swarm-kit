import {
    Adapter,
    addAgent,
    addCompletion,
    addSwarm,
    addTool,
    changeToAgent,
    changeToDefaultAgent,
    commitToolOutput,
    commitToolOutputForce,
    emit,
    execute,
    executeForce,
    setConfig,
} from "agent-swarm-kit";
import { str } from "functools-kit";
import OpenAI from "openai";
import { candles } from "../api/candles";
import { calculateBuyUSDT } from "../api/calculateBuyUSDT";

export enum SwarmName {
    TradingSwarm = "trading_swarm",
}

enum CompletionName {
    OpenAiCompletion = "openai_completion",
}

enum AgentName {
    TriageAgent = "triage_agent",
    BtcTraderAgent = "btc_trader_agent",
    EthTraderAgent = "eth_trader_agent",
    BnbTraderAgent = "bnb_trader_agent",
    XrpTraderAgent = "xrp_trader_agent",
    SolTraderAgent = "sol_trader_agent",
}

enum ToolName {
    CalculateBuyPriceQuantityTool = "calculate_buy_price_quantity_tool",
    CalculateSellPriceQuantityTool = "calculate_sell_price_quantity_tool",
    CalculateMarketTrendTool = "calculate_market_trend_tool",
    NavigateToTriageTool = "navigate_to_triage_tool",
    NavigateToBtcTraderTool = "navigate_to_btc_trader_tool",
    NavigateToEthTraderTool = "navigate_to_eth_trader_tool",
    NavigateToBnbTraderTool = "navigate_to_bnb_trader_tool",
    NavigateToXrpTraderTool = "navigate_to_xrp_trader_tool",
    NavigateToSolTraderTool = "navigate_to_sol_trader_tool",
}

const AgentCoinMap: Record<string, string> = {
    [AgentName.BtcTraderAgent]: "BTC",
    [AgentName.EthTraderAgent]: "ETH",
    [AgentName.BnbTraderAgent]: "BNB",
    [AgentName.XrpTraderAgent]: "XRP",
    [AgentName.SolTraderAgent]: "SOL",
};

const PREDICT_SYSTEM_PROMPT = str.newline(
    "When user ask for cryptocurrency trend prediction:",
    " - You are a cryptocurrency trader. Write a strategy about long term and short term investments for Bitcoin",
    " - Do not ask for specific information for the crypto trend prediction, the candles data is all you have",
    ` - The last 7 days cryptocurrency candles are in last tool output message of that conversation`,
    " - Predict like UP or DOWN (no other detail)."
);

const NAVIGATION_TRIAGE_SYSTEM_PROMPT = str.newline(
    "Agent Navigation Guidelines:",
    "- For Bitcoin trading queries, navigate to BTC Trader Agent",
    "- For Ethereum trading queries, navigate to ETH Trader Agent",
    "- For Binance Coin trading queries, navigate to BNB Trader Agent",
    "- For Ripple trading queries, navigate to XRP Trader Agent",
    "- For Solana trading queries, navigate to SOL Trader Agent"
);

const NAVIGATION_TRADER_SYSTEM_PROMPT = str.newline(
    "Agent Navigation Guidelines:",
    "If user is not interested in dedicated cryptocurrency navigate him back to triage agent"
);

setConfig({
    CC_PERSIST_ENABLED_BY_DEFAULT: false,
});

addCompletion({
    completionName: CompletionName.OpenAiCompletion,
    getCompletion: Adapter.fromOpenAI(
        new OpenAI({ apiKey: process.env.CC_OPENAI_API_KEY })
    ),
});

// Define Agents
addAgent({
    agentName: AgentName.BtcTraderAgent,
    docDescription:
        "This agent specializes in Bitcoin trading, predicting trends and assisting with buy/sell actions based on candle data.",
    completion: CompletionName.OpenAiCompletion,
    prompt: `You are the Bitcoin AI trader. Predict the current trend and help the user to buy or sell bitcoin using related tools`,
    system: [PREDICT_SYSTEM_PROMPT, NAVIGATION_TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.EthTraderAgent,
    docDescription:
        "This agent specializes in Ethereum trading, predicting trends and assisting with buy/sell actions based on candle data.",
    completion: CompletionName.OpenAiCompletion,
    prompt: `You are the Ethereum AI trader. Predict the current trend and help the user to buy or sell ethereum using related tools`,
    system: [PREDICT_SYSTEM_PROMPT, NAVIGATION_TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.BnbTraderAgent,
    docDescription:
        "This agent specializes in Binance Coin trading, predicting trends and assisting with buy/sell actions based on candle data.",
    completion: CompletionName.OpenAiCompletion,
    prompt: `You are the Binance Coin AI trader. Predict the current trend and help the user to buy or sell bnb using related tools`,
    system: [PREDICT_SYSTEM_PROMPT, NAVIGATION_TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.XrpTraderAgent,
    docDescription:
        "This agent specializes in Ripple trading, predicting trends and assisting with buy/sell actions based on candle data.",
    completion: CompletionName.OpenAiCompletion,
    prompt: `You are the Ripple AI trader. Predict the current trend and help the user to buy or sell xrp using related tools`,
    system: [PREDICT_SYSTEM_PROMPT, NAVIGATION_TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.SolTraderAgent,
    docDescription:
        "This agent specializes in Solana trading, predicting trends and assisting with buy/sell actions based on candle data.",
    completion: CompletionName.OpenAiCompletion,
    prompt: `You are the Solana Coin AI trader. Predict the current trend and help the user to buy or sell solana using related tools`,
    system: [PREDICT_SYSTEM_PROMPT, NAVIGATION_TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

// Navigation Tools
addTool({
    docNote:
        "This tool directs the user to the BTC Trader Agent for Bitcoin trading queries, passing optional context for a tailored response.",
    toolName: ToolName.NavigateToBtcTraderTool,
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(ToolName.NavigateToBtcTraderTool, { params });
        await commitToolOutputForce(
            toolId,
            "Navigation to BTC Trader Agent successful",
            clientId
        );
        await changeToAgent(AgentName.BtcTraderAgent, clientId);
        await executeForce(
            params?.context
                ? `Continue conversation with user based on the next context: ${params?.context}`
                : "Continue conversation with user",
            clientId
        );
    },
    function: {
        name: ToolName.NavigateToBtcTraderTool,
        description:
            "Switch to the BTC Trader Agent to assist with Bitcoin trading queries.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the BTC Trader Agent",
                },
            },
            required: [],
        },
    },
});

addTool({
    docNote:
        "This tool directs the user to the ETH Trader Agent for Ethereum trading queries, passing optional context for a tailored response.",
    toolName: ToolName.NavigateToEthTraderTool,
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(ToolName.NavigateToEthTraderTool, { params });
        await commitToolOutputForce(
            toolId,
            "Navigation to ETH Trader Agent successful",
            clientId
        );
        await changeToAgent(AgentName.EthTraderAgent, clientId);
        await executeForce(
            params?.context
                ? `Continue conversation with user based on the next context: ${params?.context}`
                : "Continue conversation with user",
            clientId
        );
    },
    function: {
        name: ToolName.NavigateToEthTraderTool,
        description:
            "Switch to the ETH Trader Agent to assist with Ethereum trading queries.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the ETH Trader Agent",
                },
            },
            required: [],
        },
    },
});

addTool({
    docNote:
        "This tool directs the user to the BNB Trader Agent for Binance Coin trading queries, passing optional context for a tailored response.",
    toolName: ToolName.NavigateToBnbTraderTool,
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(ToolName.NavigateToBnbTraderTool, { params });
        await commitToolOutputForce(
            toolId,
            "Navigation to BNB Trader Agent successful",
            clientId
        );
        await changeToAgent(AgentName.BnbTraderAgent, clientId);
        await executeForce(
            params?.context
                ? `Continue conversation with user based on the next context: ${params?.context}`
                : "Continue conversation with user",
            clientId
        );
    },
    function: {
        name: ToolName.NavigateToBnbTraderTool,
        description:
            "Switch to the BNB Trader Agent to assist with Binance Coin trading queries.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the BNB Trader Agent",
                },
            },
            required: [],
        },
    },
});

addTool({
    docNote:
        "This tool directs the user to the XRP Trader Agent for Ripple trading queries, passing optional context for a tailored response.",
    toolName: ToolName.NavigateToXrpTraderTool,
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(ToolName.NavigateToXrpTraderTool, { params });
        await commitToolOutputForce(
            toolId,
            "Navigation to XRP Trader Agent successful",
            clientId
        );
        await changeToAgent(AgentName.XrpTraderAgent, clientId);
        await executeForce(
            params?.context
                ? `Continue conversation with user based on the next context: ${params?.context}`
                : "Continue conversation with user",
            clientId
        );
    },
    function: {
        name: ToolName.NavigateToXrpTraderTool,
        description:
            "Switch to the XRP Trader Agent to assist with Ripple trading queries.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the XRP Trader Agent",
                },
            },
            required: [],
        },
    },
});

addTool({
    docNote:
        "This tool directs the user to the SOL Trader Agent for Solana trading queries, passing optional context for a tailored response.",
    toolName: ToolName.NavigateToSolTraderTool,
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(ToolName.NavigateToSolTraderTool, { params });
        await commitToolOutputForce(
            toolId,
            "Navigation to SOL Trader Agent successful",
            clientId
        );
        await changeToAgent(AgentName.SolTraderAgent, clientId);
        await executeForce(
            params?.context
                ? `Continue conversation with user based on the next context: ${params?.context}`
                : "Continue conversation with user",
            clientId
        );
    },
    function: {
        name: ToolName.NavigateToSolTraderTool,
        description:
            "Switch to the SOL Trader Agent to assist with Solana trading queries.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass to the SOL Trader Agent",
                },
            },
            required: [],
        },
    },
});

// Updated Triage Agent with Navigation Tools
addAgent({
    agentName: AgentName.TriageAgent,
    docDescription:
        "This agent acts as the central routing hub for cryptocurrency trading queries, directing users to the appropriate trader agent based on the requested cryptocurrency.",
    completion: CompletionName.OpenAiCompletion,
    system: [
        str.newline([
            "Triage Agent:",
            "- Carefully analyze incoming user requests.",
            "- Determine the most appropriate cryptocurrency trader agent to handle the query.",
            "- Provide context and key details to the selected agent.",
            "- Ensure smooth routing of requests across different cryptocurrencies.",
        ]),
        NAVIGATION_TRIAGE_SYSTEM_PROMPT,
    ],
    prompt: str.newline([
        "You are the triage agent of the AI trading system",
        "Analyze the following user request and determine the most suitable cryptocurrency trader agent",
        "Output the exact agent name that best matches the request.",
    ]),
    tools: [
        ToolName.NavigateToBtcTraderTool,
        ToolName.NavigateToEthTraderTool,
        ToolName.NavigateToBnbTraderTool,
        ToolName.NavigateToXrpTraderTool,
        ToolName.NavigateToSolTraderTool,
    ],
    dependsOn: [
        AgentName.BtcTraderAgent,
        AgentName.EthTraderAgent,
        AgentName.BnbTraderAgent,
        AgentName.XrpTraderAgent,
        AgentName.SolTraderAgent,
    ],
});

addTool({
    toolName: ToolName.CalculateMarketTrendTool,
    docNote:
        "This tool retrieves the last 7 days of candle data for a specific cryptocurrency and triggers an analysis to determine market trends, assisting the agent in providing buy or sell recommendations based on the coin's recent performance.",
    type: 'function',
    call: async ({ clientId, toolId, agentName, params }) => {
        const coin = AgentCoinMap[agentName];
        const candleList = await candles(coin);
        await commitToolOutput(toolId, `The last 7 days cryptocurrency candles: ${JSON.stringify(candleList)}`, clientId, agentName);
        await executeForce(
            params?.context
                ? `Based on the last week candles of the ${coin} tell me your opinion should i buy or sell the coin based on the next context: ${params?.context}`
                : `Based on the last week candles of the ${coin} tell me your opinion should i buy or sell the coin`,
            clientId
        );
    },
    function: {
        name: ToolName.CalculateMarketTrendTool,
        description: 'When user ask should he buy or sell the coin call that tool to get the last week candles for specific cryptocurrency',
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: `Additional context to pass to agent input for the calculation after data fetch. For example "User want to buy the coin"`,
                },
            },
            required: [],
        },
    }
})

// Existing Tools (unchanged)
addTool({
    toolName: ToolName.CalculateBuyPriceQuantityTool,
    docNote:
        "This tool calculates the price and quantity required to buy a cryptocurrency with a specified USDT amount.",
    type: "function",
    call: async ({ agentName, toolId, clientId, params }) => {
        console.log(ToolName.CalculateBuyPriceQuantityTool, { params });
        if (!params.total) {
            await commitToolOutput(
                toolId,
                `To calculate the price and quantity the total amount of USDT required. Ask user to provide the amount`,
                clientId,
                agentName
            );
            await execute(
                "You lack the information to calculate the price and quantity. Ask me to provide it",
                clientId,
                agentName
            );
            return;
        }
        const coin = AgentCoinMap[agentName];
        const { price, quantity } = await calculateBuyUSDT(
            Number(params.total),
            coin
        );
        await commitToolOutput(
            toolId,
            `To buy the ${coin} for ${params.total} USDT you need to place the order with price=${price} and quantity=${quantity}`,
            clientId,
            agentName
        );
        await emit(
            `To buy the ${coin} for ${params.total} USDT uou should place the MARKET_BUY order with price=${price} and quantity=${quantity}`,
            clientId,
            agentName
        );
    },
    function: {
        name: ToolName.CalculateBuyPriceQuantityTool,
        description:
            "This tool will help to get formatted price and quantity to buy any crypto currency for specific USDT amount",
        parameters: {
            type: "object",
            properties: {
                total: {
                    type: "number",
                    description: "The USDT amount for market buy",
                },
            },
            required: ["total"],
        },
    },
});

addTool({
    toolName: ToolName.CalculateSellPriceQuantityTool,
    docNote:
        "This tool calculates the price and quantity required to sell a cryptocurrency for a specified USDT amount.",
    type: "function",
    call: async ({ agentName, toolId, clientId, params }) => {
        console.log(ToolName.CalculateSellPriceQuantityTool, { params });
        if (!params.total) {
            await commitToolOutput(
                toolId,
                `To calculate the price and quantity the total amount of USDT required. Ask user to provide the amount`,
                clientId,
                agentName
            );
            await execute(
                "You lack the information to calculate the price and quantity. Ask me to provide it",
                clientId,
                agentName
            );
            return;
        }
        const coin = AgentCoinMap[agentName];
        const { price, quantity } = await calculateBuyUSDT(
            Number(params.total),
            coin
        );
        await commitToolOutput(
            toolId,
            `To sell the ${coin} for ${params.total} USDT you need to place the order with price=${price} and quantity=${quantity}`,
            clientId,
            agentName
        );
        await emit(
            `To sell the ${coin} for ${params.total} USDT you should place the MARKET_SELL order with price=${price} and quantity=${quantity}`,
            clientId,
            agentName
        );
    },
    function: {
        name: ToolName.CalculateSellPriceQuantityTool,
        description:
            "This tool will help to get formatted price and quantity to sell any crypto currency for specific USDT amount",
        parameters: {
            type: "object",
            properties: {
                total: {
                    type: "number",
                    description: "The USDT amount for market sell",
                },
            },
            required: ["total"],
        },
    },
});

addTool({
    docNote:
        "This tool enables returning to the Triage Agent from any specialized agent, making it useful for reassessing user requests or redirecting to another agent while supporting context for improved answer after routing.",
    toolName: ToolName.NavigateToTriageTool,
    type: "function",
    call: async ({ toolId, clientId, params }) => {
        console.log(ToolName.NavigateToTriageTool, { params });
        await commitToolOutputForce(
            toolId,
            "Navigation to Triage Agent successful",
            clientId
        );
        await changeToDefaultAgent(clientId);
        await executeForce(
            params?.context
                ? `Continue conversation with user based on the next context: ${params?.context}`
                : "Continue conversation with user",
            clientId
        );
    },
    function: {
        name: ToolName.NavigateToTriageTool,
        description:
            "Return to the Triage Agent to reassess and route the user's request.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "Additional context to pass back to the Triage Agent",
                },
            },
            required: [],
        },
    },
});

// Define the Root Swarm
addSwarm({
    docDescription:
        "This swarm serves as the root structure for a multi-agent cryptocurrency trading system, managing specialized trader agents for BTC, ETH, BNB, XRP, and SOL, with the Triage Agent as the entry point for query routing.",
    swarmName: SwarmName.TradingSwarm,
    agentList: [
        AgentName.BtcTraderAgent,
        AgentName.EthTraderAgent,
        AgentName.BnbTraderAgent,
        AgentName.XrpTraderAgent,
        AgentName.SolTraderAgent,
        AgentName.TriageAgent,
    ],
    defaultAgent: AgentName.TriageAgent,
});
