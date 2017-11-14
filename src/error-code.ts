import { RunAttempt, RunCode } from './types';
import { mean } from './stats';

function timesRun(runStates: Array<any>): number {
  if (runStates == null) {
    return 0;
  }
  return runStates.length || 0;
}

const MAX_RUN_THRESHOLD_ATTEMPTS = 10;
/**
 * By default we give each async function a
 * maximum of 10 attempts to complete
 * @param {*} runStates
 */
function isExceedMaxRunAttempts(runStates: Array<any>): boolean {
  return timesRun(runStates) + 1 >= MAX_RUN_THRESHOLD_ATTEMPTS;
}

const FAST_FAIL_THRESHOLD_MILISECONDS = 5;
const FAIL_FAIL_THRESHOLD_BAYESIAN_LIMIT = 3;
/**
 * We're failing too quickly, I assume this
 * error must be something dumb like programmer
 * error and not an IO error
 * @param {*} runStates
 */
function isFailingTooFast(runStates: Array<RunAttempt<any>>): boolean {
  if (timesRun(runStates) + 1 > FAIL_FAIL_THRESHOLD_BAYESIAN_LIMIT) {
    const durations = runStates.map(({ duration }) => duration);
    const avgDuration = mean(durations);
    return avgDuration < FAST_FAIL_THRESHOLD_MILISECONDS;
  }
  return false;
}

/**
 * Dumb programmer errors are the following:
 *
 * - `ReferenceError`s from blatant typos
 * - `TypeError`s from missing null checks
 *
 * @param {*} error
 */
function isDumbProgrammerError(error: Error): boolean {
  return error instanceof ReferenceError || error instanceof TypeError;
}

export default function errorCode(
  runStates: Array<RunAttempt<any>>,
  error: Error
): RunCode {
  if (isDumbProgrammerError(error)) {
    return 'fail';
  }
  if (isExceedMaxRunAttempts(runStates)) {
    return 'fail';
  }
  if (isFailingTooFast(runStates)) {
    return 'fail';
  }
  return 'running';
}
