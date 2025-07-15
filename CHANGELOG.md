# 📝 Structured JSON Output With Validation (v1.1.130, 15/07/2025)

> Github [release link](https://github.com/tripolskypetr/agent-swarm-kit/releases/tag/1.1.130)

Create structured JSON outputs with precise schemas and robust validation! 📝 Ensure AI responses meet your needs with custom rules and automatic retries. 🔄 Integrate seamlessly with OpenAI, Ollama, or Claude. 🌐 Dynamic history guides consistent results for workflows or chatbots. 🗂️ Simple TypeScript API scales effortlessly with error recovery. 🛠️

```tsx
import { addOutlineSchema, IOutlineFormat } from "agent-swarm-kit";

const format: IOutlineFormat = {
  type: "object",
  properties: {
    take_profit_price: { type: "number", description: "Take profit price in USD" },
    stop_loss_price: { type: "number", description: "Stop-loss price in USD" },
    description: { type: "string", description: "User-friendly explanation of risks, min 10 sentences" },
    reasoning: { type: "string", description: "Technical analysis, min 15 sentences" },
  },
  required: ["take_profit_price", "stop_loss_price", "description", "reasoning"],
};

addOutlineSchema({
  outlineName: "signal_plutus",
  format,
  prompt: "Generate crypto trading signals based on price and volume indicators in JSON format.",
  completion: "grok-mini-outline",
  getOutlineHistory: async ({ history, param }) => {
    const signalReport = await ioc.signalReportService.getSignalReport(param);
    await commitReports(history, signalReport);
    await history.push({ role: "user", content: "Generate JSON based on reports." });
  },
  validations: [
    {
      validate: ({ data }) => {
        if (data.action !== "buy") return;
        const stopLossChange = percentDiff(data.current_price, data.stop_loss_price);
        if (stopLossChange > CC_LADDER_STOP_LOSS) {
          throw new Error(`Stop loss must not exceed -${CC_LADDER_STOP_LOSS}%`);
        }
      },
      docDescription: "Checks stop-loss price against max loss percentage.",
    },
    {
      validate: ({ data }) => {
        if (data.action !== "buy") return;
        const sellChange = percentDiff(data.current_price, data.take_profit_price);
        if (sellChange > CC_LADDER_TAKE_PROFIT) {
          throw new Error(`Take profit must not exceed +${CC_LADDER_TAKE_PROFIT}%`);
        }
      },
      docDescription: "Checks take-profit price against max profit percentage.",
    },
  ],
});

```

P.S. [Outlines by dottxt](https://dottxt-ai.github.io/outlines/1.1.0/) doc 📖




# Tool and System Prompt Reflection (v1.1.73, 12/06/2025)

> Github [release link](https://github.com/tripolskypetr/agent-swarm-kit/releases/tag/1.1.73)

🔌 Enhance your LLMs with flexible, runtime-configurable tools and system prompts using `agent-swarm-kit`. The library allows you to define tools with dynamic interfaces, enabling agents to adapt their functionality based on context or agent-specific requirements. This makes it easy to integrate specialized capabilities, like fetching real-time data or generating reports without additional tool arguments, with minimal boilerplate. 🛠️

```tsx
addTool({
  toolName: ToolName.FetchShortRangeEmaSignals,
  type: "function",
  call: async ({ toolId, clientId, agentName, isLast }) => {
    const symbol = ioc.signalMetaService.getSymbolForAgent(agentName);
    const content =
      await ioc.shortRangeMathService.generateShortRangeReport(symbol);
    await commitToolOutput(toolId, content, clientId, agentName);
    if (isLast) {
      await execute("", clientId, agentName);
    }
  },
  function: (_, agentName) => {
    const displayName = ioc.signalMetaService.getDispayNameForAgent(agentName);
    return {
      name: ToolName.FetchShortRangeEmaSignals,
      description: `Fetch a short range EMA signals table for ${displayName}.`,
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    };
  },
});
```

**Example**: Below is a tool that dynamically fetches short-range EMA (Exponential Moving Average) signals for a trading agent, with a description tailored to the agent's display name 🌐



# Demo Projects (v1.0.215, 27/03/2025)

> Github [release link](https://github.com/tripolskypetr/agent-swarm-kit/releases/tag/1.0.215)

More demos, better [docs available on GitHub Pages](https://agent-swarm.github.io/documents/demo_binance-candle-chat_trading_swarm.html)

![demo](https://github.com/user-attachments/assets/b6583f80-411b-44a5-9a72-6b27b249dd75)

```bash
PS C:\Users\User\Documents\GitHub\agent-swarm\demo\binance-candle-chat> npm start

> start
> bun ./src/repl.ts

[triage_agent] => Should i buy XRP right now?
navigate_to_xrp_trader_tool {
  params: {},
}
calculate_market_trend_tool {
  params: {},
}
[
  {
    "low": "2.35640000",
    "high": "2.46690000",
    "close": "2.38090000",
    "closeTime": "2025-03-21T23:59:59.999Z"
  },
  {
    "low": "2.35940000",
    "high": "2.41700000",
    "close": "2.37110000",
    "closeTime": "2025-03-22T23:59:59.999Z"
  },
  {
    "low": "2.36500000",
    "high": "2.44090000",
    "close": "2.43930000",
    "closeTime": "2025-03-23T23:59:59.999Z"
  },
  {
    "low": "2.41340000",
    "high": "2.50440000",
    "close": "2.45010000",
    "closeTime": "2025-03-24T23:59:59.999Z"
  },
  {
    "low": "2.40710000",
    "high": "2.47830000",
    "close": "2.44920000",
    "closeTime": "2025-03-25T23:59:59.999Z"
  },
  {
    "low": "2.32800000",
    "high": "2.47940000",
    "close": "2.34940000",
    "closeTime": "2025-03-26T23:59:59.999Z"
  },
  {
    "low": "2.30210000",
    "high": "2.39000000",
    "close": "2.34350000",
    "closeTime": "2025-03-27T23:59:59.999Z"
  }
]
[3.56s] Timing
[xrp_trader_agent]: Based on the last week's candles, the long-term market trend for XRP is predicted to be DOWN.
[xrp_trader_agent] =>
```



# Documentation (v1.0.167, 16/03/2025)

> Github [release link](https://github.com/tripolskypetr/agent-swarm-kit/releases/tag/1.0.167)

This release give as an ability to open source the [repl-phone-seller](https://github.com/tripolskypetr/agent-swarm-kit/tree/master/demo/repl-phone-seller) - an essential project which helps to get started building your own swarms



