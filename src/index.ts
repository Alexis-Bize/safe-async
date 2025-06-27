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
	logger?: (error: Error) => void;
};

//#endregion
//#region public methods

/**
 * @param {Promise<R>} fn
 * @param {SafeAsyncOptions} [options={ silent: true }]
 * @returns {Promise<SafeAsyncResult<R, E>>}
 */
export const safeAsync = async <R, E extends Error = Error>(
	fn: Promise<R>,
	options: SafeAsyncOptions = { silent: true }
): Promise<SafeAsyncResult<R, E>> => {
	try {
		const result = await fn;
		return [null, result];
	} catch (err) {
		if (options.silent !== true) {
			const logger = options.logger || console.error;
			logger(err as Error);
		}

		return [err as E, null];
	}
};
