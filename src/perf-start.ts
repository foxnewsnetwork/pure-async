import { StopWatchFn } from './types';

const loadTime = Date.now();
function now(): number {
  if (typeof window === 'object' && typeof window.performance === 'object') {
    return window.performance.now();
  } else {
    return Date.now() - loadTime;
  }
}

export default function perfStart(): StopWatchFn {
  const timeStart = now();
  return () => now() - timeStart;
}
