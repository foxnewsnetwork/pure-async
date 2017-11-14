import perfStart from './perf-start';
import {
  RunCode,
  StopWatchFn,
  FailStateFn,
  SuccessStateFn,
  AsyncFn,
  RunFailure,
  RunSuccess,
  RunAttempt
} from './types';
import { BrokenAsyncError } from './errors';
import errorCode from './error-code';

/**
 * Executes a pure `async function` and retries
 * when encountering failures
 */
export async function _runAsync<T>(
  asyncFn: AsyncFn<T>,
  args: Array<any>,
  failStateFn: FailStateFn<T>,
  successStateFn: SuccessStateFn<T>
): Promise<RunAttempt<T>> {
  const runResults: Array<RunAttempt<T>> = [];

  while (true) {
    const stopFn = perfStart();
    let nextResult: RunAttempt<T>;
    try {
      const success = await asyncFn(...args);
      nextResult = successStateFn(runResults, stopFn, success);
    } catch (error) {
      nextResult = failStateFn(runResults, stopFn, error);
    }
    runResults.push(nextResult);
    if (nextResult.code !== 'running') {
      return nextResult;
    }
  }
}

function defaultRunSpecFailFn<T>(
  prevStates: Array<RunAttempt<T>>,
  stopFn: StopWatchFn,
  error: Error
): RunFailure {
  return {
    duration: stopFn(),
    error,
    code: errorCode(prevStates, error)
  };
};

function defaultRunSpecSuccessFn<T>(
  prevStates: Array<RunAttempt<T>>,
  stopFn: StopWatchFn,
  result: T
): RunSuccess<T> {
  return {
    duration: stopFn(),
    result,
    code: 'success'
  }
}

export default async function runAsync<T>(
  asyncFn: AsyncFn<T>,
  args: Array<any> = [],
  failStateFn: FailStateFn<T> = defaultRunSpecFailFn,
  successStateFn: SuccessStateFn<T> = defaultRunSpecSuccessFn
): Promise<T> {
  const runAttempt = await _runAsync(asyncFn, args, failStateFn, successStateFn);
  if (runAttempt.code === 'fail') {
    const { error } = (runAttempt as RunFailure);
    throw error;
  }
  if (runAttempt.code === 'success') {
    const { result } = (runAttempt as RunSuccess<T>);
    return result;
  }
  throw new BrokenAsyncError(runAttempt.code);
};
