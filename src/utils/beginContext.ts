import { ExecutionContextService, MethodContextService } from "src/lib";

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
    let fn = run;
    if (MethodContextService.hasContext()) {
      fn = MethodContextService.runOutOfContext(fn);
    }
    if (ExecutionContextService.hasContext()) {
      fn = ExecutionContextService.runOutOfContext(fn);
    }
    return fn(...args);
  };

export default beginContext;
