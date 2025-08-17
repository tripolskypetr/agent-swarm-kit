---
title: demo/hf-inference/root_swarm
group: demo/hf-inference
---

# root_swarm

> This swarm serves as the root structure for the HuggingFace Inference demo project, managing a single TriageAgent as both the sole member and default agent to handle pharmaceutical sales interactions, utilizing the HfCompletion powered by OpenAI's gpt-oss-120b model through HuggingFace's cost-effective inference cloud for efficient, responsive user consultations and cart operations.

![schema](./image/swarm_schema_root_swarm.svg)

## Default agent

 - [triage_agent](./agent/triage_agent.md)

	This agent functions as a pharmaceutical seller within the HuggingFace Inference demo project, providing real-time consultations on pharma products using the HfCompletion powered by OpenAI's gpt-oss-120b model through HuggingFace's cost-effective inference cloud, and it employs the AddToCartTool only when necessary to facilitate purchases.

## Used agents

1. [triage_agent](./agent/triage_agent.md)

	This agent functions as a pharmaceutical seller within the HuggingFace Inference demo project, providing real-time consultations on pharma products using the HfCompletion powered by OpenAI's gpt-oss-120b model through HuggingFace's cost-effective inference cloud, and it employs the AddToCartTool only when necessary to facilitate purchases.
