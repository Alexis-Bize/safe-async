import { safeAsync, SafeAsyncResult } from '../src/index';

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
    console.log(err, res)
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
    await safeAsync(promise);
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

  it('should use custom logger if provided', async () => {
    const error = new Error('fail');
    const promise = Promise.reject(error);
    const logger = jest.fn();
    await safeAsync(promise, { silent: false, logger });
    expect(logger).toHaveBeenCalledWith(error);
  });
});
