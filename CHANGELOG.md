# 🛡️ Hardening & Stability Release (v4.0.0, 05/07/2026)

> Github [release link](https://github.com/tripolskypetr/agent-swarm-kit/releases/tag/4.0.0)

The **4.0.0** major release is a top-to-bottom hardening pass over the whole runtime. The dependency bump to `functools-kit` v4 (strict sequential queues) surfaced a class of latent deadlocks and lost-output bugs that the old v3 queue quietly papered over. Every one of them is now fixed, every point where the library calls into user code is guarded against throwing, and the behavior is locked down by a suite that grew from 42 to **298 tests** (all green, `tsc --noEmit` clean).

The whole `src/` tree was read line-by-line and audited for races, broken tool chains, dangling agent references, and history-integrity loss. **35 bugs** were found and fixed along the way. If you build multi-agent flows with nested tool calls, navigation, operators, or persistence, upgrading removes a long tail of "the session just hangs" and "the wrong client got the answer" failure modes.

## ⚠️ Breaking changes

- **Typo'd names removed.** `addEmbeding` / `getEmbeding` / `overrideEmbeding` (single-`d`) are gone — use `addEmbedding` / `getEmbedding` / `overrideEmbedding`. No deprecated aliases are kept; update imports directly.
- **Duplicate `tool_call` ids now throw** instead of silently executing both calls. `session.complete` / `execute` reject with `duplicate tool call id` (delivered via `errorSubject`) and the flow recovers with a placeholder rather than corrupting history.

## 🔒 Security

- **Path traversal in persistence (fixed).** `PersistBase` built file paths by joining `entityId` (a `clientId` / `stateName` / …, possibly attacker-controlled) directly onto the dump directory, so `clientId="../../x"` could escape `dump/` and overwrite arbitrary files. `entityId` is now sanitized (`/`, `\`, `..` → `_`).
- **Concurrent-ban lost update (fixed).** `ClientPolicy.banClient` / `unbanClient` were an unserialized read-modify-write over the shared ban set: two concurrent bans of different clients could lose one update in memory *and* in the persisted store — a banned client would then pass `hasBan` and keep interacting. The mutations are now serialized through a queue so each observes the previous one.

## 🐛 Notable fixes

- **`waitForOutput` deadlock (the big one).** Under `functools-kit` v4's strict queue, a nested `execute` triggered from inside a tool subscribed to its output *after* the emit and hung forever — this alone accounted for 39 failing tests. Rewritten as a FIFO awaiter chain with a `joinOutput()` path so nested tool executions attach to the parent waiter instead of queuing behind it.
- **Late tool errors & mid-flight teardown no longer hang the session.** A tool that throws *after* `commitToolOutput`, a server-side `changeToAgent` while a completion is still running, and `dispose()` during your own in-flight `complete()` all now resolve the pending waiter (placeholder / empty output) instead of leaving it — and the busy lock — stuck forever.
- **Stale output can't poison the next exchange.** `cancelOutput` and `emit`-substitution used to resolve the current waiter while the execution kept running and later emitted into the *next* message's waiter. An output-epoch guard now drops those stale results.
- **Every user-code entry point is guarded.** Throwing `transform` / `map` / `mapToolCalls` / prompt functions, tool callbacks (`onValidate` / `onBeforeCall` / `onAfterCall` / `validate`), history adapters, MCP `listTools`, persistence `waitForInit`, custom resque functions, bus listeners, and schema hooks no longer hang the flow or crash the host process — errors are delivered to the caller (via `errorSubject`) or logged for observers, with graceful degradation.
- **Multi-directional routers work.** Navigation tools are no longer deduplicated to one, so a triage/router agent exposing several `navigate_to_*` tools can actually call any of them; only commit-action tools remain limited to one per turn.
- **Navigation "go back" is correct.** `changeToPrevAgent` no longer navigates into the current agent (off-by-one on the navigation stack); operator agents are now reachable through navigation (tool-mode `execute` forwards to the human instead of silently returning).
- **Edge-value fixes.** `maxToolCalls=0` now runs *no* tools (was running all — `slice(-0)` trap), `keepMessages=0` shows the model *zero* prior messages (same trap), and `getState` called from inside a `setState` dispatch no longer deadlocks.
- **`createNumericIndex` no longer overwrites live rows** after deletions (index is `max(numeric id) + 1`, not `length + 1`).

## ⚙️ Configuration

- Previously hard-coded timers are now in `GLOBAL_CONFIG` (tunable via `setConfig`, defaults unchanged): `CC_OPERATOR_SIGNAL_TIMEOUT`, `CC_CHAT_INACTIVITY_CHECK`, `CC_CHAT_INACTIVITY_TIMEOUT`.
- `TOOL_PROTOCOL_PROMPT` and `getLastToolMessage` are now exported from the package root.

## ✅ Tests

The suite went from 42 to 298 tests across ~40 new spec files, covering tool-call sequencing, MCP, resque strategies, multi-client isolation, navigation branching, ban mechanics, crash recovery across processes, and a systematic "throw at every user-code boundary" sweep. See `TODO.md` for the full 32-round audit log and per-bug detail.

---

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



