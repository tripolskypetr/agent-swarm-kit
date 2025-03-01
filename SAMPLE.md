# Code samples

**1. Orchestrate different sessions logs into separate files**

```tsx
import { Logger, LoggerInstance } from "agent-swarm-kit";

import { createLogger } from "pinolog";

Logger.useClientAdapter(
  class extends LoggerInstance {
    readonly logger = createLogger(`${this.clientId}.log`, "logs/chat");

    log(topic: string, ...args: any[]): void {
      this.logger.log(topic, ...args);
    }

    dispose(): void {
      this.logger.destroy();
    }
  }
);
```

**2. Write all logs to debug.log with rotation**

```tsx
import { Logger } from "agent-swarm-kit";

import { createLogger } from "pinolog";

{
  const logger = createLogger("debug.log");
  Logger.useCommonAdapter({
    log: (...args) => logger.log(...args),
    debug: () => {},
    info: () => {},
  });
}
```