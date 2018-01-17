import perfStart from "./perf-start";
import { 
  AsyncFn,
  RunFailure,
  RunSuccess,
  RunAttempt
} from './types';
import runAsync from "./run-async";

export default class Task<T> {
  asyncFn: AsyncFn<T>;
  fnArgs: Array<any>;

  constructor(asyncFn: AsyncFn<T>, fnArgs: Array<any> = []) {
    this.asyncFn = asyncFn;
    this.fnArgs = fnArgs;
  }

  perform(): Promise<T> {
    const { asyncFn, fnArgs } = this;

    return runAsync(asyncFn, fnArgs)
  }
}