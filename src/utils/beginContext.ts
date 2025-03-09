import { AsyncResource } from "async_hooks";
import { ExecutionContextService, MethodContextService } from "../lib";

/**
 * A higher-order function that ensures execution outside of existing method and execution contexts.
 *
 * @template T - Generic type extending any function
 * @param {T} run - The function to be executed outside of existing contexts
 * @returns {(...args: Parameters<T>) => ReturnType<T>} A wrapped function that executes outside of any existing contexts
 *
 * @example
 * const myFunction = (arg: string) => console.log(arg);
 * const contextSafeFunction = beginContext(myFunction);
 * contextSafeFunction('test'); // Executes myFunction outside of any existing contexts
 *
 * @remarks
 * This utility function checks for both MethodContext and ExecutionContext.
 * If either context exists, the provided function will be executed outside of those contexts.
 * This is useful for ensuring clean execution environments for certain operations.
 */
export const beginContext =
  <T extends (...args: any[]) => any>(
    run: T
  ): ((...args: Parameters<T>) => ReturnType<T>) =>
  (...args: Parameters<T>): ReturnType<T> => {
    if (MethodContextService.hasContext()) {
      return new AsyncResource("UNTRACKED").runInAsyncScope(() => run(...args));
    }
    if (ExecutionContextService.hasContext()) {
      return new AsyncResource("UNTRACKED").runInAsyncScope(() => run(...args));
    }
    return run(...args);
  };

export default beginContext;
