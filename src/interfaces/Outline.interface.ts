export type IOutlineData = any;
export type IOutlineOutput = any;

export interface IOutlineCallbacks<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
    onAttempt?: (args: IOutlineArgs<Data>) => void;
    onDocument?: (result: IOutlineResult<Output, Data>) => void;
    onValidDocument?: (result: IOutlineResult<Output, Data>) => void;
    onInvalidDocument?: (result: IOutlineResult<Output, Data>) => void;
}

export interface IOutlineMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface IOutlineHistory {
  push(...messages: (IOutlineMessage | IOutlineMessage[])[]): Promise<void>;
  clear(): Promise<void>;
  list(): Promise<IOutlineMessage[]>;
}

export interface IOutlineArgs<Data extends IOutlineData = IOutlineData> {
  data: Data;
  attempt: number;
  history: IOutlineHistory;
}

export interface IOutlineValidationArgs<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> extends IOutlineArgs<Data> {
  output: Output;
}

export interface IOutlineValidationFn<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  (args: IOutlineValidationArgs<Output, Data>): void | Promise<void>;
}

export interface IOutlineValidation<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  validate: IOutlineValidation<Output, Data>;
  docDescription?: string;
}

export interface IOutlineResult<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  isValid: boolean;
  executionId: string;
  history: IOutlineMessage[];
  error?: string | null;
  data: Data;
  output: Output | null;
  attempt: number;
}

export interface IOutlineSchema<
  Output extends IOutlineOutput = IOutlineOutput,
  Data extends IOutlineData = IOutlineData
> {
  docDescription?: string;
  outlineName: OutlineName;
  getStructuredOutput(args: IOutlineArgs<Data>): Promise<Output>;
  validations: (
    | IOutlineValidation<Output, Data>
    | IOutlineValidationFn<Output, Data>
  )[];
  maxAttempts?: number;
  callbacks?: IOutlineCallbacks;
}

export type OutlineName = string;
