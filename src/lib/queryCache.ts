interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  promise?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();

const STALE_MS = 60_000; // 1 minute fresh
const MAX_AGE_MS = 5 * 60_000; // 5 minutes max

export function getQuery<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (entry) {
    if (entry.promise) {
      return entry.promise;
    }
    if (now - entry.fetchedAt < STALE_MS) {
      return Promise.resolve(entry.data);
    }
  }

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, fetchedAt: Date.now() });
      return data;
    })
    .catch((err) => {
      // Remove bad entry so retry can happen
      cache.delete(key);
      throw err;
    });

  cache.set(key, { data: entry?.data as T, fetchedAt: entry?.fetchedAt ?? 0, promise });
  return promise;
}

export function setQuery<T>(key: string, data: T): void {
  cache.set(key, { data, fetchedAt: Date.now() });
}

export function invalidateQueries(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function clearQueryCache(): void {
  cache.clear();
}