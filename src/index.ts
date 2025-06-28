/**
 * MIT License
 *
 * Copyright (c) 2025 Alexis Bize
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//#region typings

export type SafeAsyncResult<T, K = Error> = [K, null] | [null, T];
export type SafeAsyncOptions = {
  silent?: boolean;
  logger?: (err: Error) => void;
  processError?: (err: Error) => Error | null;
};

//#endregion
//#region public methods

/**
 * Wraps a Promise to return a tuple-based result instead of throwing errors.
 *
 * @param {Promise<R>} fn - The promise to wrap
 * @param {SafeAsyncOptions} [options] - Configuration options
 * @returns {Promise<SafeAsyncResult<R, E>>} A tuple of [err, null] or [null, result]
 */
export const safeAsync = async <R, E extends Error = Error>(
  fn: Promise<R>,
  options: SafeAsyncOptions = {},
): Promise<SafeAsyncResult<R, E>> => {
  try {
    const result = await fn;
    return [null, result];
  } catch (err) {
    const originalErr = err as Error;
    let outputErr: Error = originalErr;
    let shouldLog = options.silent !== true;

    if (typeof options.processError === 'function') {
      const processedResult = options.processError(originalErr);
      if (processedResult === null) {
        shouldLog = false; // Returning null suppresses logging but preserves original error
      } else outputErr = processedResult; // Use the processed/transformed error
    }

    if (shouldLog === true) {
      const logger = options.logger || console.error;
      logger(outputErr);
    }

    return [outputErr as E, null];
  }
};
