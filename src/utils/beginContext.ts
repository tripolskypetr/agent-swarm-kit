import { AsyncResource } from "async_hooks";
import { ExecutionContextService, MethodContextService } from "../lib";

/**
 * A higher-order function that ensures a provided function executes outside of existing method and execution contexts.
 * Wraps the input function to isolate its execution from any active `MethodContextService` or `ExecutionContextService` contexts,
 * using `AsyncResource` to create a new, untracked async scope when necessary.
 *
 * @template T - The type of the function to be wrapped, extending any function with arbitrary arguments and return type.
 * @param {T} run - The function to execute outside of existing contexts.
 * @returns {(...args: Parameters<T>) => ReturnType<T>} A wrapped function that preserves the original function's signature
 *   and executes it outside of any existing contexts if detected, otherwise runs it directly.
 * @throws {any} Propagates any errors thrown by the wrapped `run` function during execution.
 *
 * @example
 * // Basic usage with a simple logging function
 * const logMessage = (message: string) => console.log(message);
 * const safeLog = beginContext(logMessage);
 * safeLog("Hello, world!"); // Logs "Hello, world!" outside any existing contexts
 *
 * @example
 * // Usage with an async function
 * const fetchData = async (id: number) => {
 *   const response = await fetch(`https://api.example.com/data/${id}`);
 *   return response.json();
 * };
 * const safeFetch = beginContext(fetchData);
 * safeFetch(42).then(data => console.log(data)); // Fetches data in a clean context
 *
 * @remarks
 * This utility leverages `AsyncResource` from Node.js’s `async_hooks` to create a new async scope when either
 * `MethodContextService.hasContext()` or `ExecutionContextService.hasContext()` returns true. This ensures the
 * wrapped function runs in an isolated environment, free from inherited context state, which is critical for operations
 * requiring a clean slate (e.g., resetting tracking in the agent swarm system). If no contexts are active, the function
 * executes directly without overhead. The `resource.emitDestroy()` call ensures proper cleanup of the async resource.
 *
 * @see {@link MethodContextService} for details on method-level context tracking.
 * @see {@link ExecutionContextService} for details on execution-level context tracking.
 * @see {@link https://nodejs.org/api/async_hooks.html#class-asyncresource|Node.js AsyncResource} for underlying mechanics.
 */
export const beginContext =
  <T extends (...args: any[]) => any>(
    run: T
  ): ((...args: Parameters<T>) => ReturnType<T>) =>
  (...args: Parameters<T>): ReturnType<T> => {
    if (
      MethodContextService.hasContext() ||
      ExecutionContextService.hasContext()
    ) {
      const resource = new AsyncResource("UNTRACKED");
      const result = resource.runInAsyncScope(() => run(...args));
      resource.emitDestroy();
      return result;
    }
    return run(...args);
  };

export default beginContext;
