import {
  Adapter,
  addAgent,
  addCompletion,
  addStorage,
  addSwarm,
  addTool,
  changeToAgent,
  changeToDefaultAgent,
  commitFlush,
  commitFlushForce,
  commitToolOutput,
  commitToolOutputForce,
  commitUserMessageForce,
  emit,
  execute,
  executeForce,
  getLastUserMessage,
  Storage,
} from "agent-swarm-kit";
import { str } from "functools-kit";
import OpenAI from "openai";
import { candles } from "../api/candles";
import { calculateBuyUSDT } from "../api/calculateBuyUSDT";

import { addEmbedding } from "agent-swarm-kit";
import { Ollama } from "ollama";
import { tidy, mul, norm, sum, tensor1d, div } from "@tensorflow/tfjs-core";
import {
  calculateAverageCost,
  calculateProfitLoss,
  type IOrderSchema,
} from "../utils/calculateProfitLoss";

const ollama = new Ollama();

export enum SwarmName {
  TradingSwarm = "trading_swarm",
}

enum EmbeddingName {
  NomicEmbedding = "nomic_embedding",
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
  CalculateAverageCoinPriceTool = "calculate_average_coin_price_tool",
  NavigateToTriageTool = "navigate_to_triage_tool",
  NavigateToBtcTraderTool = "navigate_to_btc_trader_tool",
  NavigateToEthTraderTool = "navigate_to_eth_trader_tool",
  NavigateToBnbTraderTool = "navigate_to_bnb_trader_tool",
  NavigateToXrpTraderTool = "navigate_to_xrp_trader_tool",
  NavigateToSolTraderTool = "navigate_to_sol_trader_tool",
}

enum StorageName {
  OrderStorage = "order_storage",
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
  "- Solana (SOL) -> SOL Trader Agent"
  // "If unclear, ask user to specify their cryptocurrency of interest"
);

addCompletion({
  completionName: CompletionName.OpenAiCompletion,
  getCompletion: Adapter.fromOpenAI(
    new OpenAI({ apiKey: process.env.CC_OPENAI_API_KEY })
  ),
});

addEmbedding({
  embeddingName: EmbeddingName.NomicEmbedding,
  calculateSimilarity: async (a, b) => {
    return tidy(() => {
      const tensorA = tensor1d(a);
      const tensorB = tensor1d(b);
      const dotProduct = sum(mul(tensorA, tensorB));
      const normA = norm(tensorA);
      const normB = norm(tensorB);
      const cosineData = div(dotProduct, mul(normA, normB)).dataSync();
      const cosineSimilarity = cosineData[0];
      return cosineSimilarity;
    });
  },
  createEmbedding: async (text) => {
    const { embedding } = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: text,
    });
    return embedding;
  },
});

addStorage<IOrderSchema>({
  docDescription: "Persistent storage system designed to record and organize cryptocurrency trading orders, capturing details such as order type (buy/sell), coin (BTC, ETH, BNB, XRP, SOL), quantity, and price. Utilizes embeddings for efficient indexing and retrieval, supporting portfolio management and profit/loss calculations for long-term trading strategies across all trader agents.",
  createIndex: ({ type, coin, quantity, price }) =>
    str.space(type, coin, quantity, price),
  embedding: EmbeddingName.NomicEmbedding,
  storageName: StorageName.OrderStorage,
});

// Define Agents
addAgent({
  agentName: AgentName.BtcTraderAgent,
  docDescription:
    "Specialized agent for long-term Bitcoin (BTC) trading. Calculates buy/sell prices and quantities based on user-specified USD amounts and predicts market trends using historical data.",
  completion: CompletionName.OpenAiCompletion,
  prompt:
    "You are the Bitcoin AI trader specializing in long-term investments.",
  system: [
    TRADER_SYSTEM_PROMPT,
    str.newline(
      `When user speak about ETH (Ethereum), BNB (Binance coin), XRP (Ripple), SOL (Solana) but not BTC (Bitcoin) navigate him to the ${AgentName.TriageAgent}`,
      "This is especially important while user want to buy, sell or predict coin price"
    ),
  ],
  tools: [
    ToolName.CalculateBuyPriceQuantityTool,
    ToolName.CalculateSellPriceQuantityTool,
    ToolName.CalculateMarketTrendTool,
    ToolName.CalculateAverageCoinPriceTool,
    ToolName.NavigateToTriageTool,
  ],
  dependsOn: [AgentName.TriageAgent],
  storages: [StorageName.OrderStorage],
});

