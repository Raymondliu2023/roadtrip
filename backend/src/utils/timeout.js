/**
 * Timeout utility for Promise timeout enforcement
 */

/**
 * Wrap a promise with a timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Promise that rejects on timeout
 */
export function withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error(`${errorMessage} after ${timeoutMs}ms`);
        error.code = 'TIMEOUT';
        error.timeout = timeoutMs;
        reject(error);
      }, timeoutMs);
    }),
  ]);
}

/**
 * Execute multiple promises with individual timeouts
 * @param {Array<Promise>} promises - Array of promises
 * @param {number} timeoutMs - Timeout in milliseconds per promise
 * @returns {Promise<Array>} Promise.allSettled results
 */
export async function withTimeoutAll(promises, timeoutMs) {
  const wrappedPromises = promises.map((promise, index) =>
    withTimeout(promise, timeoutMs, `Promise ${index} timed out`)
  );
  return Promise.allSettled(wrappedPromises);
}

/**
 * Execute a function with timeout
 * @param {Function} fn - Async function to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {Array} args - Arguments to pass to function
 * @returns {Promise} Promise that rejects on timeout
 */
export async function executeWithTimeout(fn, timeoutMs, ...args) {
  return withTimeout(fn(...args), timeoutMs, `Function ${fn.name} timed out`);
}

/**
 * Create a delay promise (for testing)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a promise with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts
 * @param {number} options.initialDelay - Initial delay in ms
 * @param {number} options.maxDelay - Maximum delay in ms
 * @param {number} options.timeout - Timeout per attempt in ms
 * @returns {Promise} Promise that resolves or rejects after retries
 */
export async function retryWithBackoff(
  fn,
  { maxRetries = 3, initialDelay = 100, maxDelay = 5000, timeout = null } = {}
) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (timeout) {
        return await withTimeout(fn(), timeout, `Retry attempt ${attempt} timed out`);
      }
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const backoffDelay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        await delay(backoffDelay);
      }
    }
  }

  throw lastError;
}

export default {
  withTimeout,
  withTimeoutAll,
  executeWithTimeout,
  delay,
  retryWithBackoff,
};
