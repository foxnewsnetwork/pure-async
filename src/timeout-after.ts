const DEFAULT_DURATION = 6666;

class TimeoutError extends Error {
  constructor(duration: number) {
    super(`Our promise failed to resolve after ${duration}ms`);
    this.name = 'TimeoutError';
  }
}
export default function timeoutAfter<T>(
  promise: Promise<T>,
  duration: number = DEFAULT_DURATION
): Promise<T> {
  const btfoPromise: Promise<T> = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(duration));
    }, duration);
  });
  return Promise.race([promise, btfoPromise]);
}
