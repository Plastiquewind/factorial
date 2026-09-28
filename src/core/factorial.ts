// cache[k] === k!. Grows on demand; each k! is computed exactly once.
const cache: bigint[] = [BigInt(1)];

export function factorialsUpTo(n: number): bigint[] {
  for (let k = cache.length; k <= n; k++) {
    cache.push(cache[k - 1] * BigInt(k));
  }
  return cache.slice(0, n + 1);
}

export function cachedCount(): number {
  return cache.length;
}
