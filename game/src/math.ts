const powCache: Record<number, number> = {};
export function cachedPow2(exponent: number) {
  return powCache[exponent] ?? (powCache[exponent] = Math.pow(2, exponent));
}
