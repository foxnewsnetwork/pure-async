import sinon from 'sinon';
import runAsync from '../src/run-async';

const waitMS = n => new Promise(resolve => setTimeout(resolve, n));

describe('runAsync', () => {
  describe('running to completion', () => {
    let okFn;
    let actualResult;
    beforeEach(async () => {
      okFn = sinon.spy(async n => {
        await waitMS(n);
        return `${n} Praise Jesus, our Lord and Savior`;
      });
      actualResult = await runAsync(okFn, [77]);
    });
    test('should run to completion', () => {
      expect(actualResult).toEqual('77 Praise Jesus, our Lord and Savior');
    });
    test('should only be called once', () => {
      expect(okFn.callCount).toEqual(1);
    });
  });
  describe('completing indeterministic failing functions', () => {
    let mediocreFn;
    let actualResult;
    function TryAgainError(message) {
      this.message = message;
      this.name = 'TryAgainError';
    }
    beforeEach(async () => {
      let n = 0;
      mediocreFn = sinon.spy(async () => {
        n += 1;
        await waitMS(10);
        if (n < 4) {
          throw new TryAgainError('Please try again');
        }
        return `Success after ${n}`;
      });
      actualResult = await runAsync(mediocreFn);
    });
    test('should have ran to completion despite errors', () => {
      expect(actualResult).toEqual('Success after 4');
    });
    test('should have been called 4 times', () => {
      expect(mediocreFn.callCount).toEqual(4);
    });
  });
  describe('failing too fast', () => {
    function FastFailLuciferError(message) {
      this.message = message;
      this.name = 'FastFailLuciferError';
    }
    let fastErrorFn;
    let caughtError;
    beforeEach(async () => {
      fastErrorFn = sinon.spy(async n => {
        throw new FastFailLuciferError(`${n} God is a lie`);
      });
      try {
        await runAsync(fastErrorFn, [666]);
      } catch (er) {
        caughtError = er;
      }
    });
    test('should be giving me the right error', () => {
      expect(caughtError).toBeInstanceOf(FastFailLuciferError);
    });
    test('should have the right message', () => {
      expect(caughtError.message).toEqual('666 God is a lie');
    });
    test('should have attempted to run 4 times', () => {
      expect(fastErrorFn.callCount).toEqual(4);
    });
  });
  describe('max attempt exceeded', () => {
    function MaxAttemptSatanError(message) {
      this.message = message;
      this.name = 'MaxAttemptSatanError';
    }
    let attemptsErrorFn;
    let caughtError;
    beforeEach(async () => {
      attemptsErrorFn = sinon.spy(async n => {
        await waitMS(10);
        throw new MaxAttemptSatanError(`${n} hail satan xXx`);
      });
      try {
        await runAsync(attemptsErrorFn, [666]);
      } catch (e) {
        caughtError = e;
      }
    });
    test('should throw the right error', () => {
      expect(caughtError).toBeInstanceOf(MaxAttemptSatanError);
    });
    test('should have the correct message', () => {
      expect(caughtError.message).toEqual('666 hail satan xXx');
    });
    test('should have called the function 10 times', () => {
      expect(attemptsErrorFn.callCount).toEqual(10);
    });
  });
  describe('dumb programmer', () => {
    describe('refError', () => {
      async function refError() {
        hailSatan666; // eslint-disable-line
      }
      test('should throw the expected error', async () => {
        try {
          await runAsync(refError);
        } catch (error) {
          expect(error).toBeInstanceOf(ReferenceError);
        }
      });
    });

    describe('nullError', () => {
      async function nullError() {
        let xxx; // eslint-disable-line
        xxx.jfoasuhfuahsd(); // eslint-disable-line
      }

      test('calling it straight should give error', async () => {
        let err;
        try {
          await nullError();
        } catch (error) {
          err = error;
        }
        expect(err).toBeInstanceOf(TypeError);
      });

      test('should throw the expected error', async () => {
        let err;
        try {
          await runAsync(nullError);
        } catch (error) {
          err = error;
        }
        expect(err).toBeInstanceOf(TypeError);
      });
    });
  });
});
