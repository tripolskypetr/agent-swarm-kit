
## Test Cases

> [Back to agent-swarm-kit](https://github.com/tripolskypetr/agent-swarm-kit)

### Validation Test Cases

1. **Passes validation when all dependencies are provided**
   - Tests if validation passes when all dependencies are present.

2. **Fails validation when swarm is missing**
   - Tests if validation fails when the swarm is missing.

3. **Fails validation when completion is missing**
   - Tests if validation fails when the completion is missing.

4. **Fails validation when agent is missing**
   - Tests if validation fails when the agent is missing.

5. **Fails validation when tool is missing**
   - Tests if validation fails when the tool is missing.

6. **Fails validation when swarm's default agent is not in the list**
   - Tests if validation fails when the swarm's default agent is not included in the list.

### Model Recovery Test Cases

7. **Rescues model on non-existing tool call**
   - Tests if the model can recover when a non-existing tool is called.

8. **Rescues model on empty output**
   - Tests if the model can recover when the output is empty.

9. **Rescues model on failed tool validation**
   - Tests if the model can recover when tool validation fails.

10. **Failed rescue raises a placeholder**
    - Tests if a placeholder is returned when the rescue algorithm fails.

### Navigation Test Cases

11. **Navigates to sales agent on request**
    - Tests if the system navigates to the sales agent upon request.

12. **Navigates to refund agent on request**
    - Tests if the system navigates to the refund agent upon request.

### Deadlock Prevention Test Cases

13. **Avoids deadlock if commitToolOutput was not executed before navigation**
    - Tests if the system avoids deadlock when commitToolOutput is not executed before navigation.

14. **Avoids deadlock when commitToolOutput is executed in parallel with next completion**
    - Tests if the system avoids deadlock when commitToolOutput is executed in parallel with the next completion.

### Agent Execution Test Cases

15. **Ignores execution due to obsolete agent**
    - Tests if the system ignores execution due to an obsolete agent.

16. **Ignores commitToolOutput due to obsolete agent**
    - Tests if the system ignores commitToolOutput due to an obsolete agent.

17. **Ignores commitSystemMessage due to obsolete agent**
    - Tests if the system ignores commitSystemMessage due to an obsolete agent.

### Connection Disposal Test Cases

18. **Disposes connections for session function**
    - Tests if the system disposes of connections for the session function.

19. **Disposes connections for makeConnection function**
    - Tests if the system disposes of connections for the makeConnection function.

20. **Disposes connections for complete function**
    - Tests if the system disposes of connections for the complete function.

### Additional System Behavior Test Cases

21. **Uses different completions on multiple agents**
    - Tests if the system uses different completions for multiple agents.

22. **Clears history for similar clientId after each parallel complete call**
    - Tests if the system clears history for similar clientId after each parallel complete call.

23. **Orchestrates swarms for each connection**
    - Tests if the system orchestrates swarms for each connection.

24. **Queues user messages in connection**
    - Tests if the system queues user messages in connection.

25. **Allows server-side emit for makeConnection**
    - Tests if the system allows server-side emit for makeConnection.