addAgent({
  agentName: AgentName.EthTraderAgent,
  docDescription:
    "Specialized agent for long-term Ethereum (ETH) trading. Provides buy/sell calculations for user-defined USD amounts and assesses market trends using recent candle data.",
  completion: CompletionName.OpenAiCompletion,
  prompt:
    "You are the Ethereum AI trader specializing in long-term investments.",
  system: [
    TRADER_SYSTEM_PROMPT,
    str.newline(
      `When user speak about BTC (Bitcoin), BNB (Binance coin), XRP (Ripple), SOL (Solana) but not ETH (Ethereum) navigate him to the ${AgentName.TriageAgent}`,
      "This is especially important while user want to buy, sell or predict coin price"
    ),
  ],
  tools: [
    ToolName.CalculateBuyPriceQuantityTool,
    ToolName.CalculateSellPriceQuantityTool,
    ToolName.CalculateMarketTrendTool,
    ToolName.CalculateAverageCoinPriceTool,
    ToolName.NavigateToTriageTool,
  ],
  dependsOn: [AgentName.TriageAgent],
  storages: [StorageName.OrderStorage],
});

addAgent({
  agentName: AgentName.BnbTraderAgent,
  docDescription:
    "Specialized agent for long-term Binance Coin (BNB) trading. Computes buy/sell order details based on USD inputs and evaluates market direction with trend analysis tools.",
  completion: CompletionName.OpenAiCompletion,
  prompt:
    "You are the Binance Coin AI trader specializing in long-term investments.",
  system: [
    TRADER_SYSTEM_PROMPT,
    str.newline(
      `When user speak about BTC (Bitcoin), ETH (Ethereum), XRP (Ripple), SOL (Solana) but not BNB (Binance coin) navigate him to the ${AgentName.TriageAgent}`,
      "This is especially important while user want to buy, sell or predict coin price"
    ),
  ],
  tools: [
    ToolName.CalculateBuyPriceQuantityTool,
    ToolName.CalculateSellPriceQuantityTool,
    ToolName.CalculateMarketTrendTool,
    ToolName.CalculateAverageCoinPriceTool,
    ToolName.NavigateToTriageTool,
  ],
  dependsOn: [AgentName.TriageAgent],
  storages: [StorageName.OrderStorage],
});

addAgent({
  agentName: AgentName.XrpTraderAgent,
  docDescription:
    "Specialized agent for long-term Ripple (XRP) trading. Determines buy/sell prices and quantities for specified USD amounts and predicts trends using market data.",
  completion: CompletionName.OpenAiCompletion,
  prompt: "You are the Ripple AI trader specializing in long-term investments.",
  system: [
    TRADER_SYSTEM_PROMPT,
    str.newline(
      `When user speak about BTC (Bitcoin), ETH (Ethereum), BNB (Binance coin), SOL (Solana) but not XRP (Ripple) navigate him to the ${AgentName.TriageAgent}`,
      "This is especially important while user want to buy, sell or predict coin price"
    ),
  ],
  tools: [
    ToolName.CalculateBuyPriceQuantityTool,
    ToolName.CalculateSellPriceQuantityTool,
    ToolName.CalculateMarketTrendTool,
    ToolName.CalculateAverageCoinPriceTool,
    ToolName.NavigateToTriageTool,
  ],
  dependsOn: [AgentName.TriageAgent],
  storages: [StorageName.OrderStorage],
});

