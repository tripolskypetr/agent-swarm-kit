# root_swarm

> This swarm serves as the root structure for a multi-agent system with specialized roles, managing a collection of agents tailored to specific domains, utilizing the Triage Agent as the entry point for request analysis, and designed to handle diverse queries across technology, security, environment, health, and finance for seamless user support.

![schema](./image/swarm_schema_root_swarm.svg)

## Default agent

 - [triage_agent](./agent/triage_agent.md)

	This agent acts as the central routing hub for incoming user requests, analyzing queries to identify the most suitable specialized agent, ensuring smooth transitions by passing relevant context, and serving as the default starting point equipped with tools to navigate to any specialized agent.

## Used agents

1. [tech_trends_agent](./agent/tech_trends_agent.md)

	This agent specializes in providing insights into current and emerging technology trends, with expertise in areas like artificial intelligence and blockchain, aiming to deliver actionable, industry-aligned advice for tech enthusiasts and professionals while offering navigation back to the Triage Agent for queries outside its scope.

2. [cybersecurity_agent](./agent/cybersecurity_agent.md)

	This agent focuses on educating users about online safety and cybersecurity best practices, covering topics like password management and phishing prevention, offering practical tips to enhance digital security, and including navigation to the Triage Agent for broader inquiries.

3. [environment_agent](./agent/environment_agent.md)

	This agent is dedicated to promoting environmental awareness and sustainable living, providing guidance on reducing carbon footprints and waste management, offering practical advice for eco-friendly practices, and supporting navigation back to the Triage Agent for unrelated queries.

4. [health_agent](./agent/health_agent.md)

	This agent specializes in health and wellness, offering general advice on topics like fitness and nutrition, aiming to provide actionable steps for improving personal health, and capable of redirecting to the Triage Agent if a different expertise is required.

5. [finance_agent](./agent/finance_agent.md)

	This agent offers expertise in financial literacy and money management, providing advice on budgeting and investments to enhance users' financial knowledge, and includes an option to return to the Triage Agent for non-financial queries.

6. [triage_agent](./agent/triage_agent.md)

	This agent acts as the central routing hub for incoming user requests, analyzing queries to identify the most suitable specialized agent, ensuring smooth transitions by passing relevant context, and serving as the default starting point equipped with tools to navigate to any specialized agent.
