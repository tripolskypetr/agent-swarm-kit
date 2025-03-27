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

// Common System Prompts
const TRADER_SYSTEM_PROMPT = str.newline(
    "Cryptocurrency Trader Agent Guidelines:",
    "You are a long-term cryptocurrency trader specializing in your specific coin",
    "Perform these actions for every user request:",
    "1. Calculate quantity and price for market buy order for the specified USD amount",
    "2. Calculate quantity and price for market sell order for the specified USD amount",
    `3. To predict the market trend call the ${ToolName.CalculateMarketTrendTool} tool without additional thinking`,
    "If user doesn't specify a USD amount, ask them to provide it",
    `Do not tell the user should he buy the currency directly without calling ${ToolName.CalculateMarketTrendTool}`,
    "If user is no longer interested in this cryptocurrency, navigate back to Triage Agent"
);

const TRIAGE_SYSTEM_PROMPT = str.newline(
    "Triage Agent Guidelines:",
    "You are the starting point for all conversations",
    "Identify which cryptocurrency the user is interested in",
    "Navigate to the appropriate trader agent based on user's cryptocurrency choice:",
    "- Bitcoin (BTC) -> BTC Trader Agent",
    "- Ethereum (ETH) -> ETH Trader Agent",
    "- Binance Coin (BNB) -> BNB Trader Agent",
    "- Ripple (XRP) -> XRP Trader Agent",
    "- Solana (SOL) -> SOL Trader Agent",
    // "If unclear, ask user to specify their cryptocurrency of interest"
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
        "This agent specializes in long-term Bitcoin trading, performing buy/sell calculations and trend predictions.",
    completion: CompletionName.OpenAiCompletion,
    prompt: "You are the Bitcoin AI trader specializing in long-term investments.",
    system: [TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.CalculateMarketTrendTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.EthTraderAgent,
    docDescription:
        "This agent specializes in long-term Ethereum trading, performing buy/sell calculations and trend predictions.",
    completion: CompletionName.OpenAiCompletion,
    prompt: "You are the Ethereum AI trader specializing in long-term investments.",
    system: [TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.CalculateMarketTrendTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.BnbTraderAgent,
    docDescription:
        "This agent specializes in long-term Binance Coin trading, performing buy/sell calculations and trend predictions.",
    completion: CompletionName.OpenAiCompletion,
    prompt: "You are the Binance Coin AI trader specializing in long-term investments.",
    system: [TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.CalculateMarketTrendTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.XrpTraderAgent,
    docDescription:
        "This agent specializes in long-term Ripple trading, performing buy/sell calculations and trend predictions.",
    completion: CompletionName.OpenAiCompletion,
    prompt: "You are the Ripple AI trader specializing in long-term investments.",
    system: [TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.CalculateMarketTrendTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

addAgent({
    agentName: AgentName.SolTraderAgent,
    docDescription:
        "This agent specializes in long-term Solana trading, performing buy/sell calculations and trend predictions.",
    completion: CompletionName.OpenAiCompletion,
    prompt: "You are the Solana AI trader specializing in long-term investments.",
    system: [TRADER_SYSTEM_PROMPT],
    tools: [
        ToolName.CalculateBuyPriceQuantityTool,
        ToolName.CalculateSellPriceQuantityTool,
        ToolName.CalculateMarketTrendTool,
        ToolName.NavigateToTriageTool,
    ],
    dependsOn: [AgentName.TriageAgent],
});

// Navigation Tools
addTool({
    docNote:
        "This tool directs the user to the BTC Trader Agent for Bitcoin trading queries.",
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
        description: "Switch to the BTC Trader Agent for Bitcoin trading.",
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
        "This tool directs the user to the ETH Trader Agent for Ethereum trading queries.",
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
        description: "Switch to the ETH Trader Agent for Ethereum trading.",
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
        "This tool directs the user to the BNB Trader Agent for Binance Coin trading queries.",
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
        description: "Switch to the BNB Trader Agent for Binance Coin trading.",
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
        "This tool directs the user to the XRP Trader Agent for Ripple trading queries.",
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
        description: "Switch to the XRP Trader Agent for Ripple trading.",
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
        "This tool directs the user to the SOL Trader Agent for Solana trading queries.",
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
        description: "Switch to the SOL Trader Agent for Solana trading.",
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

// Triage Agent
addAgent({
    agentName: AgentName.TriageAgent,
    docDescription:
        "This agent acts as the entry point, routing users to appropriate long-term trader agents based on cryptocurrency interest.",
    completion: CompletionName.OpenAiCompletion,
    system: [TRIAGE_SYSTEM_PROMPT],
    prompt: "Identify which cryptocurrency the user is interested in and navigate to the appropriate trader agent.",
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
        "Fetches last week's candle data and triggers trend prediction for long-term trading.",
    type: "function",
    call: async ({ clientId, toolId, agentName, params }) => {
        console.log(ToolName.CalculateMarketTrendTool, { params })
        const coin = AgentCoinMap[agentName];
        const candleList = await candles(coin);
        console.log(JSON.stringify(candleList, null, 2));
        await commitToolOutput(toolId, `Last 7 days ${coin} candles: ${JSON.stringify(candleList)}`, clientId, agentName);
        await execute(
            `Predict the long-term market trend (UP or DOWN) for ${coin} based on the last week's candles`,
            clientId,
            agentName,
        );
    },
    function: {
        name: "predict_market_trend_tool",
        description: "Predict the market trend for buying or selling strategy. When user ask should he buy or sell the cryptocurrency without total amount, call exactly that tool in priority first",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
});

// Buy/Sell Tools
addTool({
    toolName: ToolName.CalculateBuyPriceQuantityTool,
    docNote:
        "Calculates price and quantity for a market buy order in long-term trading.",
    type: "function",
    call: async ({ agentName, toolId, clientId, params }) => {
        console.log(ToolName.CalculateBuyPriceQuantityTool, { params });
        if (!params.total) {
            await commitToolOutput(
                toolId,
                "Please provide the USD amount for the buy calculation.",
                clientId,
                agentName
            );
            await execute(
                "Please tell me how much USD you want to spend.",
                clientId,
                agentName
            );
            return;
        }
        const coin = AgentCoinMap[agentName];
        const { price, quantity } = await calculateBuyUSDT(Number(params.total), coin);
        await commitToolOutput(
            toolId,
            `Long-term buy ${coin} for ${params.total} USD: price=${price}, quantity=${quantity}`,
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
        description: "Calculate price and quantity for a long-term buy order.",
        parameters: {
            type: "object",
            properties: {
                total: {
                    type: "number",
                    description: "USD amount",
                },
            },
            required: ["total"],
        },
    },
});

addTool({
    toolName: ToolName.CalculateSellPriceQuantityTool,
    docNote:
        "Calculates price and quantity for a market sell order in long-term trading.",
    type: "function",
    call: async ({ agentName, toolId, clientId, params }) => {
        console.log(ToolName.CalculateSellPriceQuantityTool, { params });
        if (!params.total) {
            await commitToolOutput(
                toolId,
                "Please provide the USD amount for the sell calculation.",
                clientId,
                agentName
            );
            await execute(
                "Please tell me how much USD worth you want to sell.",
                clientId,
                agentName
            );
            return;
        }
        const coin = AgentCoinMap[agentName];
        const { price, quantity } = await calculateBuyUSDT(Number(params.total), coin);
        await commitToolOutput(
            toolId,
            `Long-term sell ${coin} for ${params.total} USD: price=${price}, quantity=${quantity}`,
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
        description: "Calculate price and quantity for a long-term sell order.",
        parameters: {
            type: "object",
            properties: {
                total: {
                    type: "number",
                    description: "USD amount",
                },
            },
            required: ["total"],
        },
    },
});

addTool({
    docNote: "Returns to Triage Agent when user loses interest in current cryptocurrency.",
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
                : "Which cryptocurrency are you interested in now?",
            clientId
        );
    },
    function: {
        name: ToolName.NavigateToTriageTool,
        description: "Return to Triage Agent.",
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
        "Root swarm for long-term cryptocurrency trading with specialized agents.",
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
