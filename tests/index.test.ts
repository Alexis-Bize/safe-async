import { safeAsync, type SafeAsyncResult } from '../src/index';

describe('safeAsync', () => {
  it('should resolve a successful promise', async () => {
    const promise = Promise.resolve('success');
    const result = await safeAsync(promise);
    expect(result).toEqual([null, 'success']);
  });

  describe('safeAsync with real network requests', () => {
    it('should fetch google.com successfully', async () => {
      const [err, res] = await safeAsync(fetch('https://google.com'));
      expect(err).toBeNull();
      expect(res).toBeDefined();
      if (res) {
        expect(res.ok).toBe(true);
        const text = await res.text();
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(0);
      }
    });

    it('should fail to fetch invalid.domain', async () => {
      const [err, res] = await safeAsync(fetch('http://invalid.domain'));
      console.log(err, res);
      expect(res).toBeNull();
      expect(err).toBeTruthy();
      expect(err).toBeTruthy();
      expect(typeof err?.name).toBe('string');
      expect(typeof err?.message).toBe('string');
      expect(['TypeError', 'FetchError']).toContain(err?.name);
    });
  });

  it('should handle a rejected promise', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const result = await safeAsync(promise);
    expect(result[0]).toBe(error);
    expect(result[1]).toBeNull();
  });

  it('should not log error when silent is true (default)', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await safeAsync(promise, { silent: true });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should log error when silent is false', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await safeAsync(promise, { silent: false });
    expect(spy).toHaveBeenCalledWith(error);
    spy.mockRestore();
  });

  it('should log error by default (silent is true by default)', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await safeAsync(promise);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should use custom logger if provided', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const logger = jest.fn();
    await safeAsync(promise, { silent: false, logger });
    expect(logger).toHaveBeenCalledWith(error);
  });

  describe('processError option', () => {
    it('should transform error when processError returns a new error', async () => {
      const originalError = new Error('original error');
      const promise = Promise.reject(originalError);
      const transformedError = new Error('transformed error');

      const processError = jest.fn().mockReturnValue(transformedError);
      const logger = jest.fn();
      const result = await safeAsync(promise, { silent: false, logger, processError });

      expect(processError).toHaveBeenCalledWith(originalError);
      expect(logger).toHaveBeenCalledWith(transformedError);
      expect(result[0]).toBe(transformedError);
      expect(result[1]).toBeNull();
    });

    it('should suppress logging when processError returns null', async () => {
      const error = new Error('should not be logged');
      const promise = Promise.reject(error);

      const processError = jest.fn().mockReturnValue(null);
      const logger = jest.fn();

      const result = await safeAsync(promise, {
        silent: false,
        logger,
        processError,
      });

      expect(processError).toHaveBeenCalledWith(error);
      expect(logger).not.toHaveBeenCalled();
      expect(result[0]).toBe(error); // Original error is still returned
      expect(result[1]).toBeNull();
    });

    it('should preserve original error when processError returns null', async () => {
      const originalError = new Error('original error');
      const promise = Promise.reject(originalError);

      const processError = jest.fn().mockReturnValue(null);

      const result = await safeAsync(promise, { processError });

      expect(result[0]).toBe(originalError);
      expect(result[1]).toBeNull();
    });

    it('should handle conditional error processing', async () => {
      const networkError = new Error('network error');
      const authError = new Error('401 Unauthorized');

      const processError = jest.fn().mockImplementation((err: Error) => {
        if (err.message.includes('401')) {
          return null; // Suppress auth errors
        } else if (err.message.includes('network')) {
          return new Error('Connection failed'); // Transform network errors
        } else return err; // Keep other errors as-is
      });

      const logger = jest.fn();

      // Test network error transformation
      const [networkErr, networkRes] = await safeAsync(Promise.reject(networkError), {
        silent: false,
        logger,
        processError,
      });

      expect(networkErr?.message).toBe('Connection failed');
      expect(logger).toHaveBeenCalledWith(networkErr);

      // Test auth error suppression
      const [authErr, authRes] = await safeAsync(Promise.reject(authError), { silent: false, logger, processError });

      expect(authErr).toBe(authError);
      expect(logger).toHaveBeenCalledTimes(1); // Only called once for network error
    });

    it('should work with silent mode and processError', async () => {
      const error = new Error('test error');
      const promise = Promise.reject(error);

      const processError = jest.fn().mockReturnValue(new Error('processed error'));
      const logger = jest.fn();

      // Should not log even with processError when silent is true
      await safeAsync(promise, { silent: true, logger, processError });

      expect(processError).toHaveBeenCalledWith(error);
      expect(logger).not.toHaveBeenCalled();
    });
  });
});
