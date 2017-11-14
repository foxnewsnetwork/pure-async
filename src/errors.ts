import { RunCode } from './types';

export class BrokenAsyncError extends Error {
  constructor(code: RunCode) {
    super(`We don't know how to handle: ${code}`);
    this.name = 'BrokenAsyncError';
  }
}
