# safeasync

A clean, type-safe utility for handling async operations without try-catch blocks. Returns Go-style `[error, data]` tuples with optional custom logging.

## Why?

Stop writing this:

```typescript
try {
  const response = await fetch('/api/data');
  const data = await response.json();
  // handle data
} catch (err) {
  // handle error
}
```

Start writing this:

```typescript
const [err, data] = await safeAsync(fetch('/api/data').then(r => r.json()));
if (err !== null) {
  // handle error
  return;
}

// handle data
```

## Installation

```bash
npm install safeasync
```

## Basic Usage

```typescript
import { safeAsync } from 'safeasync';

async function example() {
  // Basic usage
  const [err, data] = await safeAsync(fetch('/api/users').then(r => r.json()));
  if (err !== null) {
    console.error('Request failed:', err.message);
    return;
  }

  console.log('Success:', data);
}
```

## API

### `safeAsync<T, E>(promise, options?)`

**Parameters:**

- `promise: Promise<T>` - The promise to execute safely
- `options?: SafeAsyncOptions` - Optional configuration

**Returns:** `Promise<[E, null] | [null, T]>`

**Options:**

```typescript
type SafeAsyncOptions = {
  silent?: boolean; // Default: true (no error logging)
  logger?: (err: Error) => void; // Custom logger function
};
```

## Examples

### Basic Error Handling

```typescript
const [err, user] = await safeAsync(getUserById(123));
if (err !== null) {
  console.log('Failed to get user:', err.message);
  return;
}

console.log('User found:', user.name);
```

### With Custom Logging

```typescript
const [err, data] = await safeAsync(fetchData(), {
  silent: false,
  logger: err => console.warn('API Error:', err),
});
```

### Multiple Operations

```typescript
async function processUser(userId: string) {
  const [userError, user] = await safeAsync(getUser(userId));
  if (userError !== null) return { error: 'User not found' };

  const [postsError, posts] = await safeAsync(getUserPosts(user.id));
  if (postsError !== null) return { error: 'Failed to load posts' };

  const [updateError] = await safeAsync(updateUserStats(user.id, posts.length));
  if (updateError !== null) return { error: 'Failed to update stats' };

  return { success: true, user, postsCount: posts.length };
}
```

## Custom Wrappers

### Fetch Wrapper

For common fetch operations, you can create a simple wrapper:

```typescript
import { safeAsync, SafeAsyncOptions, SafeAsyncResult } from 'safeasync';

export const safeFetch = async <T = any>(
  url: string,
  init?: RequestInit,
  options: SafeAsyncOptions = {},
): Promise<SafeAsyncResult<T, Error>> => {
  const fetchPromise = fetch(url, init).then(async response => {
    if (response.ok !== true) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  });

  return safeAsync(fetchPromise, options);
};
```

#### Usage with Fetch Wrapper

```typescript
const [err, users] = await safeFetch<User[]>('/api/users');
if (err !== null) {
  console.error('Failed to fetch users:', err.message);
  return;
}

console.log('Users list:', users);
```

## TypeScript Support

Full TypeScript support with proper type inference:

```typescript
// Types are automatically inferred
const [err, data] = await safeAsync(getUser(123));
// error: Error | null
// data: User | null

// Or specify custom error types
const [err, data] = await safeAsync<User, CustomError>(getUser(123));
// error: CustomError | null
// data: User | null
```

## Comparison with Other Libraries

Unlike other safe async libraries, this implementation:

- ✅ **Consistent behavior** - ALL errors go into the tuple
- ✅ **Modern TypeScript** - Full type safety and inference
- ✅ **Flexible logging** - Custom loggers with silent mode
- ✅ **Simple API** - One function, predictable behavior
- ✅ **No magic** - No special handling of "native" vs "business" errors

## License

MIT
