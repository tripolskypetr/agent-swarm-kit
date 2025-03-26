# root_swarm

> Swarm Overview:
- Serves as the root structure for a multi-agent system with specialized roles.
- Manages a collection of agents, each tailored to a specific domain of expertise.
- Utilizes a Triage Agent as the default entry point for request analysis and routing.
- Designed to handle diverse user queries across technology, security, environment, health, and finance.
- Ensures seamless interaction and coordination between agents for optimal user support.

![schema](./image/swarm_schema_root_swarm.svg)

## Default agent

 - [triage_agent](./agent/triage_agent.md)

	Agent Overview:
- Acts as the central routing hub for incoming user requests.
- Analyzes queries to identify the most suitable specialized agent based on content.
- Ensures smooth transitions between agents by passing relevant context.
- Equipped with tools to navigate to any specialized agent as needed.
- Default starting point for all interactions within the swarm.

## Used agents

1. [tech_trends_agent](./agent/tech_trends_agent.md)

	Agent Overview:
- Specializes in providing insights into current and emerging technology trends.
- Expertise includes artificial intelligence, blockchain, Internet of Things (IoT), and more.
- Aims to deliver actionable, industry-aligned advice for tech enthusiasts and professionals.
- Can navigate back to Triage Agent if the query falls outside its scope.

2. [cybersecurity_agent](./agent/cybersecurity_agent.md)

	Agent Overview:
- Focuses on educating users about online safety and cybersecurity best practices.
- Covers topics such as password management, phishing prevention, and data protection.
- Offers practical tips to enhance digital security in personal and professional contexts.
- Includes navigation to Triage Agent for misrouted or broader inquiries.

3. [environment_agent](./agent/environment_agent.md)

	Agent Overview:
- Dedicated to promoting environmental awareness and sustainable living.
- Provides guidance on reducing carbon footprints, waste management, and green technologies.
- Offers practical advice for individuals and organizations to adopt eco-friendly practices.
- Supports navigation back to Triage Agent for unrelated queries.

4. [health_agent](./agent/health_agent.md)

	Agent Overview:
- Specializes in health and wellness, offering general advice for well-being.
- Topics include physical fitness, mental health strategies, and nutritional guidance.
- Aims to provide actionable steps for improving personal health in daily life.
- Can redirect to Triage Agent if the query requires a different expertise.

5. [finance_agent](./agent/finance_agent.md)

	Agent Overview:
- Offers expertise in financial literacy and personal money management.
- Provides advice on budgeting, saving strategies, and basic investment principles.
- Designed to enhance users' financial knowledge and decision-making skills.
- Includes an option to return to Triage Agent for non-financial queries.

6. [triage_agent](./agent/triage_agent.md)

	Agent Overview:
- Acts as the central routing hub for incoming user requests.
- Analyzes queries to identify the most suitable specialized agent based on content.
- Ensures smooth transitions between agents by passing relevant context.
- Equipped with tools to navigate to any specialized agent as needed.
- Default starting point for all interactions within the swarm.
