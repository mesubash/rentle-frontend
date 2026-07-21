/**
 * Share one in-flight request between concurrent callers and briefly reuse its result.
 *
 * The API client sets `cache: "no-store"` on every request, so two components asking for
 * the same thing on the same page issue two round trips. This closes that gap for reads
 * that are safe to share, without introducing a cache library.
 *
 * Failures are never cached — a rejected promise is evicted so the next caller retries.
 * Anything mutated elsewhere must call `invalidate` (or `clear`) to drop the entry.
 */
export function sharedRead<T>(load: (key: string) => Promise<T>, ttlMs: number) {
  const entries = new Map<string, { at: number; promise: Promise<T> }>();

  const read = (key: string): Promise<T> => {
    const hit = entries.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit.promise;

    const promise = load(key).catch((error) => {
      entries.delete(key);
      throw error;
    });
    entries.set(key, { at: Date.now(), promise });
    return promise;
  };

  read.invalidate = (key: string) => entries.delete(key);
  read.clear = () => entries.clear();
  return read;
}
