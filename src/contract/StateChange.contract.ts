import { TSubject } from "functools-kit";
import { StateName } from "../interfaces/State.interface";

export interface IStateChangeContract {
    stateChanged: TSubject<StateName>;
}
