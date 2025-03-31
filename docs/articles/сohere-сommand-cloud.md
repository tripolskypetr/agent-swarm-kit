---
title: articles/сohere-сommand-cloud
group: articles
---
# Cohere Command — The Revolution We Missed

For a long time, I was searching for a model specifically designed for invoking tools for external integrations. The key criterion was minimizing hallucinations when using consumer-grade hardware.

![Image](./images/27a6588000b861ec4a3c713f4e911165.png)  
*Caption: [https://huggingface.co/tripolskypetr/command_r_gguf](https://huggingface.co/tripolskypetr/command_r_gguf)*  

If a language model with tens of billions of parameters requires purchasing a specialized $5,000 graphics card—assuming you can even get it delivered and installed into a compatible motherboard—such a business model isn’t scalable.

The task was clear: maximize the use of existing hardware. Historically, our office has been equipped with systems featuring 32GB of RAM and RTX 3060 GPUs with 12GB of VRAM.

## Search Results

In the Ollama model library, I found the [command-r](https://ollama.com/oybekdevuz/command-r) model. Initially, [its tools were broken](https://github.com/ollama/ollama/issues/9680#issuecomment-2742827704), but after some complaints in the issues section, I managed to cobble together a fix with some copy-pasted code.

![Image](./images/db9953ba6398d2e20d7b9b361bc1a1ab.png)  
*Caption: ollama run oybekdevuz/command-r*  

The model launched, consuming 90% of the system resources described above. Tool invocation worked smoothly—no lag or hallucinations—entirely powered by the GPU. This was the best-case scenario, as it fully utilized our minimal hardware.

![Image](./images/00736133279d5105229dfcc7bcee0111.png)  
*Caption: Tool invocation working*  

We tested the tool invocation. Compared to OpenAI, there’s a difference: since the model is optimized for external API calls, every user action must be defined as a separate tool. This has its advantages—chat behavior becomes predictable. If the model says an item was added to the cart, it means an actual HTTP request was sent to the server, not just placeholder text.

### What Exactly Did We Miss?

Cohere, the LLM provider, offers not only cloud services but also open-source model files. It’s akin to getting a GGUF version of GPT-4o and running it locally. In the end, we overlooked their cloud offering entirely.

![Image](./images/0d2d7aca56a5c73392adf3a2eed420a1.png)  
*Caption: [https://docs.cohere.com/docs/rate-limits](https://docs.cohere.com/docs/rate-limits)*  

Cohere provides a free tier with 20 requests per minute per API key. I couldn’t find any limit on how long a trial token remains active.

![Image](./images/4ba84de774c07880b143fecb22adfe43.png)  
*Caption: [https://dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)*  

The pricing is radically more affordable than OpenAI’s. But that’s not what I wanted to write about: **What if we created a carousel of trial tokens?**

![Image](./images/6938d459f317a071753884e372fb66d6.png)  
*Caption: [https://cohere.com/pricing](https://cohere.com/pricing)*  

## The Fun Carousel

Our agent swarm engine uses an adapter to connect to cloud LLMs, allowing us to switch from Yandex Cloud or any other provider if subscription costs spike.

```typescript
import { Adapter, addCompletion, RoundRobin } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { CohereClientV2 } from "cohere-ai";

const getCohere = (token: string) =>
  new CohereClientV2({
    token,
  });

const COHERE_TOKENS = [process.env.COHERE_API_KEY, /* You know what to do :-) */];

addCompletion({
  completionName: CompletionName.CohereCompletion,
  getCompletion: RoundRobin.create(COHERE_TOKENS, (apiKey) =>
    Adapter.fromCohereClientV2(getCohere(apiKey), "command-r-08-2024")
  ),
});
```

In addition to running command-r in the cloud, we added a connector for Ollama to the academic project.

```typescript
import { Adapter, addCompletion } from "agent-swarm-kit";
import { CompletionName } from "../enum/CompletionName";
import { singleshot } from "functools-kit";
import { Ollama } from "ollama";

const getOllama = singleshot(
  () => new Ollama({ host: "http://127.0.0.1:11434" })
);

addCompletion({
  completionName: CompletionName.OllamaCompletion,
  getCompletion: Adapter.fromOllama(getOllama(), "oybekdevuz/command-r", ""),
});
```

And a connector for LMStudio. Additionally, the GGUF model image was uploaded to [HuggingFace at this link](https://huggingface.co/tripolskypetr/command_r_gguf) for those who prefer launching models with a GUI rather than the console.

```typescript
import { Adapter, addCompletion } from "agent-swarm-kit";
import { singleshot } from "functools-kit";
import OpenAI from "openai";
import { CompletionName } from "../enum/CompletionName";

const getOpenAI = singleshot(
  () => new OpenAI({ baseURL: "http://127.0.0.1:1234/v1", apiKey: "noop" })
);

addCompletion({
  completionName: CompletionName.LMStudioCompletion,
  getCompletion: Adapter.fromLMStudio(getOpenAI(), "command_r_gguf"),
});
```

I’ll add that the local and cloud models behave identically, which is a huge plus since I don’t know how long this “fun carousel” will keep spinning...

## Thank You for Your Attention!

I hope Cohere doesn’t find my little carousel too sad or financially burdensome :-(

