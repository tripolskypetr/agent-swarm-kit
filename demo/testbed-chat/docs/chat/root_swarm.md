---
title: demo/testbed-chat/root_swarm
group: demo/testbed-chat
---

# root_swarm

> This swarm serves as the root structure for the repl-phone-seller project, managing a single SalesAgent as both the sole member and default agent to assist users in adding phones to a cart via a REPL terminal, utilizing the OllamaCompletion for natural interactions while leveraging tools and storages to handle phone searches and basket management.

![schema](./image/swarm_schema_root_swarm.svg)

## Default agent

 - [sales_agent](./agent/sales_agent.md)

	This agent, named SalesAgent, operates within the repl-phone-seller project to assist users in adding phones to a cart via a REPL terminal, using the OllamaCompletion for natural interactions, relying on SearchPhoneTool and SearchPhoneByDiagonalTool for phone queries, and employing AddToBacketTool to manage BasketStorage, all while storing phone data in PhoneStorage.

## Used agents

1. [sales_agent](./agent/sales_agent.md)

	This agent, named SalesAgent, operates within the repl-phone-seller project to assist users in adding phones to a cart via a REPL terminal, using the OllamaCompletion for natural interactions, relying on SearchPhoneTool and SearchPhoneByDiagonalTool for phone queries, and employing AddToBacketTool to manage BasketStorage, all while storing phone data in PhoneStorage.
