---
title: articles/choosing-local-llm-model
group: articles
---
# Choosing a Local LLM Model. Publishing to a Website with Chat

For solving certain tasks, a business requirement is to run an LLM model locally on your own hardware. This is due to SJW censorship. For example, the standard training dataset for Llama does not allow medical consultations: recommending medications or discussing intimate medical details with an AI therapist (e.g., antidepressant side effects).

![DeepSeek-R1 in open source, model quality questionable](./images/b8b256a11017a4adade993462eb64830.png)  
*Caption: DeepSeek-R1 in open source, model quality questionable*

Moreover, if a model [cannot call tools](https://platform.openai.com/docs/guides/function-calling), it’s useless: there’s no point in conducting a medical consultation that doesn’t end in a pharmacological product sale. Below are tested models that combine consistent Russian language support and integration capabilities with third-party services.

## Model Overview

### NVidia Nemotron Mini  
[https://ollama.com/library/nemotron-mini](https://ollama.com/library/nemotron-mini)  

*Quote: This instruct model is optimized for roleplay, RAG QA, and function calling in English. It supports a context length of 4,096 tokens. This model is ready for commercial use.*

#### Pros
1. Runs on a laptop GPU with 4GB of memory  
   *Allows hiring an intern and testing their programming skills without exposing OpenAI keys.*
2. Speaks Russian  
   *Important point, see the DeepSeek photo above.*
3. Calls tools  
   *Conditionally works, but the issue lies with Ollama: [a prompt workaround is needed](https://github.com/ollama/ollama/issues/8287). However, it ignores required tool parameters, passing only data it’s 100% confident in.*
4. Concise: the dataset is tuned for minimal responses—no “perhaps” or “would you like to clarify?”  
   *A huge plus if you’ve worked with Gemini, which constantly spams text like `Would you like me to`, `Okay, here’s a`, `Okay, this is a`, `This is likely`.*

#### Cons
1. Recursively calls tools, reacting incorrectly to tool output  
   *Fixable by resetting the conversation after tool calls and adding notes to the system prompt.*
2. Ignores required tool parameters  
   *When calling a method to add an item to the cart, guaranteeing the product name requires manually analyzing the user’s last message.*
3. Due to its conciseness, it’s unmotivated in conversations; getting it to perform the desired action requires leading questions  
   *Solved by choosing a different model for swarm agents that need verbosity. This model positions itself for precise data collection via chat for commerce.*
4. Calls nonexistent tools  
   *If the text prompt includes a request to pay for an order, it’ll call `checkout_tool` even if only `add_to_cart_tool` is available.*

---

### Saiga/YandexGPT  
[https://huggingface.co/IlyaGusev/saiga_yandexgpt_8b](https://huggingface.co/IlyaGusev/saiga_yandexgpt_8b)  

*Quote: The pretrain version of the junior model—YandexGPT 5 Lite Pretrain—is published in open access and will be useful for developers fine-tuning base models for their tasks. The instruct version we fine-tuned based on it will soon be available via API.*

#### Pros
1. Yandex open-sourced Alice’s topology due to a political decision  
   *This is the best topology on the market, not just for Russian but overall: significantly better than `Mistral NeMo`, `Llama 3.1`, `Nemotron`, `Deepseek`, and others.*
2. Respects required tool parameters when calling tools  
   *A key difference from Nemotron Mini.*
3. Doesn’t recursively call tools  
   *A critical difference from Nemotron Mini: recursive tool calls create chat deadlocks. This model doesn’t have that flaw.*
4. Won’t run on a laptop, but a desktop with an RTX 3060 can handle it  
   *If it doesn’t work on Saiga/YandexGPT, the only fallback is OpenAI.*

#### Cons
1. Since the topology’s open-sourcing was political, Yandex withheld the dataset  
   *Fortunately, Saiga exists: adding 10% Russian text to Llama’s fine-tuning dataset worked by sheer luck, and the model learned Russian.*
2. LMStudio’s lexer can’t parse cases where the model requests two tool calls simultaneously  
   *When asked to add two items at once, instead of a structured `tool_calls: IToolCall[]`, it sends `[TOOL_REQUEST]\n{"name": "add_to_cart_tool", "arguments": {"title": "Aspirin"}}\n[END_TOOL_REQUEST]` as a `content` string. Fixed via a message filter checking for missing JSON, limiting tool calls to one per message via system prompt, and manually filtering completer output.*  
   *An unstable fix is catching JSON in the model’s message and asking it to correct the format. This sometimes leads to recursion: the model overthinks and still outputs an invalid tool call format. A stable workaround is clearing the conversation and sending the user a placeholder: `I didn’t catch that, could you repeat?`*

---

## Environment Setup

For **Nemotron**, you’ll need to [download Ollama from the official site](https://ollama.com/download), then run this command in the terminal:  
```
ollama pull nemotron-mini:4b
```

![Ollama CLI](./images/e609737826d80fbfd3481366ee6dd685.png)  
*Caption: Ollama CLI*

For **YandexGPT**, [download LMStudio](https://lmstudio.ai/), install the model via the search as shown below:

![LMStudio HuggingFace](./images/223842dd1759c7383ff24046854e0251.png)  
*Caption: LMStudio HuggingFace*

Then, enable the OpenAI API emulator in the side menu with these settings:

![LMStudio OpenAI Server](./images/be8dda2ceabe17d7107bec60c0c87820.png)  
*Caption: LMStudio OpenAI Server*

---

## Code Example

For simplicity, this article provides a console-based chat example. Connecting the same API to a frontend is straightforward—here’s [a template](https://github.com/jakobhoeg/shadcn-chat) just in case.

```typescript
import readline from "readline";
import { randomString, Subject } from "functools-kit";

const clientId = randomString();

const incomingSubject = new Subject();
const outgoingSubject = new Subject();

const ws = new WebSocket(`http://127.0.0.1:1337/?clientId=${clientId}`);

ws.onmessage = (e) => {
  incomingSubject.next(JSON.parse(e.data));
};

ws.onopen = () => {
  outgoingSubject.subscribe((data) => {
    ws.send(JSON.stringify({ data }));
  });
};

ws.onclose = () => {
  console.log("Connection closed");
  process.exit(-1);
};

ws.onerror = () => {
  console.log("Connection error");
  process.exit(-1);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question("pharma-bot => ", async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }

    console.time("Timing");
    await outgoingSubject.waitForListener();
    await outgoingSubject.next(input);
    const { agentName, data } = await incomingSubject.toPromise();
    console.timeEnd("Timing");

    console.log(`[${agentName}]: ${data}`);

    askQuestion();
  });
};

askQuestion();

rl.on("close", () => {
  process.exit(0);
});
```

The server code is as follows. To switch the agent to another LLM provider, change `completion: CompletionName.NemotronMiniCompletion` to `completion: CompletionName.SaigaYandexGPTCompletion`:

```typescript
import {
  Adapter,
  addAgent,
  addCompletion,
  addSwarm,
  addTool,
  commitFlush,
  commitToolOutput,
  emit,
  execute,
  getAgentName,
  session,
} from "agent-swarm-kit";
import type { ServerWebSocket } from "bun";
import { singleshot, str } from "functools-kit";
import { Ollama } from "ollama";
import OpenAI from "openai";

const getOllama = singleshot(
  () => new Ollama({ host: "http://127.0.0.1:11434" })
);

const getOpenAI = singleshot(
  () => new OpenAI({ baseURL: "http://127.0.0.1:12345/v1", apiKey: "noop" })
);

enum CompletionName {
  NemotronMiniCompletion = "nemotron_mini_completion",
  SaigaYandexGPTCompletion = "saiga_yandex_gpt_completion",
}

enum AgentName {
  TestAgent = "test_agent",
}

enum ToolName {
  AddToCartTool = `add_to_cart_tool`,
}

enum SwarmName {
  TestSwarm = "test_swarm",
}

addCompletion({
  completionName: CompletionName.NemotronMiniCompletion,
  getCompletion: Adapter.fromOllama(getOllama(), "nemotron-mini:4b"),
});

addCompletion({
  completionName: CompletionName.SaigaYandexGPTCompletion,
  getCompletion: Adapter.fromOpenAI(getOpenAI(), "saiga_yandexgpt_8b_gguf"),
});

addAgent({
  agentName: AgentName.TestAgent,
  completion: CompletionName.SaigaYandexGPTCompletion,
  prompt: str.newline(
    "You are a pharmaceutical product sales agent.",
    "Provide me with a consultation on a pharmaceutical product"
  ),
  system: [
    `To add a pharmaceutical product to the cart, call the following tool: ${ToolName.AddToCartTool}`,
  ],
  tools: [ToolName.AddToCartTool],
});

addTool({
  toolName: ToolName.AddToCartTool,
  validate: async ({ params }) => true,
  call: async ({ toolId, clientId, agentName, params }) => {
    console.log(ToolName.AddToCartTool, params);
    await commitToolOutput(
      toolId,
      `Pharmaceutical product ${params.title} successfully added.`,
      clientId,
      agentName
    );
    await emit(
      `Product ${params.title} added to the cart. Would you like to place an order?`,
      clientId,
      agentName
    );
  },
  type: "function",
  function: {
    name: ToolName.AddToCartTool,
    description:
      "Add a pharmaceutical product to the cart. Be sure to pass the title parameter.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: `Name of the pharmaceutical product to add to the cart`,
        },
      },
      required: [],
    },
  },
});

addSwarm({
  swarmName: SwarmName.TestSwarm,
  agentList: [AgentName.TestAgent],
  defaultAgent: AgentName.TestAgent,
});

type WebSocketData = {
  clientId: string;
  session: ReturnType<typeof session>;
};

Bun.serve({
  fetch(req, server) {
    const clientId = new URL(req.url).searchParams.get("clientId")!;
    console.log(`Connected clientId=${clientId}`);
    server.upgrade<WebSocketData>(req, {
      data: {
        clientId,
        session: session(clientId, SwarmName.TestSwarm),
      },
    });
  },
  websocket: {
    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
      const { data } = JSON.parse(message);
      const answer = await ws.data.session.complete(data);
      ws.send(
        JSON.stringify({
          data: answer,
          agentName: await getAgentName(ws.data.clientId),
        })
      );
    },
  },
  hostname: "0.0.0.0",
  port: 1337,
});
```

---

## Conclusion

Based on the points above, the following conclusions can be drawn:

1. **A new swarm of agents will be needed for each new chat localization**  
   Language models get confused if the system prompt contains information in a language foreign to the user: Russian text starts showing segmented English inclusions.

2. **Open-source models are progressing, but closed models still lead**  
   An adapter for switching from OpenAI to a local model is critical for handling edge cases: free models often glitch, but fixing errors is easier with them. Production environments are still more stable with closed models.

3. **For Russian-speaking audiences, choose Saiga/YandexGPT**  
   I also tried installing [Vikhr-YandexGPT-5-Lite-8B](https://huggingface.co/Vikhrmodels/Vikhr-YandexGPT-5-Lite-8B-it) in LMStudio, but tool calls didn’t work. Without tools, a language model is meaningless since integrations with third-party services fail.
