---
title: demo/nginx-balancer-chat/test_swarm
group: demo/nginx-balancer-chat
---

# test_swarm

> This swarm serves as the core structure for the nginx-balancer-chat project, managing a single TestAgent as both the sole member and default agent to handle user interactions, leveraging the CohereCompletion to report the specific port of one of 5 upstreamed chat instances balanced by Nginx to port 80.

![schema](./image/swarm_schema_test_swarm.svg)

## Default agent

 - [test_agent](./agent/test_agent.md)

	This agent operates within the nginx-balancer-chat project as a test agent, utilizing the OpenaiCompletion to inform users about the actual server port of one of 5 chat instances running on different ports and upstreamed by Nginx to port 80, extracting the port details from the chat history’s system message.

## Used agents

1. [test_agent](./agent/test_agent.md)

	This agent operates within the nginx-balancer-chat project as a test agent, utilizing the OpenaiCompletion to inform users about the actual server port of one of 5 chat instances running on different ports and upstreamed by Nginx to port 80, extracting the port details from the chat history’s system message.
