import { safeAsync, SafeAsyncResult } from '../src/index';

describe('safeAsync', () => {
  it('should resolve a successful promise', async () => {
    const promise = Promise.resolve('success');
    const result = await safeAsync(promise);
    expect(result).toEqual([null, 'success']);
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
