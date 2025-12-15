import * as z from 'zod';

export type ZodBindingRecord = z.ZodType<{
  [key: string]: { type: 'uri' | 'literal' | 'typed-literal'; value: unknown };
}>;
export function objectify<
  O extends { [key: string]: { type: string; value: unknown } },
>(thing: O): { [Key in keyof O]: O[Key]['value'] } {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(thing)) {
    result[key] = thing[key as keyof O]?.value;
  }
  return result as { [Key in keyof O]: O[Key]['value'] };
}
