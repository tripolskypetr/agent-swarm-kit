---
title: demo/cohere-token-rotate/root_swarm
group: demo/cohere-token-rotate
---

# root_swarm

> This swarm acts as the root structure for the cohere-token-rotation project, managing a single TriageAgent as both the sole member and default agent to handle pharmaceutical sales interactions, leveraging the CohereCompletion with a token rotation mechanism utilizing 10 trial tokens in parallel to optimize API performance for user consultations and cart operations.

![schema](./image/swarm_schema_root_swarm.svg)

## Default agent

 - [triage_agent](./agent/triage_agent.md)

	This agent serves as a pharmaceutical seller within a triage system, offering consultations on pharma products using the CohereCompletion powered by a Cohere API with a token rotation mechanism to leverage 10 trial tokens in parallel for enhanced performance, and it employs the AddToCartTool only when necessary to assist with purchases.

## Used agents

1. [triage_agent](./agent/triage_agent.md)

	This agent serves as a pharmaceutical seller within a triage system, offering consultations on pharma products using the CohereCompletion powered by a Cohere API with a token rotation mechanism to leverage 10 trial tokens in parallel for enhanced performance, and it employs the AddToCartTool only when necessary to assist with purchases.
