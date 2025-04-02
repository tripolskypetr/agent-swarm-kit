

# Directory demo\cohere-token-rotate\docs\chat

---

title: demo/cohere-token-rotate/websocket_chat_swarm  
group: demo/cohere-token-rotate  

---

# websocket_chat_swarm

> This swarm serves as the core structure for the cohere-token-rotate project, managing a single TriageAgent as both the sole member and default agent to handle real-time WebSocket-based chat interactions, utilizing the CohereCompletion with token rotation for pharma consultations, and employing the AddToCartTool to facilitate purchases while avoiding rate limits.


## Default agent

 - [triage_agent](./agent/triage_agent.md)  

	This agent functions as a pharmaceutical seller within the cohere-token-rotate project, providing real-time consultations on pharma products via WebSocket using the CohereCompletion with token rotation, and employing the AddToCartTool only when necessary to facilitate purchases.

## Used agents

1. [triage_agent](./agent/triage_agent.md)  

	This agent functions as a pharmaceutical seller within the cohere-token-rotate project, providing real-time consultations on pharma products via WebSocket using the CohereCompletion with token rotation, and employing the AddToCartTool only when necessary to facilitate purchases.

---

title: demo/cohere-token-rotate/triage_agent  
group: demo/cohere-token-rotate  

---

# triage_agent

> This agent functions as a pharmaceutical seller within the cohere-token-rotate project, providing real-time consultations on pharma products via WebSocket using the CohereCompletion with token rotation, and employing the AddToCartTool only when necessary to facilitate purchases.

**Completion:** `cohere_completion`

![picture](./docs/chat/image/agent_schema_triage_agent.svg)

## Main prompt

```
You are a pharma seller agent.
Provide consultation about pharma products.
Call the AddToCartTool only when necessary to add items to the cart; otherwise, respond directly to the user.
```

## System prompt

1. `To add a pharma product to the cart, use add_to_cart_tool`

2. `Call the tool only when the user explicitly requests to add an item to the cart`

3. `Leverage CohereCompletion with token rotation to ensure uninterrupted responses`

## Depends on

## Used tools

### 1. add_to_cart_tool

#### Name for model

`add_to_cart_tool`

#### Description for model

`Adds a pharma product to the cart for purchase`

#### Parameters for model

> **1. productName**

*Type:* `string`

*Description:* `Name of the pharma product to be added to the cart`

*Required:* [x]

#### Note for developer

*This tool enables the triage agent in the cohere-token-rotate project to add pharma products to a cart via WebSocket, accepting a product name, logging the action for the client’s session, and confirming the addition in real-time interactions, supported by Cohere’s token rotation for rate limit management.*

---

### Notes
- **Schema Images**: I adjusted the schema paths (`swarm_schema_websocket_chat_swarm.svg` and `agent_schema_triage_agent.svg`) to fit the template convention. Your original used `agent_schema_triage_agent.svg` under the swarm, but I aligned it with the standard swarm naming for clarity. Ensure these files exist or update the paths.
- **Content Adjustments**: 
  - Kept `cohere_completion` as per your definition, emphasizing token rotation as a key feature in the system prompt.
  - Renamed the tool parameter from `title` to `productName` to match your README’s `add_to_cart.tool.ts` example for consistency.
  - Refined the "Main prompt" and added a "System prompt" based on your agent’s role and tool usage, ensuring it matches the template’s structure and reflects the token rotation aspect.
- **Scope**: This completes the `websocket_chat_swarm` and `triage_agent` entries for `docs/chat`. Your original included README sections (e.g., "Folder Structure," "How It Works"), which I’ve excluded here to focus on the template. If you want those rewritten too, I can provide a full README version separately!
- **Original Issues**: Your initial `websocket_chat_swarm` entry had inconsistencies (e.g., "Completion" outside a section, incomplete "Agents and Tools").