addAgent({
  agentName: AgentName.SolTraderAgent,
  docDescription:
    "Specialized agent for long-term Solana (SOL) trading. Calculates buy/sell order parameters based on USD values and analyzes market trends with historical candles.",
  completion: CompletionName.OpenAiCompletion,
  prompt: "You are the Solana AI trader specializing in long-term investments.",
  system: [
    TRADER_SYSTEM_PROMPT,
    str.newline(
      `When user speak about BTC (Bitcoin), ETH (Ethereum), BNB (Binance coin), XRP (Ripple) but not SOL (Solana) navigate him to the ${AgentName.TriageAgent}`,
      "This is especially important while user want to buy, sell or predict coin price"
    ),
  ],
  tools: [
    ToolName.CalculateBuyPriceQuantityTool,
    ToolName.CalculateSellPriceQuantityTool,
    ToolName.CalculateMarketTrendTool,
    ToolName.CalculateAverageCoinPriceTool,
    ToolName.NavigateToTriageTool,
  ],
  dependsOn: [AgentName.TriageAgent],
  storages: [StorageName.OrderStorage],
});

// Navigation Tools
addTool({
  docNote:
    "Routes the conversation to the BTC Trader Agent for handling Bitcoin-specific long-term trading requests, preserving context if provided.",
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
      params.context
        ? `Continue conversation with user based on the next context: ${params.context}`
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
    "Redirects the user to the ETH Trader Agent for Ethereum-specific long-term trading queries, maintaining conversation continuity with optional context.",
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
      params.context
        ? `Continue conversation with user based on the next context: ${params.context}`
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
    "Guides the user to the BNB Trader Agent for Binance Coin long-term trading tasks, optionally passing context for seamless interaction.",
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
      params.context
        ? `Continue conversation with user based on the next context: ${params.context}`
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
    "Navigates to the XRP Trader Agent for Ripple-specific long-term trading operations, with optional context to maintain conversation flow.",
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
      params.context
        ? `Continue conversation with user based on the next context: ${params.context}`
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
    "Switches to the SOL Trader Agent for Solana long-term trading activities, preserving context if supplied for uninterrupted user experience.",
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
      params.context
        ? `Continue conversation with user based on the next context: ${params.context}`
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
    "Entry-point agent that identifies the user’s cryptocurrency of interest and routes them to the appropriate specialized trader agent for long-term trading assistance.",
  completion: CompletionName.OpenAiCompletion,
  system: [TRIAGE_SYSTEM_PROMPT],
  prompt:
    "Identify which cryptocurrency the user is interested in and navigate to the appropriate trader agent.",
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
  toolName: ToolName.CalculateAverageCoinPriceTool,
  docNote: "Tool that calculates the average cost per unit and the cumulative profit or loss for a given cryptocurrency in the user's trading portfolio. It retrieves historical order data from storage, verifies the coin matches the current agent’s focus (BTC, ETH, BNB, XRP, or SOL), and provides financial insights for long-term trading decisions. If the coin mismatches, it redirects to the Triage Agent.",
  type: "function",
  call: async ({ toolId, agentName, clientId, params }) => {
    console.log(ToolName.CalculateAverageCoinPriceTool, { params });
    if (!params.coin) {
      await commitToolOutput(
        toolId,
        "Please provide the coin name to fetch the candle date",
        clientId,
        agentName
      );
      await execute(
        "Please tell to specify for which coin exactly I want to check the candle data. Could be BTC, ETH, BNB, XRP, SOL",
        clientId,
        agentName
      );
      return;
    }
    const coin = AgentCoinMap[agentName];
    if (coin !== params.coin) {
      const lastMessage = await getLastUserMessage(clientId);
      await commitFlush(clientId, agentName);
      await changeToAgent(AgentName.TriageAgent, clientId);
      await executeForce(lastMessage, clientId);
      return;
    }
    const orderList = await Storage.list<IOrderSchema>({
      clientId,
      agentName,
      storageName: StorageName.OrderStorage,
    });
    const averageCost = calculateAverageCost(orderList);
    const totalProfitLoss = calculateProfitLoss(orderList);
    const sign = totalProfitLoss > 0 ? "+" : "-";
    await commitToolOutput(
      toolId,
      `The current total profit loss for coin ${coin} is ${sign}${totalProfitLoss} USD. The average cost is ${averageCost} USD`,
      clientId,
      agentName
    );
    await execute(
      "Tell me the current profit loss and the average cost from the last tool output",
      clientId,
      agentName
    );
  },
  function: {
    name: "calculate_average_revenue",
    description:
      "Calculate the average const of a coin and the current profit loss in a trader's portfolio, allowing user to fix the profit",
    parameters: {
      type: "object",
      properties: {
        coin: {
          description:
            "The current cryptocurrency coin taken from active agent prompt",
          type: "string",
          enum: ["BTC", "ETH", "BNB", "XRP", "SOL"],
        },
      },
      required: ["coin"],
    },
  },
});

