import { Logger, LoggerInstance, swarm } from "agent-swarm-kit";
import { createLogger } from "pinolog";

{
  const logger = createLogger("agent-swarm-kit.log");
  swarm.loggerService.setLogger({
    log: (...args) => logger.log(...args),
    debug: (...args) => logger.info(...args),
    info: (...args) => logger.info(...args),
  });
}

Logger.useClientAdapter(
  class extends LoggerInstance {
    readonly logger = createLogger(`${this.clientId}.log`, "./logs/chat");

    log(...args: unknown[]) {
      this.logger.log(...args);
    }

    dispose() {
      this.logger.destroy();
    }
  }
);
