/**
 * @module StateChangeContract
 * Defines an interface for state change event handling using a subject pattern.
*/

import { TSubject } from "functools-kit";
import { StateName } from "../interfaces/State.interface";

/**
 * @interface IStateChangeContract
 * Contract for handling state change events, providing a subject to subscribe to state updates.
*/
export interface IStateChangeContract {
  /**
   * A subject that emits state names when changes occur, allowing subscribers to react to state updates.
   * Provides reactive state change notifications throughout the system.
   */
  stateChanged: TSubject<StateName>;
}