addTool({
  toolName: ToolName.CalculateMarketTrendTool,
  docNote:
    "Retrieves the last 7 days of candle data for the agent’s cryptocurrency and initiates a long-term trend prediction (UP or DOWN) based on this data.",
  type: "function",
  call: async ({ clientId, toolId, agentName, params }) => {
    console.log(ToolName.CalculateMarketTrendTool, { params });
    if (!params.coin) {
      await commitToolOutput(
        toolId,
        "Please provide the coin name to fetch the candle date",
        clientId,
        agentName
      );
      await execute(
        "Please tell to specify for which coin exactly I want to check the candle data. Could be BTC, ETH, BNB, XRP, SOL",
        clientId,
        agentName
      );
      return;
    }
    const coin = AgentCoinMap[agentName];
    if (coin !== params.coin) {
      const lastMessage = await getLastUserMessage(clientId);
      await commitFlush(clientId, agentName);
      await changeToAgent(AgentName.TriageAgent, clientId);
      await executeForce(lastMessage, clientId);
      return;
    }
    const candleList = await candles(coin);
    console.log(JSON.stringify(candleList, null, 2));
    await commitToolOutput(
      toolId,
      `Last 7 days ${coin} candles: ${JSON.stringify(candleList)}`,
      clientId,
      agentName
    );
    await execute(
      `Predict the long-term market trend (UP or DOWN) for ${coin} based on the last week's candles`,
      clientId,
      agentName
    );
  },
  function: {
    name: "predict_market_trend_tool",
    description:
      "Predict the market trend for buying or selling strategy. When user ask should he buy or sell the cryptocurrency without total amount, call exactly that tool in priority first",
    parameters: {
      type: "object",
      properties: {
        coin: {
          description:
            "The current cryptocurrency coin taken from active agent prompt",
          type: "string",
          enum: ["BTC", "ETH", "BNB", "XRP", "SOL"],
        },
      },
      required: ["coin"],
    },
  },
});

