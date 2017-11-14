export type RunCode = 'success' | 'fail' | 'running';

export type StopWatchFn = () => number;

export type AsyncFn<T> = (...args: Array<any>) => Promise<T>;

export type RunAttempt<T> = RunSuccess<T> | RunFailure;

export type RunSuccess<T> = {
  duration: number;
  code: RunCode;
  result: T;
};

export type RunFailure = {
  duration: number;
  code: RunCode;
  error: Error;
};

export interface AsyncState<T> {
  runAttempts: Array<RunAttempt<T>>;
  code: RunCode;
  result?: T;
  error?: Error;
}

export interface FailStateFn<T> {
  (
    prevResults: Array<RunAttempt<T>>,
    stopFn: StopWatchFn,
    error: Error
  ): RunFailure;
}

export interface SuccessStateFn<T> {
  (
    prevResults: Array<RunAttempt<T>>,
    stopFn: StopWatchFn,
    result: T
  ): RunSuccess<T>;
}
