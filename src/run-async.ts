/**
 * Executes a pure `async function` and retries
 * when encountering failures
 */

type AsyncFn<T> = (...args: Array<any>) => Promise<T>;

type RunCode = 'success' | 'fail' | 'running';

type RunAttempt<T> = {
  duration: number,
  code: RunCode,
  result?: T,
  error?: Error
};

interface AsyncState<T> {
  runAttempts: Array<RunAttempt<T>>
  code: RunCode
  result?: T,
  error?: Error
}

type AdvanceStateFn<T> = (state: AsyncState<T>) => AsyncState<T>;

async function _runAsync<T>(
  asyncFn: AsyncFn<T>, 
  args: Array<any>, 
  failStateFn: AdvanceStateFn<T>, 
  successStateFn: AdvanceStateFn<T>
): Promise<AsyncState<T>> {
  
}