// Buy/Sell Tools
addTool({
  toolName: ToolName.CalculateBuyPriceQuantityTool,
  docNote:
    "Computes the price and quantity for a market buy order based on a user-specified USD amount, prompting for the amount if not provided.",
  type: "function",
  call: async ({ agentName, toolId, clientId, params }) => {
    console.log(ToolName.CalculateBuyPriceQuantityTool, { params });
    if (!params.coin) {
      await commitToolOutput(
        toolId,
        "Please provide the coin name to place the buy order",
        clientId,
        agentName
      );
      await execute(
        "Please tell to specify which coin exactly I want to buy. Could be BTC, ETH, BNB, XRP, SOL",
        clientId,
        agentName
      );
      return;
    }
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
    if (coin !== params.coin) {
      const lastMessage = await getLastUserMessage(clientId);
      await commitFlush(clientId, agentName);
      await changeToAgent(AgentName.TriageAgent, clientId);
      await executeForce(lastMessage, clientId);
      return;
    }
    const { price, quantity } = await calculateBuyUSDT(
      Number(params.total),
      coin
    );
    await Storage.upsert<IOrderSchema>({
      item: {
        id: await Storage.createNumericIndex({
          clientId,
          agentName,
          storageName: StorageName.OrderStorage,
        }),
        coin,
        price,
        quantity,
        type: "buy",
      },
      clientId,
      agentName,
      storageName: StorageName.OrderStorage,
    });
    await commitToolOutput(
      toolId,
      `Long-term buy ${coin} for ${params.total} USD: price=${price}, quantity=${quantity}`,
      clientId,
      agentName
    );
    await emit(
      `To buy the ${coin} for ${params.total} USDT you should place the MARKET_BUY order with price=${price} and quantity=${quantity}`,
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
        coin: {
          description:
            "The current cryptocurrency coin taken from active agent prompt",
          type: "string",
          enum: ["BTC", "ETH", "BNB", "XRP", "SOL"],
        },
      },
      required: ["total", "coin"],
    },
  },
});

addTool({
  toolName: ToolName.CalculateSellPriceQuantityTool,
  docNote:
    "Determines the price and quantity for a market sell order based on a user-defined USD amount, requesting the amount if missing.",
  type: "function",
  call: async ({ agentName, toolId, clientId, params }) => {
    console.log(ToolName.CalculateSellPriceQuantityTool, { params });
    if (!params.coin) {
      await commitToolOutput(
        toolId,
        "Please provide the coin name to place the sell order",
        clientId,
        agentName
      );
      await execute(
        "Please tell to specify which coin exactly I want to sell. Could be BTC, ETH, BNB, XRP, SOL",
        clientId,
        agentName
      );
      return;
    }
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
    if (coin !== params.coin) {
      const lastMessage = await getLastUserMessage(clientId);
      await commitFlush(clientId, agentName);
      await changeToAgent(AgentName.TriageAgent, clientId);
      await executeForce(lastMessage, clientId);
      return;
    }
    const { price, quantity } = await calculateBuyUSDT(
      Number(params.total),
      coin
    );
    await Storage.upsert<IOrderSchema>({
      item: {
        id: await Storage.createNumericIndex({
          clientId,
          agentName,
          storageName: StorageName.OrderStorage,
        }),
        coin,
        price,
        quantity,
        type: "sell",
      },
      clientId,
      agentName,
      storageName: StorageName.OrderStorage,
    });
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
        coin: {
          description:
            "The current cryptocurrency coin taken from active agent prompt",
          type: "string",
          enum: ["BTC", "ETH", "BNB", "XRP", "SOL"],
        },
      },
      required: ["total", "coin"],
    },
  },
});

addTool({
  docNote:
    "Returns the conversation to the Triage Agent when the user loses interest in the current cryptocurrency, optionally passing context for further routing.",
  toolName: ToolName.NavigateToTriageTool,
  type: "function",
  call: async ({ toolId, clientId, params }) => {
    console.log(ToolName.NavigateToTriageTool, { params });
    const lastMessage = await getLastUserMessage(clientId);
    await commitToolOutputForce(
      toolId,
      "Navigation to Triage Agent successful",
      clientId
    );
    await changeToDefaultAgent(clientId);
    await commitFlushForce(clientId);
    if (params.context) {
      await commitUserMessageForce(lastMessage, "user", clientId);
      await executeForce(
        params.context
          ? `Continue conversation with user based on the next context: ${params.context}`
          : "Which cryptocurrency are you interested in now?",
        clientId
      );
    }
    await executeForce(lastMessage, clientId);
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
    "A coordinated system of agents designed for long-term cryptocurrency trading, featuring a Triage Agent for routing and specialized Trader Agents for BTC, ETH, BNB, XRP, and SOL.",
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
