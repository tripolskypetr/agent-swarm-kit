import { getErrorMessage } from "functools-kit";
import { errorSubject } from "../config/emitters";
import { AgentName } from "../interfaces/Agent.interface";

/**
 * Wraps schema observer callbacks (onExecute, onOutput, onInit, ...) so a throwing
 * callback cannot reject the queued agent execution. ClientAgent invokes these
 * fire-and-forget from EXECUTE_FN/RUN_FN: an uncaught throw there becomes an
 * unhandled rejection and the pending waitForOutput hangs forever.
 * Callbacks are observers — log the error and keep the flow running.
 */
export const guardAgentCallbacks = <T extends object>(
  callbacks: T | undefined,
  agentName: AgentName
): Partial<T> => {
  if (!callbacks) {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(callbacks)) {
    if (typeof value !== "function") {
      result[key] = value;
      continue;
    }
    result[key] = (...args: unknown[]) => {
      try {
        const output = value(...args);
        if (output && typeof output.catch === "function") {
          output.catch((error: unknown) =>
            console.error(
              `agent-swarm ${key} agent callback error agentName=${agentName} error=${getErrorMessage(
                error
              )}`
            )
          );
        }
        return output;
      } catch (error) {
        console.error(
          `agent-swarm ${key} agent callback error agentName=${agentName} error=${getErrorMessage(
            error
          )}`
        );
      }
    };
  }
  return result as Partial<T>;
};

/**
 * Wraps a schema transformer hook (transform/map/mapToolCalls/prompt/systemDynamic).
 * A throwing transformer is a configuration error: it is surfaced to the caller
 * through errorSubject (session.complete/execute reject after the exchange), while
 * the flow continues with the untouched input value — falling back to an empty
 * result here would re-enter the resurrect path whose own transform call throws
 * again, deadlocking the execution.
 *
 * @param fn - The user transformer to guard.
 * @param name - Hook name for logging.
 * @param agentName - Owning agent name for logging.
 * @param getClientId - Extracts clientId from the call arguments for errorSubject.
 * @param getFallback - Produces the fallback result from the call arguments.
 */
export const guardAgentTransformer = <F extends (...args: any[]) => any>(
  fn: F,
  name: string,
  agentName: AgentName,
  getClientId: (...args: Parameters<F>) => string,
  getFallback: (...args: Parameters<F>) => Awaited<ReturnType<F>>
): F =>
  (async (...args: Parameters<F>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(
        `agent-swarm ${name} hook error agentName=${agentName} error=${getErrorMessage(
          error
        )}`
      );
      await errorSubject.next([getClientId(...args), error as Error]);
      return getFallback(...args);
    }
  }) as F;
