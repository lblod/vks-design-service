import * as z from 'zod';
export function queryResultSchema<S extends z.ZodType>(bindingSchema: S) {
  return z.strictObject({
    head: z.strictObject({
      link: z.array(z.strictObject({})),
      vars: z.array(z.string()),
    }),
    results: z.strictObject({
      distinct: z.boolean(),
      ordered: z.boolean(),
      bindings: bindingSchema,
    }),
  });
}
