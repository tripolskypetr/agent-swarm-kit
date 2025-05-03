/**
 * @module StateChangeContract
 * @description Defines an interface for state change event handling using a subject pattern.
 */

import { TSubject } from "functools-kit";
import { StateName } from "../interfaces/State.interface";

/**
 * @interface IStateChangeContract
 * @description Contract for handling state change events, providing a subject to subscribe to state updates.
 */
export interface IStateChangeContract {
  /**
   * @property {TSubject<StateName>} stateChanged
   * @description A subject that emits state names when changes occur, allowing subscribers to react to state updates.
   */
  stateChanged: TSubject<StateName>;
}
