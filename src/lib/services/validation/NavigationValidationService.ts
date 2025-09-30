import { inject } from "../../../lib/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../../lib/core/types";
import { SwarmName } from "../../../interfaces/Swarm.interface";
import { memoize } from "functools-kit";
import { AgentName } from "../../../interfaces/Agent.interface";
import { GLOBAL_CONFIG } from "../../../config/params";

/**
 * Service for validating and managing navigation logic within the swarm system.
 * Ensures agents are navigated efficiently by tracking visited agents and preventing redundant navigation.
 * Integrates with `LoggerService` for logging and uses memoization to optimize route tracking.
*/
export class NavigationValidationService {
  /**
   * Injected logger service for recording navigation events and debugging information.
   * Implements `ILogger` to provide log, debug, and info-level logging.
   */
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  /**
   * Memoized function to retrieve or create a navigation route for a client and swarm.
   * Returns a `Set` of visited `AgentName`s, keyed by a combination of `clientId` and `swarmName`.
   * Uses memoization to ensure route persistence across calls while optimizing performance.
   */
  public getNavigationRoute = memoize<
    (clientId: string, swarmName: SwarmName) => Set<AgentName>
  >(
    ([clientId, swarmName]) => `${clientId}-${swarmName}`,
    () => new Set<AgentName>()
  );

  /**
   * Determines if navigation to a specific agent should proceed.
   * Checks if the agent has been previously visited in the route; if not, adds it and allows navigation.
   * Logs navigation attempts and decisions when info-level logging is enabled.
   */
  public shouldNavigate = (
    agentName: AgentName,
    clientId: string,
    swarmName: SwarmName
  ): boolean => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("navigationValidationService shouldNavigate", {
        clientId,
        swarmName,
        agentName,
      });
    const navigationRoute = this.getNavigationRoute(clientId, swarmName);
    if (navigationRoute.has(agentName)) {
      GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
        this.loggerService.info(
          "navigationValidationService shouldNavigate skipped due to the history contain that agent",
          {
            clientId,
            swarmName,
            agentName,
          }
        );
      const routeStr = Array.from(navigationRoute).concat(agentName).join("->");
      console.warn(`agent-swarm navigation skipped due to recursion`, {
        clientId,
        agentName,
        swarmName,
        route: routeStr,
      });
      if (GLOBAL_CONFIG.CC_THROW_WHEN_NAVIGATION_RECURSION) {
        throw new Error(
          `agent-swarm navigation skipped due to recursion clientId=${clientId} swarmName=${swarmName} agentName=${agentName} route=${routeStr}`
        );
      }
      return false;
    }
    navigationRoute.add(agentName);
    return true;
  };

  /**
   * Initializes or resets the navigation route monitoring for a client and swarm.
   * Clears the existing route to start fresh, logging the action if info-level logging is enabled.
   */
  public beginMonit = (clientId: string, swarmName: SwarmName): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("navigationValidationService beginMonit", {
        clientId,
        swarmName,
      });
    if (!this.getNavigationRoute.has(`${clientId}-${swarmName}`)) {
      return;
    }
    this.getNavigationRoute(clientId, swarmName).clear();
  };

  /**
   * Disposes of the navigation route for a client and swarm.
   * Removes the memoized route entry, logging the action if info-level logging is enabled.
   */
  public dispose = (clientId: string, swarmName: SwarmName): void => {
    GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO &&
      this.loggerService.info("navigationValidationService dispose", {
        clientId,
        swarmName,
      });
    this.getNavigationRoute.clear(`${clientId}-${swarmName}`);
  };
}

/**
 * Default export of the NavigationValidationService class.
 * Provides a singleton-like instance for validating navigation within the swarm system.
 * @default
*/
export default NavigationValidationService;
