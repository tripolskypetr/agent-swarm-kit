---
title: articles/local-llm-leaderboard
group: articles
---

# Leaderboard of LLMs for Tool Calling, Translations, and Financial Analytics

![draw a cat which choosing LLM model](./images/f686d374b823f0a82712a68a08f68fbb.jpg)  

All models in the list have been personally tested by me and perform as described. My computer has 64GB of RAM. Based on calculations, running on GPU requires exactly two RTX 3090 graphics cards with 24GB of video memory each on one machine: `llama.cpp` in [cortex.so](https://cortex.so) should automatically detect them and use their memory together ([link](https://www.youtube.com/watch?v=RllCtcVKYt8)).  

## 1. Model for Supervisor Agent  

For orchestrating a swarm of agents, Gemma 3 is the best choice. You should use the 27b version, as it operates without hallucinations: the 12b version is suitable for generating technical documentation but calls nonexistent tools. The 4b version ignores parts of the system prompt. The 4b version also spams guesses and leading questions.  

[*Model link*](https://huggingface.co/tripolskypetr/gemma-3-27b-it)  

## 2. Model for Language Translations  

YandexGPT 5 Lite Instruct performs very well for translations. Unlike Saiga, this version does not call tools, but the dataset was created by Yandex, which enhances its linguistic knowledge for translations from English to Russian. It can be used in a pipeline to polish responses from subsequent models.  

[*Model link*](https://huggingface.co/tripolskypetr/yandexgpt_5_lite_8b_instruct_gguf)  

## 3. Model for Financial Analytics  

Generates reports of the following type in Russian:  

```bash  
Medium-term outlook report for 19/05/2025  
Bitcoin trend forecast report (1-3 days)  
Analysis date: May 19, 2025  
MACD indicator signal analysis  
Latest MACD signals:  
May 19, 2025, 13:30 (UTC)  
Signal type: BUY  
Price: 103032.46  
Reason: MACD crossed the signal line upward  
Signal strength: Strong  
Strategy: Signal line crossover  
May 19, 2025, 13:30 (UTC)  
Signal type: BUY  
Price: 103032.46  
...  
Reason: MACD histogram crossed the zero line downward  
Signal strength: Medium  
Strategy: Zero line crossover  
Trend forecast:  
Based on the latest MACD signals, the following trends can be identified:  
Positive signals (BUY): Since 13:15 (UTC), a series of buy signals has been observed, including strong signals like MACD crossing the signal line upward and the histogram crossing the zero line upward. This suggests a potential resumption of an upward trend.  
Negative signals (SELL): At 12:30 (UTC), strong sell signals were recorded, indicating a short-term price decline.  
Conclusion:  
In the medium term (1-3 days), an upward trend for Bitcoin is likely, given the predominance of strong buy signals in recent hours. However, short-term corrections are possible. It is recommended to monitor further MACD signals to confirm the trend.  
```

[*Model link*](https://huggingface.co/tripolskypetr/Plutus-Meta-Llama-3.1-8B-Instruct-bnb-4bit)  

## 4. Alternative to Gemma 3 if You Dislike Its Style  

Partially ignores the `system prompt` but can call tools, including with `enum`. Suitable for those who find Gemma’s polished language unappealing.  

[*Model link*](https://huggingface.co/tripolskypetr/Codestral-22B-v0.1-GGUF)  

## 5. Model for Debugging System Prompt  

If the system prompt was written by multiple developers, internal takes may contradict each other. Reasoning models are useful for identifying such issues. Notably, the Qwen3 32B model can skip reasoning if the system prompt includes the text `/no_think`.  

[*Model link*](https://huggingface.co/tripolskypetr/Qwen3-32B-GGUF)
