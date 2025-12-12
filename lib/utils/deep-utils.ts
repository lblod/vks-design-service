export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

/** Like Object.assign but recurses into nested objects and returns a copy **/
export function deepAssign<T extends object>(
  target: T,
  source: DeepPartial<T>,
): T {
  if (!target || !source) {
    return target;
  }
  const firstPass = Object.assign(
    {} as DeepPartial<T>,
    target as DeepPartial<T>,
    source,
  );
  for (const key in firstPass) {
    if (firstPass[key] && typeof firstPass[key] === 'object') {
      // @ts-expect-error I can't think of a way to get this to work
      firstPass[key] = deepAssign(target[key], source[key]);
    }
  }
  return firstPass as T;
}
